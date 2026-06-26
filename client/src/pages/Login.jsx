import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, UserPlus, Key, ShieldCheck, Lock } from 'lucide-react';
import logo from '../logo.png';

const Login = () => {
  const { login, register, verify2FA, changePasswordForce } = useAuth();

  // Mode: 'login', 'register', 'twoFactor', 'forceChange'
  const [authMode, setAuthMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');

  // Hardened states
  const [mfaCode, setMfaCode] = useState('');
  const [mfaUserId, setMfaUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [tempToken, setTempToken] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (!name || !email || !password) {
          setError('Please complete all form fields.');
          setLoading(false);
          return;
        }
        await register(name, email, password, role);
      } else {
        if (!email || !password) {
          setError('Please provide email and password.');
          setLoading(false);
          return;
        }
        const data = await login(email, password);
        if (data) {
          if (data.twoFactorRequired) {
            setMfaUserId(data.userId);
            setAuthMode('twoFactor');
          } else if (data.mustChangePassword) {
            setTempToken(data.tempToken);
            setAuthMode('forceChange');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode) return;
    setError('');
    setLoading(true);
    try {
      const res = await verify2FA(mfaUserId, mfaCode);
      if (res && res.success) {
        // Success
      } else {
        setError('Invalid 2FA verification code.');
      }
    } catch (err) {
      setError(err.message || 'MFA validation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceChangeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }
    
    // Enforce Password Requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain at least 8 characters, one uppercase, one lowercase letter, one number, and one special character.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await changePasswordForce(email, tempToken, newPassword);
      if (res && res.success) {
        alert('Password updated successfully. Access granted.');
      } else {
        setError('Failed to update password.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick evaluation autofillers
  const handleQuickLogin = (roleType) => {
    setError('');
    setAuthMode('login');
    if (roleType === 'superadmin') {
      setEmail('alokkumar7856853955@gmail.com');
      setPassword('7856853955@Abcdef');
    } else if (roleType === 'manager_new') {
      setEmail('amankumarajad78568539@gmail.com');
      setPassword('7856853955@Abcdef');
    } else if (roleType === 'admin') {
      setEmail('admin@agency.com');
      setPassword('password123');
    } else if (roleType === 'manager') {
      setEmail('manager@agency.com');
      setPassword('password123');
    } else {
      setEmail('employee@agency.com');
      setPassword('password123');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">

        <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Akaria Innovations Logo"
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'contain',
              borderRadius: '16px',
              marginBottom: '16px'
            }}
          />
          {authMode === 'login' && (
            <>
              <h1>Welcome Back</h1>
              <p>Access your agency business portal dashboard.</p>
            </>
          )}
          {authMode === 'register' && (
            <>
              <h1>Create Account</h1>
              <p>Register your agency profile credentials.</p>
            </>
          )}
          {authMode === 'twoFactor' && (
            <>
              <h1>2FA Verification</h1>
              <p>Enter the code from your authenticator app.</p>
            </>
          )}
          {authMode === 'forceChange' && (
            <>
              <h1>Reset Required</h1>
              <p>For your security, update your password on first login.</p>
            </>
          )}
        </div>

        {error && (
          <div className="badge badge-high" style={{ display: 'flex', width: '100%', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', gap: '8px', textTransform: 'none' }}>
            <ShieldAlert size={16} />
            <span style={{ fontSize: '12.5px', lineHeight: '1.4' }}>{error}</span>
          </div>
        )}

        {/* 1. STANDARD LOGIN / REGISTER FORM */}
        {(authMode === 'login' || authMode === 'register') && (
          <form onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label">Security Role Level</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Admin">Admin (Full Privilege)</option>
                  <option value="Manager">Manager (CRM + Pipelines)</option>
                  <option value="Employee">Employee (Tasks + Docs only)</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={loading}>
              {authMode === 'register' ? <UserPlus size={16} /> : <LogIn size={16} />}
              <span>{loading ? 'Authenticating...' : authMode === 'register' ? 'Register Account' : 'Authenticate Credentials'}</span>
            </button>
          </form>
        )}

        {/* 2. TWO-FACTOR FORM */}
        {authMode === 'twoFactor' && (
          <form onSubmit={handleMfaSubmit}>
            <div style={{ textAlign: 'center', padding: '12px', border: '1px dashed var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', marginBottom: '16px' }}>
              <ShieldCheck size={28} style={{ color: 'var(--status-active)', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Two-Factor Security is active for this account.
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-digit Code (Use: 123456)"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={loading}>
              <LogIn size={16} />
              <span>{loading ? 'Verifying 2FA...' : 'Verify & Continue'}</span>
            </button>

            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setAuthMode('login')}>
              Back to Login
            </button>
          </form>
        )}

        {/* 3. FORCED PASSWORD CHANGE FORM */}
        {authMode === 'forceChange' && (
          <form onSubmit={handleForceChangeSubmit}>
            <div style={{ textAlign: 'center', padding: '12px', border: '1px dashed var(--status-lead)', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', marginBottom: '16px' }}>
              <Lock size={24} style={{ color: 'var(--status-lead)', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                A password change is required upon first login.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={loading}>
              <Key size={16} />
              <span>{loading ? 'Changing Password...' : 'Save & Login'}</span>
            </button>
          </form>
        )}

        {/* Mode Toggle footer */}
        {(authMode === 'login' || authMode === 'register') && (
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
            <span>{authMode === 'register' ? 'Already have an account? ' : 'Need a fresh account? '}</span>
            <span
              className="auth-toggle-link"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {authMode === 'register' ? 'Sign In Instead' : 'Register Here'}
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
