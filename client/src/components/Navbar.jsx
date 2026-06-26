import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Shield, CheckCheck, Info, Calendar, IndianRupee, RefreshCw, Menu } from 'lucide-react';
import api from '../utils/api';

const Navbar = ({ title, subtitle, setSidebarOpen }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await api('/notifications');
      if (data) setNotifications(data);
    } catch (error) {
      console.error('Navbar Notifications Error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error('Mark read error:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Mark all read error:', e);
    }
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'Renewal': return <RefreshCw size={14} style={{ color: 'var(--primary)' }} />;
      case 'PaymentDue': return <IndianRupee size={14} style={{ color: 'var(--text-warning)' }} />;
      case 'Overdue': return <IndianRupee size={14} style={{ color: 'var(--priority-high)' }} />;
      case 'Deadline': return <Calendar size={14} style={{ color: 'var(--priority-high)' }} />;
      default: return <Info size={14} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="shell-navbar" style={{ position: 'relative' }}>
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} title="Open Menu">
        <Menu size={20} />
      </button>
      <div className="page-title-group">
        <h1>{title}</h1>
        <p>{subtitle || `${getGreeting()}, ${user.name.split(' ')[0]}!`}</p>
      </div>

      <div className="navbar-actions">
        {/* Role badge */}
        <div className="badge badge-active" style={{ background: 'var(--primary-light)', color: 'var(--primary)', gap: '4px' }}>
          <Shield size={12} />
          <span>{user.role} Privilege</span>
        </div>

        {/* Theme switch quick button */}
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Smart Notifications Bell */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            className={`theme-toggle-btn ${showDropdown ? 'active' : ''}`} 
            style={{ position: 'relative' }} 
            onClick={() => setShowDropdown(!showDropdown)}
            title="Alert Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--priority-high)',
                boxShadow: '0 0 8px var(--priority-high)'
              }}></span>
            )}
          </button>

          {showDropdown && (
            <div className="notifications-dropdown glass-panel" style={{
              position: 'absolute',
              top: '45px',
              right: '0',
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 999,
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px',
              fontFamily: 'sans-serif'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>Alert Center ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--primary)', 
                      fontSize: '11.5px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      fontWeight: '500'
                    }}
                  >
                    <CheckCheck size={13} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px', fontSize: '12.5px' }}>
                    No alerts in current logs.
                  </div>
                ) : (
                  notifications.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => !item.isRead && handleMarkRead(item.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: item.isRead ? 'transparent' : 'var(--bg-light)',
                        borderLeft: `3px solid ${item.isRead ? 'var(--border)' : 'var(--primary)'}`,
                        cursor: item.isRead ? 'default' : 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start'
                      }}
                      className={item.isRead ? '' : 'hover-glow'}
                    >
                      <div style={{
                        marginTop: '2px',
                        padding: '4px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getAlertIcon(item.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: item.isRead ? '500' : '600', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{item.title}</span>
                          {!item.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>}
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                          {item.message}
                        </p>
                        {item.targetDate && (
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Calendar size={10} />
                            <span>Target: {item.targetDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="nav-profile">
          <img src={user.avatar} alt="User Avatar" className="profile-avatar" />
          <div className="profile-info">
            <span className="profile-name">{user.name}</span>
            <span className="profile-role">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
