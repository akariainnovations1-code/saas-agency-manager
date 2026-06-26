import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart3, TrendingUp, Users, Target, CheckSquare, Award, Percent, DollarSign, Calendar } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState({
    clvList: [],
    mrr: 0,
    churnRate: '0%',
    serviceProfitability: [],
    teamEfficiency: []
  });
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api('/analytics');
      if (res) setData(res);
    } catch (e) {
      console.error('Fetch analytics error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="workspace-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>Compiling operational reports...</div>
      ) : (
        <>
          {/* 1. Core Top Analytics Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Subscription MRR</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{parseFloat(data.mrr).toLocaleString('en-IN')}</h2>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(354, 85%, 93%)', color: 'hsl(354, 85%, 56%)' }}>
                <Percent size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Annual Churn Rate</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{data.churnRate}</h2>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(142, 70%, 92%)', color: 'hsl(142, 70%, 29%)' }}>
                <Target size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>CLV Average spent</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹22,500</h2>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <CheckSquare size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Team Efficiency Ratio</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>85%</h2>
              </div>
            </div>

          </div>

          {/* 2. Main Analytics Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Left Column: Top Client Lifetime Value & Service Profitability */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* CLV List */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Users size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Client Lifetime Value (CLV) Ranking</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.clvList.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '12px' }}>No payment histories registered.</div>
                  ) : (
                    data.clvList.map((client, idx) => (
                      <div 
                        key={client.clientName}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-light)',
                          borderLeft: `3px solid ${idx === 0 ? 'var(--primary)' : 'var(--border)'}`
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text)' }}>{client.company}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rep: {client.clientName}</div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>₹{parseFloat(client.clv).toLocaleString('en-IN')}</span>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Rank #{idx + 1} Spender</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Service profitability analysis */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Award size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Service-Wise Profitability</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: '500' }}>Service Focus</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: '500' }}>Total Invoiced</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: '500' }}>Net Profit</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'right' }}>Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.serviceProfitability.map(serv => (
                        <tr key={serv.service} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 8px', fontWeight: '500', color: 'var(--text)' }}>{serv.service}</td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>₹{serv.revenue.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 8px', fontWeight: '600', color: 'var(--text)' }}>₹{serv.profit.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 8px', fontWeight: '600', color: 'hsl(142, 70%, 29%)', textAlign: 'right' }}>{serv.margin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Team Efficiency reports */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Team Efficiency Scorecard</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.teamEfficiency.map(member => (
                  <div key={member.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text)' }}>{member.name}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{member.role}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>Tasks: {member.completed} Completed / {member.assigned} Assigned</span>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{member.efficiencyScore}% Efficiency</span>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${member.efficiencyScore}%`, 
                          height: '100%', 
                          background: 'var(--primary)', 
                          borderRadius: '3px' 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default Analytics;
