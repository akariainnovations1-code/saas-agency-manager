import React from 'react';
import { useData } from '../context/DataContext';
import SalesChart from '../components/SalesChart';
import { 
  TrendingUp, Users, FolderKanban, CheckSquare, 
  ArrowUpRight, BarChart3, AlertCircle, Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { stats, loading } = useData();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={40} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <div>Synchronizing SaaS Dashboard...</div>
        </div>
      </div>
    );
  }

  // Fallback defaults if statistical endpoint fails or loading is incomplete
  const metrics = stats?.metrics || {
    totalRevenue: 45000,
    outstandingRevenue: 25000,
    totalClients: 4,
    activeProjects: 2,
    pendingTasks: 4,
    totalLeads: 4,
    qualifiedLeads: 1
  };

  const chartData = stats?.salesChart || [
    { name: 'Jan', value: 5000 },
    { name: 'Feb', value: 12000 },
    { name: 'Mar', value: 8000 },
    { name: 'Apr', value: 18000 },
    { name: 'May', value: 30000 }
  ];

  const activities = stats?.activities || [];
  const leadsBySource = stats?.leadsBySource || [];
  const teamPerformance = stats?.teamPerformance || [];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div>
      {/* Metrics Row Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Revenue</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-active)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="metric-trend up">
            <ArrowUpRight size={14} />
            <span>+12.4% from last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Active Clients</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: 'var(--status-prospect)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{metrics.totalClients}</div>
          <div className="metric-trend up">
            <ArrowUpRight size={14} />
            <span>2 accounts onboarded</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Active Projects</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <FolderKanban size={18} />
            </div>
          </div>
          <div className="metric-value">{metrics.activeProjects}</div>
          <div className="metric-trend" style={{ color: 'var(--text-muted)' }}>
            <span>In production cycle</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Pending Tasks</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-lead)' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="metric-value">{metrics.pendingTasks}</div>
          <div className="metric-trend down" style={{ color: 'var(--priority-low)' }}>
            <span>Milestones on track</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Activities Layout Grid */}
      <div className="dashboard-row">
        
        {/* Sales Graph panel */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel-header" style={{ marginBottom: 0 }}>
            <div>
              <h2>Sales & Revenue Analytics</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Monthly billed agency earnings (Paid invoices summary)</p>
            </div>
            <div className="badge badge-active" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Sparkles size={12} />
              <span>Real-Time Updates</span>
            </div>
          </div>
          <SalesChart data={chartData} type="line" />
        </div>

        {/* Audit Log Panel */}
        <div className="card-panel">
          <div className="panel-header">
            <h2>Recent Operations Feed</h2>
          </div>
          <div className="activity-feed">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-icon">
                    <BarChart3 size={14} />
                  </div>
                  <div className="activity-body">
                    <span className="activity-action">{act.action}</span>
                    <span className="activity-desc">{act.details}</span>
                    <span className="activity-time">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.User?.name || 'Akaria Automator'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No events recorded in logs database.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Additional Stats Analytics Breakdown */}
      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Lead pipelines list */}
        <div className="card-panel">
          <div className="panel-header">
            <h2>Lead Pipeline Funnels</h2>
          </div>
          <div className="table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Acquisition Source</th>
                  <th style={{ textAlign: 'right' }}>Active Count</th>
                </tr>
              </thead>
              <tbody>
                {leadsBySource.length > 0 ? (
                  leadsBySource.map((lead, idx) => (
                    <tr key={idx}>
                      <td><span style={{ fontWeight: '600' }}>{lead.source}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>{lead.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No leads tracked in pipeline database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team roster task scores */}
        <div className="card-panel">
          <div className="panel-header">
            <h2>Team Task Completions</h2>
          </div>
          <div className="table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Assignee Member</th>
                  <th style={{ textAlign: 'right' }}>Tasks Completed</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.length > 0 ? (
                  teamPerformance.map((performer, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={performer.avatar} alt="Staff" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                          <span style={{ fontWeight: '600' }}>{performer.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--status-active)' }}>{performer.completed}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No task performance metrics compiled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
