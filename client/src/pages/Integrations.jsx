import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Cpu, Send, RefreshCw, CheckCircle2, AlertCircle, X, Shield, Lock } from 'lucide-react';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inSync, setInSync] = useState({});
  const [syncReceipt, setSyncReceipt] = useState(null);
  
  // Custom API keys inputs state
  const [keysInput, setKeysInput] = useState({});

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const data = await api('/integrations');
      if (data) {
        setIntegrations(data);
        // Pre-populate input fields
        const inputs = {};
        data.forEach(item => {
          inputs[item.serviceName] = item.apiKey || '';
        });
        setKeysInput(inputs);
      }
    } catch (e) {
      console.error('Fetch integrations error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (serviceName, disconnect = false) => {
    const apiKey = keysInput[serviceName] || '';
    if (!disconnect && !apiKey) {
      alert('Please enter an API Token or Client ID key first.');
      return;
    }

    try {
      const updated = await api('/integrations', {
        method: 'POST',
        body: {
          serviceName,
          apiKey: disconnect ? '' : apiKey,
          status: disconnect ? 'Disconnected' : 'Connected'
        }
      });
      if (updated) {
        setIntegrations(prev => prev.map(item => item.serviceName === serviceName ? updated : item));
        if (disconnect) {
          setKeysInput(prev => ({ ...prev, [serviceName]: '' }));
        }
      }
    } catch (e) {
      console.error('Connect integration error:', e);
    }
  };

  const handleTestPing = async (serviceName) => {
    setInSync(prev => ({ ...prev, [serviceName]: true }));
    try {
      const response = await api(`/integrations/${serviceName}/ping`, {
        method: 'POST'
      });
      if (response && response.success) {
        setSyncReceipt({
          service: serviceName,
          message: response.message,
          timestamp: response.timestamp
        });
        fetchIntegrations(); // Refresh lastSync timestamp
      }
    } catch (e) {
      alert(`Sync Error: ${e.message || 'Connection failed.'}`);
    } finally {
      setInSync(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const getServiceMeta = (name) => {
    switch (name) {
      case 'WhatsApp':
        return {
          title: 'WhatsApp Business API',
          desc: 'Simulate instant CRM reminders, client alerts, and overdue payment warnings dispatched via automated messaging.',
          placeholder: 'Enter Twilio or WhatsApp Business access token...'
        };
      case 'Gmail':
        return {
          title: 'Gmail / Outlook Sync',
          desc: 'Automate tracking of prospective onboarding emails, draft replies, and attachments filing inside Document Center.',
          placeholder: 'Enter Google Client OAuth 2.0 Access Token...'
        };
      case 'Calendar':
        return {
          title: 'Google Calendar Hook',
          desc: 'Synchronize project milestones and task due dates directly into staff and client Google Calendar feeds.',
          placeholder: 'Enter Calendar API service-account json credentials...'
        };
      case 'Meetings':
        return {
          title: 'Zoom & Google Meet Links',
          desc: 'Automate generation of secure virtual video link codes directly inside operational meeting summaries.',
          placeholder: 'Enter Zoom JWT OAuth account client token...'
        };
      case 'ChatGPT':
        return {
          title: 'ChatGPT (OpenAI) API',
          desc: 'Power AI Proposal Generation, automated invoice descriptions, and email copywriting using official OpenAI GPT-4o endpoints.',
          placeholder: 'Enter OpenAI API key (sk-...)...'
        };
      case 'Gemini':
        return {
          title: 'Gemini (Google) API',
          desc: 'Synthesize meeting summaries, parse action items, and compile revenue forecast analysis with Google Gemini LLM API.',
          placeholder: 'Enter Google Gemini API key (AIzaSy...)...'
        };
      default:
        return { title: name, desc: '', placeholder: 'Enter token key...' };
    }
  };

  return (
    <div className="workspace-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Heading overview */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '8px' }}>
          <Cpu size={22} />
          <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Operations Integration Desk</h3>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
          Manage connections to external third-party operational resources. Toggle active integrations, save encrypted authentication credentials, and trigger manual synchronization ping diagnostics.
        </p>
      </div>

      {/* Grid of integrations cards */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving configurations...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {integrations.map(item => {
            const meta = getServiceMeta(item.serviceName);
            const isConnected = item.status === 'Connected';
            
            return (
              <div 
                key={item.id} 
                className="glass-panel"
                style={{ 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: isConnected ? '2px solid var(--primary)' : '1px solid var(--border)', 
                  background: 'var(--card-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                
                {/* Header status block */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '600', color: 'var(--text)' }}>{meta.title}</h4>
                    <span className={`badge badge-${isConnected ? 'active' : 'inactive'}`} style={{ padding: '3px 8px', fontSize: '9.5px' }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '8px', marginBottom: 0 }}>
                    {meta.desc}
                  </p>
                </div>

                {/* API Input credentials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>Authorization Key Credentials</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Lock size={9} />
                      <span>AES-256 Encrypted</span>
                    </span>
                  </div>
                  
                  <input
                    type="password"
                    placeholder={meta.placeholder}
                    value={keysInput[item.serviceName] || ''}
                    disabled={isConnected}
                    onChange={e => setKeysInput(prev => ({ ...prev, [item.serviceName]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      backgroundColor: isConnected ? 'var(--bg-light)' : 'transparent',
                      color: 'var(--text)',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                {/* Bottom triggers */}
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
                  
                  {isConnected ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleConnect(item.serviceName, true)}
                        style={{ flex: 1, padding: '8px 12px', fontSize: '11.5px', color: 'hsl(354, 85%, 56%)' }}
                      >
                        Disconnect
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleTestPing(item.serviceName)}
                        disabled={inSync[item.serviceName]}
                        style={{ 
                          flex: 1.25, 
                          padding: '8px 12px', 
                          fontSize: '11.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <RefreshCw size={13} className={inSync[item.serviceName] ? 'spin' : ''} />
                        <span>{inSync[item.serviceName] ? 'Syncing...' : 'Run Sync Test'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleConnect(item.serviceName, false)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '12px' }}
                    >
                      Connect Integration
                    </button>
                  )}

                </div>

                {/* Sync info logs */}
                {isConnected && item.lastSync && (
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '-8px' }}>
                    <span>Last Synced: {new Date(item.lastSync).toLocaleString()}</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Sync receipt success details modal */}
      {syncReceipt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '420px', width: '90%', border: '1px solid var(--border)', background: 'var(--card-bg)', textAlign: 'center' }}>
            
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'hsl(142, 70%, 92%)', color: 'hsl(142, 70%, 29%)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '16px'
            }}>
              <CheckCircle2 size={24} />
            </div>

            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Synchronization Successful</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>
              Successfully executed webhook and ping calls against <strong>{syncReceipt.service}</strong> secure endpoint.
            </p>

            <div style={{ backgroundColor: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '11.5px', textAlign: 'left', marginBottom: '20px' }}>
              <div><strong>Sync Message:</strong> {syncReceipt.message}</div>
              <div style={{ marginTop: '4px' }}><strong>Ping Timestamp:</strong> {new Date(syncReceipt.timestamp).toLocaleString()}</div>
            </div>

            <button className="btn btn-primary" onClick={() => setSyncReceipt(null)} style={{ width: '100%' }}>
              Close Connection Receipt
            </button>
          </div>
        </div>
      )}

      {/* Custom spinning animation styled locally */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default Integrations;
