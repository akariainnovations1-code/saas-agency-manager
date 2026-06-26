import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, FolderKanban, CheckSquare, 
  IndianRupee, Compass, Users2, FileText, Calendar,
  Sun, Moon, LogOut, CreditCard, Award, Receipt, Sparkles,
  BarChart3, Cpu, Shield, Database, Settings, X
} from 'lucide-react';

import logo from '../logo.png';

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'crm', name: 'Clients (CRM)', icon: Users, roles: ['Admin', 'Manager'] },
    { id: 'subscriptions', name: 'Subscriptions', icon: CreditCard, roles: ['Admin', 'Manager'] },
    { id: 'proposals', name: 'Proposals & Quotes', icon: Award, roles: ['Admin', 'Manager'] },
    { id: 'projects', name: 'Projects', icon: FolderKanban, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'tasks', name: 'Kanban Tasks', icon: CheckSquare, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'sales', name: 'Sales & Billing', icon: IndianRupee, roles: ['Admin', 'Manager'] },
    { id: 'expenses', name: 'Expense Desk', icon: Receipt, roles: ['Admin', 'Manager'] },
    { id: 'leads', name: 'Leads Pipeline', icon: Compass, roles: ['Admin', 'Manager'] },
    { id: 'team', name: 'Team Roster', icon: Users2, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'documents', name: 'Document Center', icon: FileText, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'calendar', name: 'Calendar Feed', icon: Calendar, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'ai-center', name: 'AI Features Desk', icon: Sparkles, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'analytics', name: 'Advanced Reports', icon: BarChart3, roles: ['Admin', 'Manager'] },
    { id: 'integrations', name: 'Integrations Desk', icon: Cpu, roles: ['Admin', 'Manager'] },
    // Super Admin Restricted Menus
    { id: 'security-settings', name: 'Security Settings', icon: Shield, roles: ['Super Admin'] },
    { id: 'database-settings', name: 'Database Settings', icon: Database, roles: ['Super Admin'] },
    { id: 'system-config', name: 'System Config', icon: Settings, roles: ['Super Admin'] }
  ];

  if (!user) return null;

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-mobile-header">
        <span className="brand-name-mobile" style={{ fontSize: '18px', fontWeight: '800', background: 'linear-gradient(135deg, var(--text), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OmniFlow Navigation</span>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
          <X size={22} />
        </button>
      </div>

      <div className="brand-section" style={{ padding: '0 8px', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src={logo} 
          alt="Akaria Innovations" 
          style={{ 
            width: '150px', 
            height: '150px',
            objectFit: 'contain',
            borderRadius: '12px'
          }} 
        />
      </div>

      <ul className="nav-links">
        {menuItems.map((item) => {
          // Check role based permissions: Super Admin bypasses all checks, others require matching roles array
          if (user.role !== 'Super Admin' && !item.roles.includes(user.role)) return null;
          
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        {/* Theme Toggle option */}
        <button className="nav-item" onClick={toggleTheme} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User Info & Profile bar */}
        <div className="nav-profile" style={{ borderLeft: 'none', paddingLeft: 0, marginTop: '8px' }}>
          <img src={user.avatar} alt="Profile" className="profile-avatar" />
          <div className="profile-info">
            <span className="profile-name" style={{ fontSize: '13px' }}>{user.name}</span>
            <span className="profile-role" style={{ fontSize: '10.5px' }}>{user.role}</span>
          </div>
        </div>

        <button 
          className="nav-item" 
          onClick={logout}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', color: 'hsl(354, 85%, 56%)' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
