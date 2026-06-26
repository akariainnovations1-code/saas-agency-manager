const { Task, Project, User, Activity } = require('../models');

// Recalculates and updates the project's progress based on task completions
const autoUpdateProjectProgress = async (projectId) => {
  if (!projectId) return;
  try {
    const tasks = await Task.findAll({ where: { projectId } });
    if (tasks.length === 0) return;
    
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const progressPercent = Math.round((completedTasks / tasks.length) * 100);
    
    await Project.update(
      { progress: progressPercent },
      { where: { id: projectId } }
    );
    console.log(`🤖 [Automation] Project ${projectId} progress auto-calculated to ${progressPercent}%`);
  } catch (error) {
    console.error('Error auto-updating project progress:', error);
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: Project, attributes: ['id', 'name', 'status'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json(tasks);
  } catch (error) {
    console.error('Get Tasks Error:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { name, description, priority, status, dueDate, projectId, assignedTo } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ message: 'Task Name and Project ID are required.' });
    }

    const task = await Task.create({
      name,
      description,
      priority: priority || 'Medium',
      status: status || 'Todo',
      dueDate,
      projectId,
      assignedTo: assignedTo || null,
      comments: '[]'
    });

    let assignedUserName = 'unassigned';
    if (assignedTo) {
      const user = await User.findByPk(assignedTo);
      if (user) assignedUserName = user.name;
    }

    // Workflow Automation log
    await Activity.create({
      type: 'TASK',
      action: 'Created Task',
      details: `${req.user.name} created task "${name}" and assigned to ${assignedUserName}.`,
      userId: req.user.id
    });

    // Auto-recalculate progress
    await autoUpdateProjectProgress(projectId);

    const populated = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name', 'status'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar', 'role'] }
      ]
    });

    return res.status(201).json(populated);
  } catch (error) {
    console.error('Create Task Error:', error);
    return res.status(500).json({ message: 'Failed to create task.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priority, status, dueDate, assignedTo } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(444).json({ message: 'Task not found.' });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo;

    await task.update({
      name: name || task.name,
      description: description !== undefined ? description : task.description,
      priority: priority || task.priority,
      status: status || task.status,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo
    });

    // Status Change Automation triggers:
    if (status && oldStatus !== status) {
      await Activity.create({
        type: 'TASK',
        action: 'Updated Status',
        details: `${req.user.name} moved task "${task.name}" from ${oldStatus} to ${status}.`,
        userId: req.user.id
      });
      // Recalculate progress of parent project
      await autoUpdateProjectProgress(task.projectId);
    }

    // Assignee Change Automation trigger:
    if (assignedTo !== undefined && oldAssignee !== assignedTo) {
      let assigneeName = 'Unassigned';
      if (assignedTo) {
        const u = await User.findByPk(assignedTo);
        if (u) assigneeName = u.name;
      }
      await Activity.create({
        type: 'TASK',
        action: 'Assigned Task',
        details: `${req.user.name} reassigned task "${task.name}" to ${assigneeName}.`,
        userId: req.user.id
      });
    }

    const populated = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name', 'status'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar', 'role'] }
      ]
    });

    return res.json(populated);
  } catch (error) {
    console.error('Update Task Error:', error);
    return res.status(500).json({ message: 'Failed to update task.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(444).json({ message: 'Task not found.' });
    }

    const taskName = task.name;
    const projectId = task.projectId;
    await task.destroy();

    await Activity.create({
      type: 'TASK',
      action: 'Deleted Task',
      details: `${req.user.name} deleted task "${taskName}".`,
      userId: req.user.id
    });

    // Re-calculate project progress after task deletion
    await autoUpdateProjectProgress(projectId);

    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
};

exports.addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(444).json({ message: 'Task not found.' });
    }

    const comments = JSON.parse(task.comments || '[]');
    const newComment = {
      user: req.user.name,
      date: new Date().toISOString().split('T')[0],
      text
    };
    comments.push(newComment);

    await task.update({ comments: JSON.stringify(comments) });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error('Add Task Comment Error:', error);
    return res.status(500).json({ message: 'Failed to add task comment.' });
  }
};
