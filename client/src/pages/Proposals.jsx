import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import api from '../utils/api';
import { Award, FileText, Send, Check, Shield, Edit, Plus, Search, X, Zap, Key } from 'lucide-react';

const Proposals = () => {
  const { clients, syncData } = useData();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals & Panels
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(null);

  // New Proposal Form
  const [newProp, setNewProp] = useState({
    clientId: '',
    title: 'Custom SaaS Portal & ERP Integration',
    description: 'Establish standard operational pipelines, configure SQLite/PostgreSQL failovers, design responsive dashboards, and integrate Zoom Calendar APIs.',
    amount: 15000,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days
  });

  // E-Signature Drawing States
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signedBy, setSignedBy] = useState('');
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'type'
  const [typedSign, setTypedSign] = useState('');

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const data = await api('/proposals');
      if (data) setProposals(data);
    } catch (e) {
      console.error('Fetch proposals error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!newProp.clientId || !newProp.title || !newProp.amount || !newProp.validUntil) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      const fresh = await api('/proposals', {
        method: 'POST',
        body: newProp
      });
      if (fresh) {
        setProposals(prev => [fresh, ...prev]);
        setShowAddModal(false);
        syncData();
      }
    } catch (e) {
      console.error('Create proposal error:', e);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const updated = await api(`/proposals/${id}`, {
        method: 'PUT',
        body: { status }
      });
      if (updated) {
        setProposals(prev => prev.map(p => p.id === id ? updated : p));
        if (selectedProposal && selectedProposal.id === id) {
          setSelectedProposal(updated);
        }
      }
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

  // E-Signature Drawing Board Actions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = 'var(--text)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = async () => {
    if (!selectedProposal) return;
    let signatureData = '';

    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL(); // Base64 png representation
    } else {
      if (!typedSign) {
        alert('Please enter your typed signature name.');
        return;
      }
      signatureData = `TYPED:${typedSign}`;
    }

    try {
      const updated = await api(`/proposals/${selectedProposal.id}`, {
        method: 'PUT',
        body: {
          signature: signatureData,
          signedBy: signedBy || 'Authorized Client Rep',
          status: 'Approved'
        }
      });
      if (updated) {
        setProposals(prev => prev.map(p => p.id === selectedProposal.id ? updated : p));
        setSelectedProposal(updated);
        setShowSignModal(false);
        setSignedBy('');
        setTypedSign('');
        syncData();
      }
    } catch (e) {
      console.error('E-sign submit error:', e);
    }
  };

  // Convert approved Proposal to Project & Invoice
  const handleConvertProposal = async (prop) => {
    try {
      const response = await api(`/proposals/${prop.id}/convert`, {
        method: 'POST'
      });
      if (response && response.success) {
        setConversionSuccess({
          proposalTitle: prop.title,
          projectName: response.project.name,
          invoiceNumber: response.invoice.invoiceNumber,
          amount: prop.amount
        });
        setSelectedProposal(null);
        // Refresh proposal status local view
        fetchProposals();
        syncData();
      }
    } catch (e) {
      console.error('Conversion error:', e);
    }
  };

  // Metrics
  const totalCount = proposals.length;
  const approvedProps = proposals.filter(p => p.status === 'Approved');
  const sentProps = proposals.filter(p => p.status === 'Sent');
  const totalApprovedValue = approvedProps.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalSentValue = sentProps.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const filteredProps = proposals.filter(prop => {
    const clientCompany = prop.Client ? prop.Client.company.toLowerCase() : '';
    const title = prop.title.toLowerCase();
    const query = search.toLowerCase();
    return clientCompany.includes(query) || title.includes(query);
  });

  return (
    <div className="workspace-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {/* 1. Stat Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Proposals & Quotations</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{totalCount}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(47, 95%, 90%)', color: 'hsl(47, 95%, 35%)' }}>
            <Send size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Pending Quotation Value</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{totalSentValue.toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(142, 70%, 92%)', color: 'hsl(142, 70%, 29%)' }}>
            <Check size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Approved Quota Value</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{totalApprovedValue.toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Zap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Conversion Success</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>
              {totalCount > 0 ? `${Math.round((approvedProps.length / totalCount) * 100)}%` : '0%'}
            </h2>
          </div>
        </div>

      </div>

      {/* 2. Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Section: Proposals Listing */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Active Proposals Ledger</h3>
            
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}
            >
              <Plus size={16} />
              <span>Create Quote</span>
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by title, client company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-light)',
                color: 'var(--text)'
              }}
            />
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving proposals...</div>
          ) : filteredProps.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No proposals found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredProps.map(prop => (
                <div 
                  key={prop.id}
                  onClick={() => setSelectedProposal(prop)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: selectedProposal && selectedProposal.id === prop.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: selectedProposal && selectedProposal.id === prop.id ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  className="hover-glow"
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-active" style={{ fontSize: '10px' }}>
                        {prop.Client ? prop.Client.company : 'Direct Quote'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Until: {prop.validUntil}</span>
                    </div>
                    <h4 style={{ margin: '8px 0 4px 0', fontSize: '13.5px', fontWeight: '600', color: 'var(--text)' }}>{prop.title}</h4>
                    <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {prop.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginLeft: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>₹{parseFloat(prop.amount).toLocaleString('en-IN')}</span>
                    <span className={`badge badge-${prop.status === 'Approved' ? 'active' : prop.status === 'Sent' ? 'active' : 'inactive'}`}>
                      {prop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Selected Proposal Detail & Workflows */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', minHeight: '300px' }}>
          {!selectedProposal ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              <FileText size={48} style={{ strokeWidth: 1, marginBottom: '12px' }} />
              <h4>No Proposal Selected</h4>
              <p style={{ fontSize: '12px', maxWidth: '240px' }}>Select an active quotation card from the ledger to view digital scopes and approval buttons.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>{selectedProposal.title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>For: {selectedProposal.Client ? selectedProposal.Client.company : 'Direct Client'}</span>
                </div>
                
                <button onClick={() => setSelectedProposal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              <div>
                <strong style={{ fontSize: '12px', color: 'var(--text)' }}>Scope Specifications:</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '6px' }}>
                  {selectedProposal.description || 'No detailed scope mapped.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--bg-light)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Proposed Quote</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>
                    ₹{parseFloat(selectedProposal.amount).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Validity Deadline</span>
                  <div style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--text)', marginTop: '4px' }}>
                    {selectedProposal.validUntil}
                  </div>
                </div>
              </div>

              {/* Status Specific Workflow Actions */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {selectedProposal.status === 'Draft' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleUpdateStatus(selectedProposal.id, 'Sent')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Send size={14} />
                      <span>Simulate Dispatch to Client</span>
                    </button>
                  </div>
                )}

                {selectedProposal.status === 'Sent' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      🕒 Awaiting client review. You can simulate signing approval via the digital e-signature pad.
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setShowSignModal(true)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Edit size={14} />
                      <span>Interactive Client E-Sign</span>
                    </button>
                  </div>
                )}

                {selectedProposal.status === 'Approved' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div style={{ backgroundColor: 'hsl(142, 70%, 95%)', border: '1px solid hsl(142, 70%, 80%)', padding: '12px', borderRadius: '8px', color: 'hsl(142, 70%, 25%)', fontSize: '12px' }}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} />
                        <span>Digitally Signed & Approved</span>
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '11px', color: 'hsl(142, 70%, 29%)' }}>
                        Signed by: <strong>{selectedProposal.signedBy}</strong> at {selectedProposal.signedAt ? new Date(selectedProposal.signedAt).toLocaleDateString() : 'recently'}.
                      </div>
                    </div>

                    <button 
                      className="btn" 
                      onClick={() => handleConvertProposal(selectedProposal)}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', 
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      <Zap size={14} />
                      <span>Convert Proposal → Project & Invoice</span>
                    </button>

                  </div>
                )}

                {selectedProposal.status === 'Rejected' && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '16px' }}>
                    ❌ Quotation declined by client. Draft a fresh proposal scope to restart communications.
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

      </div>

      {/* 3. E-Signature Drawing Modal */}
      {showSignModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '460px', width: '95%', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Secure Digital E-Signature</h4>
              <button onClick={() => setShowSignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Signee Legal Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full legal name..."
                  value={signedBy}
                  onChange={e => setSignedBy(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  onClick={() => setSignatureType('draw')}
                  style={{
                    flex: 1, padding: '6px', borderRadius: '6px', border: 'none',
                    backgroundColor: signatureType === 'draw' ? 'var(--primary)' : 'var(--bg-light)',
                    color: signatureType === 'draw' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                  }}
                >
                  Draw Signature
                </button>
                <button
                  onClick={() => setSignatureType('type')}
                  style={{
                    flex: 1, padding: '6px', borderRadius: '6px', border: 'none',
                    backgroundColor: signatureType === 'type' ? 'var(--primary)' : 'var(--bg-light)',
                    color: signatureType === 'type' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                  }}
                >
                  Type Script Cursive
                </button>
              </div>

              {signatureType === 'draw' ? (
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Draw Signature inside box</label>
                  <canvas 
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    width={410}
                    height={150}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-light)',
                      cursor: 'crosshair',
                      touchAction: 'none'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={clearCanvas}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11.5px', marginTop: '6px', float: 'right' }}
                  >
                    Clear board
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Cursive Representation</label>
                  <input 
                    type="text" 
                    placeholder="Type name here to map cursive..."
                    value={typedSign}
                    onChange={e => setTypedSign(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                  {typedSign && (
                    <div style={{
                      padding: '16px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-light)',
                      marginTop: '6px',
                      fontFamily: '"Caveat", "Brush Script MT", cursive',
                      fontSize: '28px',
                      textAlign: 'center',
                      color: 'var(--text)',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {typedSign}
                    </div>
                  )}
                </div>
              )}

            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowSignModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveSignature}
                disabled={!signedBy}
                style={{ opacity: signedBy ? 1 : 0.6 }}
              >
                Accept & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Conversion Success Modal */}
      {conversionSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '440px', width: '90%', border: '1px solid var(--border)', background: 'var(--card-bg)', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'hsl(142, 70%, 92%)', color: 'hsl(142, 70%, 29%)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '16px'
            }}>
              <Check size={24} />
            </div>

            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Operations Assets Provisioned!</h4>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              Successfully closed quote <strong>"{conversionSuccess.proposalTitle}"</strong> (₹{conversionSuccess.amount}) and generated dynamic client deliverables:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg-light)', padding: '12px', borderRadius: '8px', textAlign: 'left', fontSize: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Zap size={14} style={{ color: 'var(--primary)' }} />
                <span>Project: <strong>{conversionSuccess.projectName}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <FileText size={14} style={{ color: 'var(--primary)' }} />
                <span>Invoice: <strong>{conversionSuccess.invoiceNumber}</strong> (₹{conversionSuccess.amount})</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => setConversionSuccess(null)}
              style={{ width: '100%' }}
            >
              Handoff Complete
            </button>
          </div>
        </div>
      )}

      {/* 5. Create Proposal Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <form onSubmit={handleCreateProposal} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '480px', width: '90%', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Draft Technical Proposal & Quotation</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Prospective Account</label>
                <select 
                  value={newProp.clientId} 
                  onChange={e => setNewProp(prev => ({ ...prev, clientId: e.target.value }))}
                  required
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                >
                  <option value="">Select a Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Project Scope Title</label>
                <input 
                  type="text" 
                  value={newProp.title}
                  onChange={e => setNewProp(prev => ({ ...prev, title: e.target.value }))}
                  required
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Detailed Description & Deliverables</label>
                <textarea 
                  rows={4}
                  value={newProp.description}
                  onChange={e => setNewProp(prev => ({ ...prev, description: e.target.value }))}
                  required
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)', resize: 'none', fontSize: '12.5px', lineHeight: '1.4' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Quotation Budget (₹)</label>
                  <input 
                    type="number" 
                    value={newProp.amount}
                    onChange={e => setNewProp(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                    required
                    min="100"
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Validity Expiry Date</label>
                  <input 
                    type="date" 
                    value={newProp.validUntil}
                    onChange={e => setNewProp(prev => ({ ...prev, validUntil: e.target.value }))}
                    required
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Draft
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default Proposals;
