import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import api from '../utils/api';
import { CreditCard, ShieldAlert, Sparkles, Send, Plus, Search, Check, AlertCircle, Calendar, IndianRupee, ToggleLeft, ToggleRight, X, Eye } from 'lucide-react';

const Subscriptions = () => {
  const { clients, syncData } = useData();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [reminderSub, setReminderSub] = useState(null);
  const [reminderLogs, setReminderLogs] = useState(null);

  // New Subscription Form
  const [newSub, setNewSub] = useState({
    clientId: '',
    planName: 'Enterprise Growth Suite',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
    price: 1500,
    autoRenew: true,
    licenseKey: ''
  });

  // Forecast Calculator
  const [growthRate, setGrowthRate] = useState(10); // 10%
  const [forecastMonths, setForecastMonths] = useState([]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await api('/subscriptions');
      if (data) setSubscriptions(data);
    } catch (error) {
      console.error('Fetch subscriptions error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Compute stats
  const activeSubs = subscriptions.filter(s => s.status === 'Active');
  const expiredSubs = subscriptions.filter(s => s.status === 'Expired');
  const activeMrrSum = activeSubs.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const totalSubValue = subscriptions.reduce((sum, s) => sum + parseFloat(s.price), 0);

  // Growth compounding formula
  useEffect(() => {
    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    const r = growthRate / 100;
    const computed = months.map((m, idx) => {
      const projected = activeMrrSum * Math.pow(1 + r, idx + 1);
      return {
        month: m,
        value: Math.round(projected)
      };
    });
    setForecastMonths(computed);
  }, [growthRate, subscriptions]);

  const handleToggleAutoRenew = async (sub) => {
    try {
      const updated = await api(`/subscriptions/${sub.id}`, {
        method: 'PUT',
        body: { autoRenew: !sub.autoRenew }
      });
      if (updated) {
        setSubscriptions(prev => prev.map(s => s.id === sub.id ? updated : s));
      }
    } catch (e) {
      console.error('Toggle autoRenew error:', e);
    }
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    if (!newSub.clientId || !newSub.planName || !newSub.startDate || !newSub.endDate) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      const fresh = await api('/subscriptions', {
        method: 'POST',
        body: newSub
      });
      if (fresh) {
        setSubscriptions(prev => [fresh, ...prev]);
        setShowAddModal(false);
        syncData(); // Sync parent dashboards
      }
    } catch (e) {
      console.error('Create sub error:', e);
    }
  };

  const handleTriggerReminder = async (sub, channel) => {
    try {
      const receipt = await api(`/subscriptions/${sub.id}/reminder`, {
        method: 'POST',
        body: { channel }
      });
      if (receipt && receipt.success) {
        setReminderLogs(receipt.details);
        setReminderSub(null);
      }
    } catch (e) {
      console.error('Reminder trigger error:', e);
    }
  };

  const filteredSubs = subscriptions.filter(sub => {
    const clientName = sub.Client ? sub.Client.name.toLowerCase() : '';
    const companyName = sub.Client ? sub.Client.company.toLowerCase() : '';
    const planName = sub.planName.toLowerCase();
    const query = search.toLowerCase();
    
    const matchesSearch = clientName.includes(query) || companyName.includes(query) || planName.includes(query);
    const matchesFilter = statusFilter === 'All' || sub.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="workspace-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {/* 1. Dashboard Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Active Accounts</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{activeSubs.length}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(354, 85%, 93%)', color: 'hsl(354, 85%, 56%)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Expired / Cancelled</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{expiredSubs.length}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Recurring Revenue (MRR)</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{activeMrrSum.toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(142, 70%, 92%)', color: 'hsl(142, 70%, 29%)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Total Contract value</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{totalSubValue.toLocaleString('en-IN')}</h2>
          </div>
        </div>

      </div>

      {/* 2. Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.25fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Table List */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Customer Licenses Desk</h3>
            
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}
            >
              <Plus size={16} />
              <span>Add Contract</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search plan, customer or company..."
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
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {['All', 'Active', 'Expired', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: statusFilter === status ? 'var(--primary)' : 'var(--bg-light)',
                    color: statusFilter === status ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '12px'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Licenses Table */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing licenses data...</div>
          ) : filteredSubs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No subscriptions matching the selected filters.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Client</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Plan Name</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>License Key</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Pricing</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Term</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Auto-Renew</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>{sub.Client ? sub.Client.name : 'Unknown Client'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.Client ? sub.Client.company : ''}</div>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: '500', color: 'var(--text)' }}>{sub.planName}</td>
                      <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{sub.licenseKey}</td>
                      <td style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text)' }}>₹{parseFloat(sub.price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                        <div>Start: {sub.startDate}</div>
                        <div>End: {sub.endDate}</div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <button 
                          onClick={() => handleToggleAutoRenew(sub)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub.autoRenew ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                        >
                          {sub.autoRenew ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`badge badge-${sub.status === 'Active' ? 'active' : 'inactive'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button 
                          className="btn"
                          onClick={() => setReminderSub(sub)}
                          style={{
                            padding: '6px 10px',
                            fontSize: '11px',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Send size={11} />
                          <span>Alert Client</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Forecast Calculator Widget */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
            <Sparkles size={18} />
            <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Growth Revenue Forecast</h3>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>
            Compounding analysis tool to calculate total subscription value based on active account base MRR (₹{activeMrrSum.toLocaleString('en-IN')}).
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: 'var(--text)', marginBottom: '8px' }}>
              <span>Compounding Rate</span>
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{growthRate}% Monthly</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={growthRate}
              onChange={e => setGrowthRate(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {forecastMonths.map((forecast, idx) => (
              <div 
                key={forecast.month}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-light)',
                  borderLeft: `3px solid var(--primary)`,
                  opacity: 1 - idx * 0.1
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)' }}>{forecast.month}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>₹{forecast.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Simulated Reminder logs Modal */}
      {reminderLogs && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '480px', width: '90%', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'hsl(142, 70%, 29%)' }}>
                <Check size={20} />
                <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '15px' }}>Reminder Dispatch Success</h4>
              </div>
              <button onClick={() => setReminderLogs(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>
              Simulated notification dispatched successfully to client endpoint!
            </p>

            <div style={{ backgroundColor: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Recipient:</strong> {reminderLogs.to} ({reminderLogs.company})</div>
              <div><strong>Phone (API Endpoint):</strong> {reminderLogs.phone}</div>
              <div><strong>Email Inbox:</strong> {reminderLogs.email}</div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                <strong>Message Contents:</strong>
                <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  "{reminderLogs.messageSent}"
                </p>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setReminderLogs(null)} style={{ marginTop: '16px', width: '100%' }}>
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* 4. Reminder Selection drawer */}
      {reminderSub && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', border: '1px solid var(--border)', background: 'var(--card-bg)', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)', fontSize: '15px' }}>Simulate License Reminder</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Select simulated dispatch channels for <strong>{reminderSub.Client ? reminderSub.Client.company : 'Client'}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleTriggerReminder(reminderSub, 'WhatsApp')}
                style={{ padding: '10px 16px', fontSize: '12.5px' }}
              >
                WhatsApp API
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleTriggerReminder(reminderSub, 'Email')}
                style={{ padding: '10px 16px', fontSize: '12.5px' }}
              >
                Gmail Connector
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleTriggerReminder(reminderSub, 'Both')}
                style={{ padding: '10px 16px', fontSize: '12.5px' }}
              >
                Synchronized Both
              </button>
            </div>

            <button 
              onClick={() => setReminderSub(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12.5px' }}
            >
              Cancel Alert
            </button>
          </div>
        </div>
      )}

      {/* 5. Add Subscription Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <form onSubmit={handleAddSubscription} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '480px', width: '90%', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Add Client License Contract</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Customer Account</label>
                <select 
                  value={newSub.clientId} 
                  onChange={e => setNewSub(prev => ({ ...prev, clientId: e.target.value }))}
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
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Service Plan Name</label>
                <input 
                  type="text" 
                  value={newSub.planName}
                  onChange={e => setNewSub(prev => ({ ...prev, planName: e.target.value }))}
                  required
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Start Date</label>
                  <input 
                    type="date" 
                    value={newSub.startDate}
                    onChange={e => setNewSub(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Expiry Date</label>
                  <input 
                    type="date" 
                    value={newSub.endDate}
                    onChange={e => setNewSub(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Monthly Price (₹)</label>
                  <input 
                    type="number" 
                    value={newSub.price}
                    onChange={e => setNewSub(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                    required
                    min="1"
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Custom License Key (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if empty"
                    value={newSub.licenseKey}
                    onChange={e => setNewSub(prev => ({ ...prev, licenseKey: e.target.value }))}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 14px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '8px 14px' }}
              >
                Create License
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default Subscriptions;
