import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Calendar, AlertTriangle, ArrowRight, ArrowLeft, 
  MessageSquare, User, CheckSquare, Sparkles, X, PlusCircle 
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const { tasks, projects, team, addTask, editTask, removeTask, addTaskComment } = useData();

  // Filters State
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  // Modals Control
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Comment Addition text
  const [newCommentText, setNewCommentText] = useState('');

  // AI Task suggester state variables
  const [aiSelectedProjectId, setAiSelectedProjectId] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPriority('Medium');
    setStatus('Todo');
    setDueDate('');
    setProjectId(projects[0]?.id || '');
    setAssignedTo(team[0]?.id || '');
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!projectId && projects.length > 0) {
      alert('Please launch a project first.');
      return;
    }

    await addTask({
      name, description, priority, status, dueDate,
      projectId: projectId || projects[0]?.id,
      assignedTo: assignedTo || null
    });
    
    resetForm();
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Erase this task card permanently?')) {
      await removeTask(id);
      setSelectedTaskDetails(null);
    }
  };

  // Move task card status left or right
  const handleShiftStatus = async (task, direction) => {
    const statuses = ['Todo', 'In Progress', 'Review', 'Done'];
    const currentIdx = statuses.indexOf(task.status);
    
    let newIdx = currentIdx;
    if (direction === 'right' && currentIdx < 3) newIdx += 1;
    if (direction === 'left' && currentIdx > 0) newIdx -= 1;
    
    if (newIdx !== currentIdx) {
      await editTask(task.id, { status: statuses[newIdx] });
    }
  };

  // Comments addition logger
  const handlePostComment = async () => {
    if (!newCommentText.trim() || !selectedTaskDetails) return;
    
    await addTaskComment(selectedTaskDetails.id, newCommentText.trim());
    
    // Refresh open modal comments cache
    const updatedTask = tasks.find(t => t.id === selectedTaskDetails.id);
    if (updatedTask) {
      const cms = JSON.parse(updatedTask.comments || '[]');
      // Add local simulation to prevent async waiting gaps
      cms.push({
        user: user.name,
        date: new Date().toISOString().split('T')[0],
        text: newCommentText.trim()
      });
      setSelectedTaskDetails(prev => ({
        ...prev,
        comments: JSON.stringify(cms)
      }));
    }
    
    setNewCommentText('');
  };

  // AI Task suggester generator
  const triggerAiSuggestions = () => {
    if (!aiSelectedProjectId) return;
    const proj = projects.find(p => p.id === aiSelectedProjectId);
    if (!proj) return;

    // Custom generative rules based on project name contents
    const pName = proj.name.toLowerCase();
    let recommends = [];

    if (pName.includes('rebrand') || pName.includes('website') || pName.includes('design')) {
      recommends = [
        { name: 'Develop CSS glassmorphism styles sheets', desc: 'Implement premium responsive styles for user dashboards.', priority: 'High' },
        { name: 'Preload responsive SVG charts widget', desc: 'Draw dynamic vectors graphs in clients profile dashboards.', priority: 'Medium' },
        { name: 'Conduct user onboarding audit sessions', desc: 'Perform analytics checks to identify layout speed bottlenecks.', priority: 'Low' }
      ];
    } else if (pName.includes('crm') || pName.includes('security') || pName.includes('data')) {
      recommends = [
        { name: 'Implement Sequelize postgres models schemas', desc: 'Secure database connectors and configure pg pooling dials.', priority: 'High' },
        { name: 'Deploy JSON Web Token cookies authentications', desc: 'Construct encryption decoders for robust session audits.', priority: 'High' },
        { name: 'Write automated unit tests pipelines', desc: 'Setup backend route health checks and models triggers validation.', priority: 'Medium' }
      ];
    } else {
      recommends = [
        { name: 'Draft business operations review proposal', desc: 'Compile project deliverables reports and export P&L details.', priority: 'Medium' },
        { name: 'Schedule stakeholder discovery call sync', desc: 'Align on deliverables timelines and milestone dates.', priority: 'High' },
        { name: 'Prepare analytics growth metrics sheet', desc: 'Aggregate client lead funnels and generate time series trends.', priority: 'Low' }
      ];
    }

    setAiSuggestions(recommends);
  };

  const handleAdoptAiSuggestion = async (sug) => {
    await addTask({
      name: sug.name,
      description: sug.desc,
      priority: sug.priority,
      status: 'Todo',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week due
      projectId: aiSelectedProjectId,
      assignedTo: user.id
    });
    // Remove the adopted suggestion
    setAiSuggestions(prev => prev.filter(item => item.name !== sug.name));
  };

  // Search & Filter arrays
  const filteredTasks = tasks.filter(t => {
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesProject = projectFilter === 'ALL' || t.projectId === projectFilter;
    return matchesPriority && matchesProject;
  });

  const getColTasks = (colName) => {
    return filteredTasks.filter(t => t.status === colName);
  };

  return (
    <div>
      
      {/* Dynamic filters and project scope tool belt */}
      <div className="filters-bar">
        
        <div className="filters-group">
          <select 
            className="form-select" 
            style={{ width: '180px' }}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            className="form-select" 
            style={{ width: '150px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }} disabled={projects.length === 0}>
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {projects.length === 0 && (
        <div className="badge badge-high" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '24px', textTransform: 'none' }}>
          <span>💡 No active projects logged yet. Please launch a Project in the <b>Projects</b> tab first before managing tasks.</span>
        </div>
      )}

      {/* AI task suggest dashboard */}
      {projects.length > 0 && (
        <div className="ai-panel-box">
          <div className="ai-header-group">
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span>AI Operations Copilot</span>
            <span className="ai-pill">Task Suggestions Assistant</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              className="form-select" 
              style={{ width: '250px', backgroundColor: 'var(--surface)' }}
              value={aiSelectedProjectId}
              onChange={(e) => { setAiSelectedProjectId(e.target.value); setAiSuggestions([]); }}
            >
              <option value="">-- Choose Campaign Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="btn btn-secondary" onClick={triggerAiSuggestions} disabled={!aiSelectedProjectId} style={{ padding: '8px 14px', fontSize: '13px' }}>
              Suggest Task Deliverables
            </button>
          </div>

          {aiSuggestions.length > 0 && (
            <div className="ai-suggestions-list">
              {aiSuggestions.map((sug, idx) => (
                <div key={idx} className="ai-suggestion-card">
                  <div>
                    <span className={`badge badge-${sug.priority.toLowerCase()}`} style={{ marginRight: '8px', fontSize: '9px', padding: '2px 6px' }}>{sug.priority}</span>
                    <span style={{ fontWeight: '600' }}>{sug.name}</span>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{sug.desc}</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleAdoptAiSuggestion(sug)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                    Adopt Suggestion
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="kanban-board">
        {['Todo', 'In Progress', 'Review', 'Done'].map((colName) => {
          const colTasks = getColTasks(colName);
          return (
            <div key={colName} className="kanban-col">
              
              <div className="kanban-col-header">
                <span>{colName}</span>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>

              <div className="kanban-cards-wrapper">
                {colTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="kanban-card"
                    onClick={() => setSelectedTaskDetails(task)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                        {task.priority}
                      </span>
                      
                      {/* Navigation cards toggles to prevent drag crashes */}
                      <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                        {colName !== 'Todo' && (
                          <button className="theme-toggle-btn" style={{ width: '20px', height: '20px', padding: 0 }} onClick={() => handleShiftStatus(task, 'left')}>
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {colName !== 'Done' && (
                          <button className="theme-toggle-btn" style={{ width: '20px', height: '20px', padding: 0 }} onClick={() => handleShiftStatus(task, 'right')}>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="kanban-card-title">{task.name}</div>
                    <div className="kanban-card-project">{task.Project?.name || 'Task Card'}</div>

                    <div className="kanban-card-footer">
                      <div className="kanban-card-date">
                        <Calendar size={11} />
                        <span>{task.dueDate || 'No Deadline'}</span>
                      </div>
                      
                      {task.assignee ? (
                        <img src={task.assignee.avatar} alt="Staff" className="kanban-card-assignee" title={`Assigned: ${task.assignee.name}`} />
                      ) : (
                        <div className="kanban-card-assignee" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
                          <User size={12} />
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* 1. LAUNCH TASK MODAL OVERLAY */}
      {showAddModal && (
        <div className="dialog-backdrop">
          <div className="dialog-modal">
            <div className="dialog-header">
              <h3>Create Task Card</h3>
              <button className="dialog-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Task Name *</label>
                <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design mockups" />
              </div>
              <div className="form-group">
                <label className="form-label">Parent Project *</label>
                <select className="form-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Task Scope Description</label>
                <textarea className="form-textarea" rows="2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief specs..."></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Column</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assignee Member</label>
                  <select className="form-select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {team.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. TASK DETAILS & DISCUSSION MODAL OVERLAY */}
      {selectedTaskDetails && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '600px', width: '90%' }}>
            
            <div className="dialog-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div>
                <span className={`badge badge-${selectedTaskDetails.priority.toLowerCase()}`} style={{ fontSize: '10px' }}>
                  {selectedTaskDetails.priority} Priority
                </span>
                <h3 style={{ fontSize: '19px', marginTop: '6px' }}>{selectedTaskDetails.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Project: <b>{selectedTaskDetails.Project?.name}</b></p>
              </div>
              <button className="dialog-close" onClick={() => setSelectedTaskDetails(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Scope desc details */}
            <div style={{ margin: '16px 0' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Task Description</h4>
              <p style={{ fontSize: '13.5px', marginTop: '6px', lineHeight: '1.4' }}>
                {selectedTaskDetails.description || 'No description logged.'}
              </p>
            </div>

            <div className="form-row" style={{ backgroundColor: 'var(--surface-hover)', padding: '12px', borderRadius: '10px', margin: '16px 0', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Deadline Date:</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{selectedTaskDetails.dueDate || 'No Date'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Assigned To:</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>
                  {tasks.find(t => t.id === selectedTaskDetails.id)?.assignee?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Comments log */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={13} />
                <span>Task Discussions ({JSON.parse(selectedTaskDetails.comments || '[]').length})</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0', maxHeight: '180px', overflowY: 'auto' }}>
                {JSON.parse(selectedTaskDetails.comments || '[]').length > 0 ? (
                  JSON.parse(selectedTaskDetails.comments || '[]').map((c, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--surface-hover)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                        <span>{c.user}</span>
                        <span>{c.date}</span>
                      </div>
                      <p style={{ fontSize: '13px' }}>{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '12px 0' }}>No comments logged yet. Start the conversation!</p>
                )}
              </div>

              {/* Comments form */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ask a question or log task status..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                />
                <button className="btn btn-primary" onClick={handlePostComment} style={{ flexShrink: 0 }}>
                  <PlusCircle size={15} />
                  <span>Post</span>
                </button>
              </div>
            </div>

            {/* Trash option */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
              <button className="btn btn-danger" onClick={() => handleDelete(selectedTaskDetails.id)}>
                Delete Card
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
