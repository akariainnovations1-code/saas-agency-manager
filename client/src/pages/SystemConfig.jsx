import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Settings, Save, AlertOctagon, HelpCircle, 
  Cpu, HardDrive, RefreshCw, CheckCircle2 
} from 'lucide-react';

const SystemConfig = () => {
  const [config, setConfig] = useState({
    appName: 'Akaria Innovations SaaS',
    version: '2.4.0-premium',
    debugMode: false,
    enableNotifications: true,
    maintenanceMode: false,
    allowedUploadSizeMB: 10,
    sessionTimeoutMin: 15
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await api('/settings/system');
      if (data) {
        setConfig(data);
      }
    } catch (e) {
      console.error('Failed to fetch system config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const data = await api('/settings/system', {
        method: 'PUT',
        body: config
      });
      if (data && data.config) {
        setSuccessMsg(data.message || 'System settings saved successfully!');
        setConfig(prev => ({
          ...prev,
          ...data.config
        }));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update system config.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="spin-animation" />
        <p style={{ marginTop: '12px' }}>Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="system-config-page">
      
      <form onSubmit={handleSave} className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>System Configuration Manager</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Configure core parameters, security rules, and diagnostic attributes.</p>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <RefreshCw size={14} className="spin-animation" /> : <Save size={14} />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {successMsg && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-active)', padding: '12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>General Attributes</h4>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Application Branding Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.appName} 
                onChange={(e) => setConfig({ ...config, appName: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Global Inactivity Timeout (Minutes)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" 
                max="120"
                value={config.sessionTimeoutMin} 
                onChange={(e) => setConfig({ ...config, sessionTimeoutMin: parseInt(e.target.value) || 15 })} 
                required 
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Inactive sessions will be terminated automatically.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Allowed File Upload Size Limit (MB)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" 
                max="100"
                value={config.allowedUploadSizeMB} 
                onChange={(e) => setConfig({ ...config, allowedUploadSizeMB: parseInt(e.target.value) || 10 })} 
                required 
              />
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Production Flags</h4>
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>Maintenance Mode</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Restrict all logins to Super Admins only.</span>
              </div>
              <input 
                type="checkbox" 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>Debug Mode</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enable verbose logs (Disabled in Production).</span>
              </div>
              <input 
                type="checkbox" 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                checked={config.debugMode}
                onChange={(e) => setConfig({ ...config, debugMode: e.target.checked })}
              />
            </div>

            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px', marginTop: '16px' }}>
              <AlertOctagon size={16} style={{ color: 'var(--status-lost)', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--status-lost)', fontWeight: '600', display: 'block' }}>Hardened Environment Warning</span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4', display: 'block', marginTop: '2px' }}>
                  Enabling Debug Mode or disabling SSL headers will lower the security profile. Exercise caution.
                </span>
              </div>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
};

export default SystemConfig;
