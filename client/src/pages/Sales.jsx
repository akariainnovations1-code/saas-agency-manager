import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import InvoiceGenerator from '../components/InvoiceGenerator';
import { 
  Plus, IndianRupee, Calendar, Landmark, FileText, 
  X, Check, AlertTriangle, Eye, ArrowUpRight 
} from 'lucide-react';

const Sales = () => {
  const { stats, sales, clients, addInvoice, editInvoiceStatus } = useData();

  // Modals Controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [activePreviewInvoice, setActivePreviewInvoice] = useState(null);

  // Form Fields
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState('Unpaid');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Custom single item builder
  const [itemDescription, setItemDescription] = useState('General Agency Services Retainer');
  const [itemQty, setItemQty] = useState(1);
  const [itemRate, setItemRate] = useState(0);

  const resetForm = () => {
    setClientId(clients[0]?.id || '');
    setAmount(0);
    setStatus('Unpaid');
    setIssueDate('');
    setDueDate('');
    setItemDescription('General Agency Services Retainer');
    setItemQty(1);
    setItemRate(0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!clientId && clients.length > 0) {
      alert('Onboard a CRM client contact first.');
      return;
    }

    // Auto calculate amount from quantities and rates if set
    const finalRate = itemRate > 0 ? itemRate : amount;
    const finalAmount = itemQty * finalRate;

    const lineItems = [
      { description: itemDescription, qty: itemQty, rate: finalRate, amount: finalAmount }
    ];

    await addInvoice({
      clientId: clientId || clients[0]?.id,
      amount: finalAmount,
      status,
      issueDate,
      dueDate,
      items: JSON.stringify(lineItems)
    });

    resetForm();
    setShowAddModal(false);
  };

  const handleToggleStatus = async (invoice) => {
    const nextStatus = invoice.status === 'Paid' ? 'Unpaid' : 'Paid';
    await editInvoiceStatus(invoice.id, nextStatus);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  // Financial calculations
  const totalBilled = sales.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalPaid = sales.filter(s => s.status === 'Paid').reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalUnpaid = sales.filter(s => s.status === 'Unpaid').reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalOverdue = sales.filter(s => s.status === 'Overdue').reduce((sum, item) => sum + parseFloat(item.amount), 0);

  return (
    <div>
      
      {/* Financial Metrics Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
        <div className="metric-card" style={{ padding: '16px' }}>
          <div className="metric-header" style={{ marginBottom: '8px' }}>
            <span>Total Earnings</span>
            <div className="metric-icon-box" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-active)' }}>
              <IndianRupee size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '22px' }}>{formatCurrency(totalPaid)}</div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Paid invoice settlements</p>
        </div>

        <div className="metric-card" style={{ padding: '16px' }}>
          <div className="metric-header" style={{ marginBottom: '8px' }}>
            <span>Accounts Outstanding</span>
            <div className="metric-icon-box" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-lead)' }}>
              <Landmark size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '22px' }}>{formatCurrency(totalUnpaid)}</div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Awaiting client funds</p>
        </div>

        <div className="metric-card" style={{ padding: '16px' }}>
          <div className="metric-header" style={{ marginBottom: '8px' }}>
            <span>Overdue Balances</span>
            <div className="metric-icon-box" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--priority-high)' }}>
              <AlertTriangle size={14} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '22px' }}>{formatCurrency(totalOverdue)}</div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Past payment thresholds</p>
        </div>
      </div>

      {/* Control filters bar */}
      <div className="filters-bar" style={{ justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          disabled={clients.length === 0}
        >
          <Plus size={16} />
          <span>Billing Invoice</span>
        </button>
      </div>

      {clients.length === 0 && (
        <div className="badge badge-high" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '24px', textTransform: 'none' }}>
          <span>💡 No client profiles onboarded yet. Please onboard a Client in the <b>Clients (CRM)</b> tab first before managing sales.</span>
        </div>
      )}

      {/* Sales Invoices Table */}
      <div className="table-container">
        <table className="saas-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Billed Client</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Billed Total</th>
              <th>Settlement Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td><span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{sale.invoiceNumber}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>{sale.Client?.company}</span>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{sale.Client?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{sale.issueDate}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{sale.dueDate}</span>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: '700' }}>{formatCurrency(sale.amount)}</span></td>
                  <td>
                    <span 
                      className={`badge ${sale.status === 'Paid' ? 'badge-active' : sale.status === 'Overdue' ? 'badge-high' : 'badge-medium'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleStatus(sale)}
                      title="Click to toggle Paid/Unpaid status"
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary btn-icon" 
                        title="Print Preview / Export PDF"
                        onClick={() => setActivePreviewInvoice(sale)}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-icon" 
                        title="Mark Paid"
                        style={{ color: 'var(--status-active)', borderColor: 'var(--status-active-bg)' }}
                        onClick={() => editInvoiceStatus(sale.id, 'Paid')}
                        disabled={sale.status === 'Paid'}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                  No billing invoices issued.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 1. NEW BILLING INVOICE MODAL OVERLAY */}
      {showAddModal && (
        <div className="dialog-backdrop">
          <div className="dialog-modal">
            
            <div className="dialog-header">
              <h3>Issue Billing Invoice</h3>
              <button className="dialog-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Client Recipient *</label>
                <select className="form-select" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div style={{ border: '1px dashed var(--border)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  Itemized Line Deliverable
                </span>
                
                <div className="form-group">
                  <label className="form-label">Service Description</label>
                  <input type="text" className="form-input" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-input" min="1" value={itemQty} onChange={(e) => setItemQty(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate / Unit Price (₹)</label>
                    <input type="number" className="form-input" value={itemRate} onChange={(e) => setItemRate(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input type="date" className="form-input" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invoice</button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 2. INVOICE PDF EXPORTER MODAL OVERLAY */}
      {activePreviewInvoice && (
        <InvoiceGenerator 
          invoice={activePreviewInvoice} 
          onClose={() => setActivePreviewInvoice(null)} 
        />
      )}

    </div>
  );
};

export default Sales;
