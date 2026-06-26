import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Plus, Search, Phone, Mail, Globe, Calendar, 
  Trash2, X, ShieldAlert, ArrowRight, ArrowLeft 
} from 'lucide-react';

const Leads = () => {
  const { leads, addLead, editLead, removeLead } = useData();

  const [search, setSearch] = useState('');
  
  // Dialog controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDetailsLead, setActiveDetailsLead] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Website');
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const resetForm = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setSource('Website');
    setStatus('New');
    setNotes('');
    setFollowUpDate('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await addLead({ name, company, email, phone, source, status, notes, followUpDate });
    resetForm();
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this prospect lead?')) {
      await removeLead(id);
      setActiveDetailsLead(null);
    }
  };

  const handleShiftStatus = async (lead, direction) => {
    const funnel = ['New', 'Contacted', 'Qualified', 'Lost'];
    const current = funnel.indexOf(lead.status);
    
    let nextIdx = current;
    if (direction === 'right' && current < 3) nextIdx += 1;
    if (direction === 'left' && current > 0) nextIdx -= 1;

    if (nextIdx !== current) {
      await editLead(lead.id, { status: funnel[nextIdx] });
    }
  };

  const filteredLeads = leads.filter(l => {
    return l.name.toLowerCase().includes(search.toLowerCase()) ||
           l.company.toLowerCase().includes(search.toLowerCase()) ||
           l.email.toLowerCase().includes(search.toLowerCase());
  });

  const getColLeads = (col) => {
    return filteredLeads.filter(l => l.status === col);
  };

  return (
    <div>
      
      {/* Filters bar */}
      <div className="filters-bar">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search leads, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus size={16} />
          <span>Capture Lead</span>
        </button>
      </div>

      {/* Leads Funnel Pipeline columns grid */}
      <div className="kanban-board" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {['New', 'Contacted', 'Qualified', 'Lost'].map((funnelCol) => {
          const funnelLeads = getColLeads(funnelCol);
          return (
            <div key={funnelCol} className="kanban-col" style={{ minHeight: '450px' }}>
              
              <div className="kanban-col-header">
                <span>{funnelCol}</span>
                <span className="kanban-col-count">{funnelLeads.length}</span>
              </div>

              <div className="kanban-cards-wrapper">
                {funnelLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="kanban-card"
                    style={{ borderLeft: `3.5px solid ${
                      funnelCol === 'New' ? 'var(--primary)' :
                      funnelCol === 'Contacted' ? 'var(--status-prospect)' :
                      funnelCol === 'Qualified' ? 'var(--status-active)' : 'var(--text-muted)'
                    }` }}
                    onClick={() => setActiveDetailsLead(lead)}
                  >
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="kanban-card-project" style={{ textTransform: 'uppercase', fontSize: '9px', padding: '1px 5px' }}>
                        {lead.source}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                        {funnelCol !== 'New' && (
                          <button className="theme-toggle-btn" style={{ width: '18px', height: '18px', padding: 0 }} onClick={() => handleShiftStatus(lead, 'left')}>
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {funnelCol !== 'Lost' && (
                          <button className="theme-toggle-btn" style={{ width: '18px', height: '18px', padding: 0 }} onClick={() => handleShiftStatus(lead, 'right')}>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>
                      {lead.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '-4px' }}>
                      {lead.company}
                    </div>

                    {lead.followUpDate && (
                      <div className="kanban-card-footer" style={{ borderTop: 'none', padding: 0, marginTop: '4px' }}>
                        <div className="kanban-card-date" style={{ color: 'var(--status-lead)' }}>
                          <Calendar size={11} />
                          <span>Follow up: {lead.followUpDate}</span>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* 1. LEAD CAPTURE FORM MODAL OVERLAY */}
      {showAddModal && (
        <div className="dialog-backdrop">
          <div className="dialog-modal">
            
            <div className="dialog-header">
              <h3>Capture Prospect Lead</h3>
              <button className="dialog-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Contact Name *</label>
                <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Clark Kent" />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input type="text" className="form-input" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Daily Planet" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="clark@dailyplanet.com" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Acquisition Channel</label>
                  <select className="form-select" value={source} onChange={(e) => setSource(e.target.value)}>
                    <option value="Website">Website Form</option>
                    <option value="LinkedIn">LinkedIn Outreach</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Cold Outreach">Cold Email</option>
                    <option value="Partner">Business Partner</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Next Follow Up</label>
                  <input type="date" className="form-input" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lifecycle Funnel Stage</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Outreach Conversation Journal</label>
                <textarea className="form-textarea" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Discussed software configurations..."></textarea>
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Lead</button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 2. LEAD CONVERSION DETAILS OVERLAY */}
      {activeDetailsLead && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '520px', width: '90%' }}>
            
            <div className="dialog-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-active" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '10px' }}>
                  Acquired: {activeDetailsLead.source}
                </span>
                <h3 style={{ fontSize: '19px', marginTop: '6px' }}>{activeDetailsLead.name}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Company: <b>{activeDetailsLead.company}</b></p>
              </div>
              <button className="dialog-close" onClick={() => setActiveDetailsLead(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div className="form-row" style={{ backgroundColor: 'var(--surface-hover)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Email Address:</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}><Mail size={11} style={{ display: 'inline', marginRight: '4px' }} />{activeDetailsLead.email}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Phone Contact:</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}><Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />{activeDetailsLead.phone || 'N/A'}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Outreach Logs & Notes</h4>
                <p style={{ fontSize: '14px', marginTop: '6px', lineHeight: '1.4', backgroundColor: 'var(--surface-hover)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {activeDetailsLead.notes || 'No outreach journals recorded.'}
                </p>
              </div>

              {activeDetailsLead.followUpDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-lead)', fontWeight: '600', fontSize: '13px' }}>
                  <Calendar size={15} />
                  <span>Scheduled Follow-up Reminders: {activeDetailsLead.followUpDate}</span>
                </div>
              )}

            </div>

            <div className="dialog-footer">
              <button className="btn btn-secondary" onClick={() => setActiveDetailsLead(null)}>Close</button>
              <button className="btn btn-danger" onClick={() => handleDelete(activeDetailsLead.id)}>Erase Lead</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Leads;
