import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Users2, Info, CheckCircle2 } from 'lucide-react';

const Team = () => {
  const { user } = useAuth();
  const { team, updateTeamRole } = useData();
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setSuccessMsg('');
      await updateTeamRole(memberId, newRole);
      setSuccessMsg('Staff credentials and privilege level modified successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      alert(error.message || 'Permission adjustment failed.');
    }
  };

  return (
    <div>

      {successMsg && (
        <div className="badge badge-active" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', gap: '8px', textTransform: 'none' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Directory Roster overview */}
      <div className="card-panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users2 size={20} style={{ color: 'var(--primary)' }} />
            <span>Staff Directory</span>
          </h2>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{team.length} Active Users</span>
        </div>

        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Profile Photo & Name</th>
                <th>Email Address</th>
                <th>Security Role</th>
                {user?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Authorization Dial</th>}
              </tr>
            </thead>
            <tbody>
              {team.length > 0 ? (
                team.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={member.avatar} alt="Staff avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '700' }}>{member.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{member.role} Scope</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={13} style={{ color: member.role === 'Admin' ? 'var(--status-active)' : member.role === 'Manager' ? 'var(--status-prospect)' : 'var(--text-muted)' }} />
                        <span style={{ fontWeight: '600' }}>{member.role}</span>
                      </div>
                    </td>
                    
                    {/* Admin RBAC controls dropdown */}
                    {user?.role === 'Admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <select 
                          className="form-select" 
                          style={{ width: '150px', display: 'inline-block' }}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          disabled={member.id === user.id} // Disable self demoting safeguarding
                          title={member.id === user.id ? "Admins cannot demote their own account" : "Re-assign security roles permissions"}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Employee">Employee</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No staff registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles info widgets */}
      <div className="card-panel" style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(180, 85, 45, 0.05))', border: '1px dashed var(--primary)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
          <Info size={16} />
          <span>Role-Based Access Controls (RBAC) Architecture</span>
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px', fontSize: '12.5px' }}>
          <div>
            <b style={{ color: 'var(--status-active)' }}>Admin Profile Scope:</b>
            <p style={{ marginTop: '4px', color: 'var(--text-muted)', lineHeight: '1.3' }}>Full control capabilities over all finances, client offboarding, staff credentials, database adjustments, and project scoping.</p>
          </div>
          <div>
            <b style={{ color: 'var(--status-prospect)' }}>Manager Profile Scope:</b>
            <p style={{ marginTop: '4px', color: 'var(--text-muted)', lineHeight: '1.3' }}>Oversees CRM journals, leads acquisitions, project deadlines, task updates, and invoicing. Excluded from directory permissions edits.</p>
          </div>
          <div>
            <b style={{ color: 'var(--text-muted)' }}>Employee Profile Scope:</b>
            <p style={{ marginTop: '4px', color: 'var(--text-muted)', lineHeight: '1.3' }}>Production view. Manages Kanban task columns movements, posts discussions comments, uploads general project document catalogs.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Team;
