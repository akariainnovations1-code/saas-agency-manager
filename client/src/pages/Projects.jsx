import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Calendar, DollarSign, Edit2, Trash2, 
  X, CheckSquare, ListTodo, Award, Sparkles 
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const { projects, clients, addProject, editProject, removeProject } = useData();

  // Dialog Controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeEditProject, setActiveEditProject] = useState(null);
  const [selectedMilestoneProject, setSelectedMilestoneProject] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planning');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);
  const [clientId, setClientId] = useState('');

  // Milestone Add state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('Planning');
    setProgress(0);
    setStartDate('');
    setEndDate('');
    setBudget(0);
    setClientId(clients[0]?.id || '');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!clientId && clients.length > 0) {
      alert('Please select or onboard a CRM client first.');
      return;
    }
    
    await addProject({
      name, description, status, progress, startDate, endDate, budget,
      clientId: clientId || clients[0]?.id,
      milestones: '[]'
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeEditProject) return;
    await editProject(activeEditProject.id, {
      name, description, status, progress, startDate, endDate, budget
    });
    setActiveEditProject(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will permanently erase its tasks.')) {
      await removeProject(id);
    }
  };

  // Milestone check toggles
  const handleToggleMilestone = async (project, milestoneId) => {
    const miles = JSON.parse(project.milestones || '[]');
    const updatedMiles = miles.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
    
    // Auto-calculate new progress based on milestones checked!
    // This is a premium workflow automation: milestone completion recalculates project progress!
    const completedCount = updatedMiles.filter(m => m.completed).length;
    const computedProgress = Math.round((completedCount / updatedMiles.length) * 100);

    const stringified = JSON.stringify(updatedMiles);
    await editProject(project.id, {
      milestones: stringified,
      progress: computedProgress
    });

    // Mirror updates inside the open milestone dialog
    if (selectedMilestoneProject?.id === project.id) {
      setSelectedMilestoneProject(prev => ({
        ...prev,
        milestones: stringified,
        progress: computedProgress
      }));
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneTitle.trim() || !selectedMilestoneProject) return;

    const miles = JSON.parse(selectedMilestoneProject.milestones || '[]');
    const newMile = {
      id: String(Date.now()),
      title: newMilestoneTitle.trim(),
      completed: false
    };
    miles.push(newMile);

    const stringified = JSON.stringify(miles);
    
    // Auto recalculate progress ratio
    const completedCount = miles.filter(m => m.completed).length;
    const computedProgress = Math.round((completedCount / miles.length) * 100);

    await editProject(selectedMilestoneProject.id, {
      milestones: stringified,
      progress: computedProgress
    });

    setSelectedMilestoneProject(prev => ({
      ...prev,
      milestones: stringified,
      progress: computedProgress
    }));

    setNewMilestoneTitle('');
  };

  const triggerEdit = (p) => {
    setActiveEditProject(p);
    setName(p.name);
    setDescription(p.description || '');
    setStatus(p.status);
    setProgress(p.progress);
    setStartDate(p.startDate || '');
    setEndDate(p.endDate || '');
    setBudget(p.budget);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div>
      
      {/* Action header bar */}
      <div className="filters-bar" style={{ justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          disabled={clients.length === 0}
        >
          <Plus size={16} />
          <span>Launch Project</span>
        </button>
      </div>

      {clients.length === 0 && (
        <div className="badge badge-high" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '24px', textTransform: 'none' }}>
          <span>💡 No client profiles onboarded yet. Please create a Client in the <b>Clients (CRM)</b> tab first before managing projects.</span>
        </div>
      )}

      {/* Grid of Projects */}
      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((p) => (
            <div key={p.id} className="project-card">
              
              <div className="project-card-header">
                <div>
                  <h3 className="project-card-title">{p.name}</h3>
                  <div className="project-card-client">Client: {p.Client?.company || 'Internal Account'}</div>
                </div>
                <span className={`badge ${p.status === 'Completed' ? 'badge-active' : p.status === 'In Progress' ? 'badge-prospect' : p.status === 'On Hold' ? 'badge-high' : 'badge-lead'}`}>
                  {p.status}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', minHeight: '38px', lineClamp: 2 }}>
                {p.description || 'No campaign description entered.'}
              </p>

              {/* Progress visual indicator */}
              <div className="progress-container">
                <div className="progress-header">
                  <span style={{ color: 'var(--text-muted)' }}>Execution Progress</span>
                  <span style={{ color: 'var(--primary)' }}>{p.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="project-card-footer">
                <div className="project-card-dates">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}>
                    <Calendar size={12} />
                    <span>Ends: {p.endDate || 'No Date'}</span>
                  </div>
                </div>
                <span className="project-card-budget">{formatCurrency(p.budget)}</span>
              </div>

              {/* Relational utility commands */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flexGrow: 1, padding: '6px 10px', fontSize: '12px' }}
                  onClick={() => setSelectedMilestoneProject(p)}
                >
                  <ListTodo size={13} />
                  <span>Milestones ({JSON.parse(p.milestones || '[]').length})</span>
                </button>

                <button 
                  className="btn btn-secondary btn-icon" 
                  style={{ width: '32px', height: '32px' }}
                  title="Modify Project"
                  onClick={() => triggerEdit(p)}
                >
                  <Edit2 size={13} />
                </button>
                {user?.role === 'Admin' && (
                  <button 
                    className="btn btn-danger btn-icon" 
                    style={{ width: '32px', height: '32px', backgroundColor: 'var(--priority-high)' }}
                    title="Trash Project"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
            No campaign projects initiated in this directory.
          </div>
        )}
      </div>

      {/* 1. LAUNCH PROJECT MODAL OVERLAY */}
      {showAddModal && (
        <div className="dialog-backdrop">
          <div className="dialog-modal">
            <div className="dialog-header">
              <h3>Launch Project Contract</h3>
              <button className="dialog-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SEO Campaign" />
              </div>
              <div className="form-group">
                <label className="form-label">Client Association *</label>
                <select className="form-select" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Scope</label>
                <textarea className="form-textarea" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe campaign milestones..."></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project Budget (₹)</label>
                  <input type="number" className="form-input" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT PROJECT MODAL OVERLAY */}
      {activeEditProject && (
        <div className="dialog-backdrop">
          <div className="dialog-modal">
            <div className="dialog-header">
              <h3>Edit Project Details</h3>
              <button className="dialog-close" onClick={() => setActiveEditProject(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Project Scope</label>
                <textarea className="form-textarea" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Budget (₹)</label>
                  <input type="number" className="form-input" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Progress Status</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Manual Progress Adjustment ({progress}%)</label>
                <input type="range" className="form-input" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveEditProject(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MILESTONES MANAGEMENT MODAL OVERLAY */}
      {selectedMilestoneProject && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '580px', width: '90%' }}>
            
            <div className="dialog-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: 'var(--primary)' }} />
                  <span>Milestone Checklist Tracker</span>
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedMilestoneProject.name} — Progress: <b>{selectedMilestoneProject.progress}%</b>
                </p>
              </div>
              <button className="dialog-close" onClick={() => setSelectedMilestoneProject(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Checklists area */}
            <div style={{ margin: '20px 0', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {JSON.parse(selectedMilestoneProject.milestones || '[]').length > 0 ? (
                JSON.parse(selectedMilestoneProject.milestones || '[]').map((m) => (
                  <div 
                    key={m.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      backgroundColor: 'var(--surface-hover)', 
                      padding: '12px', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid var(--border)'
                    }}
                    onClick={() => handleToggleMilestone(selectedMilestoneProject, m.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={m.completed} 
                      onChange={() => {}} // handled by parent div click
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                    />
                    <span style={{ 
                      fontSize: '14px', 
                      textDecoration: m.completed ? 'line-through' : 'none',
                      color: m.completed ? 'var(--text-muted)' : 'var(--text)',
                      fontWeight: m.completed ? '500' : '600'
                    }}>
                      {m.title}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No milestones specified for this project timeline yet.
                </div>
              )}
            </div>

            {/* Milestone Creator input bar */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Log a new milestone target (e.g. Figma sign-off, Beta Release)..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
              />
              <button className="btn btn-primary" onClick={handleAddMilestone} style={{ flexShrink: 0, gap: '4px' }}>
                <Sparkles size={14} />
                <span>Add Target</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;
