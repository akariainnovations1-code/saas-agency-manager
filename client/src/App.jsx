import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';

// Core Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import InactivityLogout from './components/InactivityLogout';

// Page Views
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Subscriptions from './pages/Subscriptions';
import Proposals from './pages/Proposals';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Leads from './pages/Leads';
import Team from './pages/Team';
import Documents from './pages/Documents';
import Calendar from './pages/Calendar';
import AICenter from './pages/AICenter';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';

// Super Admin Settings Page Views
import SecuritySettings from './pages/SecuritySettings';
import DatabaseSettings from './pages/DatabaseSettings';
import SystemConfig from './pages/SystemConfig';

const MainShell = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-muted)',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div>Akaria Innovations Operations Center Booting...</div>
        </div>
      </div>
    );
  }

  // Intercept unauthorized requests and show Login Gate
  if (!user) {
    return <Login />;
  }

  // Resolve headers dynamically
  const pageTitles = {
    dashboard: { title: 'Agency Operations Dashboard', subtitle: 'Global summaries, sales graph and operations feed.' },
    crm: { title: 'Customer Relationship Management', subtitle: 'Manage active customer contracts, journals, and communication histories.' },
    subscriptions: { title: 'Subscription Management Desk', subtitle: 'Oversee active customer plans, auto-renewals, and growth forecasts.' },
    proposals: { title: 'Proposal & Quotation Desk', subtitle: 'Create agreement drafts, request digital e-signatures, and convert proposals.' },
    projects: { title: 'Project Scope Manager', subtitle: 'Oversee campaign budgets, milestoners pipelines, and timelines.' },
    tasks: { title: 'Kanban Board Deliverables', subtitle: 'Coordinate column tasks, shift statuses, and adopt AI sugestions.' },
    sales: { title: 'Ledger Invoices Desk', subtitle: 'Calculate revenues, outstanding invoices, and printable PDF exports.' },
    expenses: { title: 'Expense Overhead Desk', subtitle: 'Record overhead outflows, vendor payments, and compile net profits.' },
    leads: { title: 'Leads Pipelines Funnel', subtitle: 'Organize prospective accounts sources and follow-up alerts.' },
    team: { title: 'Team Directory', subtitle: 'Review staff credentials and configure active authorization levels.' },
    documents: { title: 'Document Center Storage', subtitle: 'Upload operations spreadsheets, general assets, and contract PDFs.' },
    calendar: { title: 'Schedules Calendar Feed', subtitle: 'Monitor due milestones and task deadliner charts.' },
    'ai-center': { title: 'AI Automation Suite', subtitle: 'Utilize secure generative models to automate proposals, emails, and tasks.' },
    analytics: { title: 'Advanced Performance Reports', subtitle: 'Analyze Customer Lifetime Value, MRR projections, and staff efficiency ratios.' },
    integrations: { title: 'Third-Party Connectors Desk', subtitle: 'Configure synchronized hooks for WhatsApp, Google Calendar, and Zoom.' },
    'security-settings': { title: 'Security Settings Gate', subtitle: 'View audit logs, manage 2FA, and oversee brute force lockouts.' },
    'database-settings': { title: 'Database Configuration', subtitle: 'Inspect local SQLite database status and connection pools.' },
    'system-config': { title: 'System Configuration', subtitle: 'Adjust global parameters, debugging options, and allowed upload parameters.' }
  };

  const currentMeta = pageTitles[currentPage] || { title: 'Akaria Innovations Portal', subtitle: 'Operations Syncing.' };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'crm': return <CRM />;
      case 'subscriptions': return <Subscriptions />;
      case 'proposals': return <Proposals />;
      case 'projects': return <Projects />;
      case 'tasks': return <Tasks />;
      case 'sales': return <Sales />;
      case 'expenses': return <Expenses />;
      case 'leads': return <Leads />;
      case 'team': return <Team />;
      case 'documents': return <Documents />;
      case 'calendar': return <Calendar />;
      case 'ai-center': return <AICenter />;
      case 'analytics': return <Analytics />;
      case 'integrations': return <Integrations />;
      case 'security-settings': return <SecuritySettings />;
      case 'database-settings': return <DatabaseSettings />;
      case 'system-config': return <SystemConfig />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="main-shell">
        <Navbar title={currentMeta.title} subtitle={currentMeta.subtitle} setSidebarOpen={setSidebarOpen} />
        {renderActivePage()}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <InactivityLogout>
            <MainShell />
          </InactivityLogout>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
