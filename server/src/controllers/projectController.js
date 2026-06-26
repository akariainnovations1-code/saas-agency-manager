const { Project, Client, Task, Activity, User } = require('../models');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: Client },
        { 
          model: Task,
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'avatar', 'role'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error);
    return res.status(500).json({ message: 'Failed to fetch projects.' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, status, progress, startDate, endDate, budget, clientId, milestones } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({ message: 'Project Name and Client ID are required.' });
    }

    const project = await Project.create({
      name,
      description,
      status: status || 'Planning',
      progress: progress || 0,
      startDate,
      endDate,
      budget: budget || 0.00,
      clientId,
      milestones: milestones || '[]'
    });

    await Activity.create({
      type: 'PROJECT',
      action: 'Created Project',
      details: `${req.user.name} launched project "${name}" with budget of ₹${parseFloat(budget || 0).toLocaleString('en-IN')}.`,
      userId: req.user.id
    });

    // Return with populated client
    const populated = await Project.findByPk(project.id, { include: [Client] });
    return res.status(201).json(populated);
  } catch (error) {
    console.error('Create Project Error:', error);
    return res.status(500).json({ message: 'Failed to create project.' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, progress, startDate, endDate, budget, milestones } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(444).json({ message: 'Project not found.' });
    }

    await project.update({
      name: name || project.name,
      description: description || project.description,
      status: status || project.status,
      progress: progress !== undefined ? progress : project.progress,
      startDate: startDate || project.startDate,
      endDate: endDate || project.endDate,
      budget: budget !== undefined ? budget : project.budget,
      milestones: milestones !== undefined ? milestones : project.milestones
    });

    await Activity.create({
      type: 'PROJECT',
      action: 'Updated Project',
      details: `${req.user.name} updated project details for "${project.name}".`,
      userId: req.user.id
    });

    const populated = await Project.findByPk(project.id, {
      include: [Client, { model: Task, include: [{ model: User, as: 'assignee' }] }]
    });

    return res.json(populated);
  } catch (error) {
    console.error('Update Project Error:', error);
    return res.status(500).json({ message: 'Failed to update project.' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(444).json({ message: 'Project not found.' });
    }

    const projectName = project.name;
    await project.destroy();

    await Activity.create({
      type: 'PROJECT',
      action: 'Deleted Project',
      details: `${req.user.name} deleted project "${projectName}".`,
      userId: req.user.id
    });

    return res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return res.status(500).json({ message: 'Failed to delete project.' });
  }
};
