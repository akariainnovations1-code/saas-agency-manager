import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import api from '../utils/api';
import { Receipt, TrendingDown, IndianRupee, Plus, Search, Tag, Calendar, User, X, Check, Activity } from 'lucide-react';

const Expenses = () => {
  const { syncData } = useData();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Profit calculations
  const [profitLedger, setProfitLedger] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    breakdown: []
  });

  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newExp, setNewExp] = useState({
    title: '',
    category: 'Software License',
    amount: 150,
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    status: 'Paid'
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await api('/expenses');
      if (data) setExpenses(data);
    } catch (e) {
      console.error('Fetch expenses error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitLedger = async () => {
    try {
      const data = await api('/expenses/profit');
      if (data) setProfitLedger(data);
    } catch (e) {
      console.error('Fetch profit ledger error:', e);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchProfitLedger();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExp.title || !newExp.category || !newExp.amount || !newExp.date) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      const fresh = await api('/expenses', {
        method: 'POST',
        body: newExp
      });
      if (fresh) {
        setExpenses(prev => [fresh, ...prev]);
        setShowAddModal(false);
        setNewExp({
          title: '',
          category: 'Software License',
          amount: 150,
          date: new Date().toISOString().split('T')[0],
          vendor: '',
          status: 'Paid'
        });
        fetchProfitLedger();
        syncData();
      }
    } catch (e) {
      console.error('Add expense error:', e);
    }
  };

  const handleToggleStatus = async (exp) => {
    const newStatus = exp.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      const updated = await api(`/expenses/${exp.id}`, {
        method: 'PUT',
        body: { status: newStatus }
      });
      if (updated) {
        setExpenses(prev => prev.map(e => e.id === exp.id ? updated : e));
        fetchProfitLedger();
      }
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense log?')) return;
    try {
      await api(`/expenses/${id}`, { method: 'DELETE' });
      setExpenses(prev => prev.filter(e => e.id !== id));
      fetchProfitLedger();
      syncData();
    } catch (e) {
      console.error('Delete expense error:', e);
    }
  };

  // Compute local values
  const totalOverhead = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const paidOverhead = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const pendingOverhead = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const filteredExpenses = expenses.filter(exp => {
    const title = exp.title.toLowerCase();
    const vendor = exp.vendor ? exp.vendor.toLowerCase() : '';
    const query = search.toLowerCase();
    const matchesSearch = title.includes(query) || vendor.includes(query);
    const matchesCat = categoryFilter === 'All' || exp.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const profitMarginPercent = profitLedger.revenue > 0 ? Math.round((profitLedger.profit / profitLedger.revenue) * 100) : 0;

  return (
    <div className="workspace-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {/* 1. Profit Calculations Core widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Total Cost Overhead</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{totalOverhead.toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(142, 70%, 92%)', color: 'hsl(142, 70%, 29%)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Paid Transactions</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{paidOverhead.toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'hsl(47, 95%, 90%)', color: 'hsl(47, 95%, 35%)' }}>
            <Receipt size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Pending Vendor Due</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>₹{pendingOverhead.toLocaleString('en-IN')}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Profit Margin Ratio</span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>{profitMarginPercent}% Margin</h2>
          </div>
        </div>

      </div>

      {/* 2. Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Section: Expense Ledger */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '16px', fontWeight: '600' }}>Business Expenses Ledger</h3>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}
            >
              <Plus size={16} />
              <span>Log Expense</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search transaction or vendor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-light)',
                  color: 'var(--text)'
                }}
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-light)',
                color: 'var(--text)'
              }}
            >
              <option value="All">All Categories</option>
              <option value="Software License">Software License</option>
              <option value="Vendor Payment">Vendor Payment</option>
              <option value="Rent & Utilities">Rent & Utilities</option>
              <option value="Marketing">Marketing</option>
              <option value="Travel & Meals">Travel & Meals</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Ledger Table */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Updating expense records...</div>
          ) : filteredExpenses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses logged.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Item</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Category</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Vendor</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Date</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Amount</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                      <td style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text)' }}>{exp.title}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <Tag size={10} />
                          <span>{exp.category}</span>
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{exp.vendor}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11.5px' }}>{exp.date}</td>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: 'var(--text)' }}>₹{parseFloat(exp.amount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          onClick={() => handleToggleStatus(exp)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '10.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: exp.status === 'Paid' ? 'hsl(142, 70%, 92%)' : 'hsl(47, 95%, 90%)',
                            color: exp.status === 'Paid' ? 'hsl(142, 70%, 29%)' : 'hsl(47, 95%, 35%)'
                          }}
                        >
                          {exp.status}
                        </button>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(354, 85%, 56%)', fontSize: '11px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Section: Real-time Profit Calculation Desk */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Profit Calculation Desk</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Sales Collections (Invoiced)</span>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'hsl(142, 70%, 29%)' }}>
                  +₹{parseFloat(profitLedger.revenue).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Overhead Outflows (Expenses)</span>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'hsl(354, 85%, 56%)' }}>
                  -₹{parseFloat(profitLedger.expenses).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Net Operations Profit</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{parseFloat(profitLedger.profit).toLocaleString('en-IN')}
                </span>
              </div>

            </div>

            {/* Visual Profit Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Operations Efficiency</span>
                <span>{profitMarginPercent}% Margin</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-light)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${profitMarginPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #4f46e5 100%)', borderRadius: '5px' }}></div>
              </div>
            </div>
          </div>

          {/* Categories Cost Allocation Card */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '14.5px', fontWeight: '600' }}>Cost Allocation by Category</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {profitLedger.breakdown.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No categories logged.</div>
              ) : (
                profitLedger.breakdown.map(b => (
                  <div key={b.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-light)' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)' }}>{b.category}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>₹{parseFloat(b.total).toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Log Expense Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <form onSubmit={handleAddExpense} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', maxWidth: '440px', width: '90%', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>Log Operation Outflow Transaction</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Transaction Title</label>
                <input 
                  type="text" 
                  value={newExp.title}
                  onChange={e => setNewExp(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="e.g. AWS Production server hosting renewal"
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Overhead Category</label>
                  <select 
                    value={newExp.category} 
                    onChange={e => setNewExp(prev => ({ ...prev, category: e.target.value }))}
                    required
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  >
                    <option value="Software License">Software License</option>
                    <option value="Vendor Payment">Vendor Payment</option>
                    <option value="Rent & Utilities">Rent & Utilities</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Travel & Meals">Travel & Meals</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Amount Spent (₹)</label>
                  <input 
                    type="number" 
                    value={newExp.amount}
                    onChange={e => setNewExp(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    required
                    min="1"
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Vendor / Merchant</label>
                  <input 
                    type="text" 
                    value={newExp.vendor}
                    onChange={e => setNewExp(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="e.g. Stripe Inc"
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Payment Date</label>
                  <input 
                    type="date" 
                    value={newExp.date}
                    onChange={e => setNewExp(prev => ({ ...prev, date: e.target.value }))}
                    required
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Transaction Status</label>
                <select 
                  value={newExp.status} 
                  onChange={e => setNewExp(prev => ({ ...prev, status: e.target.value }))}
                  required
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                >
                  <option value="Paid">Paid Outflow</option>
                  <option value="Pending">Pending Vendor Due</option>
                </select>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record Overhead
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default Expenses;
