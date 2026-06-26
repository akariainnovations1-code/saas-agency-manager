import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Shield, Lock, UserCheck, RefreshCw, AlertTriangle, 
  Key, ToggleLeft, ToggleRight, CheckCircle2, ShieldAlert
} from 'lucide-react';

const SecuritySettings = () => {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQr, setMfaQr] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [setupStep, setSetupStep] = useState(0); // 0 = default, 1 = show QR
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await api('/settings/logs');
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchMe = async () => {
    try {
      const me = await api('/auth/me');
      if (me) {
        setTwoFactorEnabled(me.twoFactorEnabled);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchMe();
  }, []);

  const handle2FASetup = async () => {
    setMfaLoading(true);
    setMfaError('');
    try {
      const data = await api('/auth/2fa/setup', { method: 'POST' });
      if (data) {
        setMfaSecret(data.secret);
        setMfaQr(data.qrMock);
        setSetupStep(1);
      }
    } catch (error) {
      setMfaError('Failed to generate 2FA secret.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) return;
    setMfaLoading(true);
    setMfaError('');
    try {
      const data = await api('/auth/2fa/toggle', {
        method: 'POST',
        body: { enable: true, code: verificationCode }
      });
      if (data && data.success) {
        setTwoFactorEnabled(true);
        setMfaSuccess('2FA enabled successfully!');
        setSetupStep(0);
        setVerificationCode('');
        fetchLogs();
      }
    } catch (error) {
      setMfaError(error.message || 'Invalid 2FA code. Use "123456".');
    } finally {
      setMfaLoading(false);
    }
  };

  const handle2FADisable = async () => {
    if (!window.confirm('Disable Two-Factor Authentication? This decreases account security.')) return;
    setMfaLoading(true);
    setMfaError('');
    setMfaSuccess('');
    try {
      const data = await api('/auth/2fa/toggle', {
        method: 'POST',
        body: { enable: false }
      });
      if (data && data.success) {
        setTwoFactorEnabled(false);
        setMfaSuccess('2FA disabled successfully.');
        fetchLogs();
      }
    } catch (error) {
      setMfaError('Failed to disable 2FA.');
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="security-settings-page">
      
      {/* 2FA Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Two-Factor Authentication (2FA)</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Secure your Super Admin profile with dual validation keys.</p>
            </div>
          </div>
          <div>
            {twoFactorEnabled ? (
              <button className="btn btn-secondary" onClick={handle2FADisable} style={{ color: 'var(--status-lost)' }}>
                Disable 2FA
              </button>
            ) : (
              setupStep === 0 && (
                <button className="btn btn-primary" onClick={handle2FASetup}>
                  Enable 2FA
                </button>
              )
            )}
          </div>
        </div>

        {mfaError && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-lost)', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
            <AlertTriangle size={16} />
            <span>{mfaError}</span>
          </div>
        )}

        {mfaSuccess && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-active)', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
            <CheckCircle2 size={16} />
            <span>{mfaSuccess}</span>
          </div>
        )}

        {/* 2FA SETUP WIZARD */}
        {setupStep === 1 && (
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface-hover)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Scan the Authentication QR Code</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              
              {/* Simulated QR Code Box */}
              <div style={{ width: '120px', height: '120px', backgroundColor: '#fff', border: '4px solid #fff', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                <div style={{ width: '100px', height: '100px', backgroundImage: 'radial-gradient(#000 30%, transparent 30%), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%)', backgroundSize: '10px 10px, 20px 20px, 20px 20px', backgroundPosition: '0 0, 0 0, 10px 10px' }}></div>
              </div>

              <div style={{ flexGrow: 1, minWidth: '200px' }}>
                <p style={{ fontSize: '12.5px', margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                  Scan the QR code with Google Authenticator or Microsoft Authenticator, or manually key in:
                </p>
                <code style={{ fontSize: '14px', letterSpacing: '2px', backgroundColor: 'var(--surface)', padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--border)', display: 'inline-block', marginBottom: '12px', color: 'var(--primary)' }}>
                  {mfaSecret}
                </code>
                
                <form onSubmit={handle2FAVerify} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter 6-digit Code (Use: 123456)" 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    style={{ maxWidth: '240px' }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={mfaLoading}>
                    Verify & Activate
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setSetupStep(0)}>
                    Cancel
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* 2FA Status Description */}
        {setupStep === 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', borderRadius: '6px', backgroundColor: twoFactorEnabled ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)', border: twoFactorEnabled ? '1px dashed rgba(16, 185, 129, 0.2)' : '1px dashed rgba(245, 158, 11, 0.2)' }}>
            <ShieldAlert size={18} style={{ color: twoFactorEnabled ? 'var(--status-active)' : 'var(--status-lead)' }} />
            <span style={{ fontSize: '13px' }}>
              Status: <b>{twoFactorEnabled ? 'Active (MFA Guarded)' : 'Disabled'}</b>. {twoFactorEnabled ? 'Your account is fully hardened against password-guessing attacks.' : 'Click "Enable 2FA" to configure two-step verification.'}
            </span>
          </div>
        )}

      </div>

      {/* Security Audit Log Activity Journal */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Security Audit & Activity Journal</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Chronological database records of system logins, permission changes, and lockouts.</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={fetchLogs} disabled={loadingLogs} title="Refresh Logs">
            <RefreshCw size={14} className={loadingLogs ? 'spin-animation' : ''} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="crm-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Timestamp</th>
                <th style={{ width: '15%' }}>Module</th>
                <th style={{ width: '20%' }}>Event Action</th>
                <th style={{ width: '15%' }}>User</th>
                <th>Diagnostic Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        fontSize: '9px', 
                        backgroundColor: log.type === 'SECURITY' ? 'rgba(239, 68, 68, 0.1)' : log.type === 'AUTH' ? 'rgba(59, 130, 246, 0.1)' : 'var(--border)',
                        color: log.type === 'SECURITY' ? 'var(--status-lost)' : log.type === 'AUTH' ? 'var(--primary)' : 'var(--text-muted)'
                      }}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', fontSize: '13px' }}>
                      {log.action}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {log.User ? log.User.name : <span style={{ color: 'var(--text-muted)' }}>System / Guest</span>}
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-normal)', fontFamily: 'monospace' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No audit logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SecuritySettings;
