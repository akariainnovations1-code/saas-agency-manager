import React, { useState } from 'react';
import { FileText, Printer, X, Download, Loader2 } from 'lucide-react';
import logo from '../logo.png';

const InvoiceGenerator = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const items = JSON.parse(invoice.items || '[]');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector('.invoice-sheet-container');
    if (!element) return;

    setDownloading(true);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `invoice_${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    import('html2pdf.js').then((module) => {
      const html2pdf = module.default;
      html2pdf().from(element).set(opt).save().then(() => {
        setDownloading(false);
      }).catch(err => {
        console.error('PDF Save failed:', err);
        setDownloading(false);
      });
    }).catch(err => {
      console.error('Failed to load html2pdf.js dynamically:', err);
      setDownloading(false);
    });
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 1100 }}>
      <div className="dialog-modal" style={{ maxWidth: '850px', width: '90%', padding: '24px' }}>

        {/* Modal Controls header */}
        <div className="dialog-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <h3 style={{ display: 'flex', alignState: 'center', gap: '8px' }}>
            <FileText size={22} style={{ color: 'var(--primary)' }} />
            <span>Invoice Sheet Review</span>
          </h3>
          <div style={{ display: 'flex', alignState: 'center', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {downloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
            <button className="btn btn-secondary" onClick={handlePrint} style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Printer size={14} />
              <span>Export PDF / Print</span>
            </button>
            <button className="dialog-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable sheet element */}
        <div className="invoice-print-wrapper" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px 8px' }}>
          <div className="invoice-sheet-container">

            {/* Logo and billing entities header */}
            <div className="invoice-sheet-header">
              <div className="invoice-company-info">
                <div className="invoice-logo-wrapper">
                  <img
                    src={logo}
                    alt="Akaria Innovations Logo"
                    className="invoice-logo"
                  />
                </div>
                <p className="company-address">
                  Naraina Vihar<br />
                  New Delhi, 110028<br />
                  Phone: +91 8595489469<br />
                  Website: akariainnovations.com
                </p>
              </div>
              <div className="invoice-sheet-meta">
                <h1>INVOICE</h1>
                <p className="meta-details">
                  Invoice Number: {invoice.invoiceNumber}<br />
                  Issue Date: {invoice.issueDate}<br />
                  Due Date: {invoice.dueDate}
                </p>
              </div>
            </div>

            {/* Entity addresses details */}
            <div className="invoice-sheet-details">
              <div className="billing-to">
                <h3>Billed To:</h3>
                <p className="client-name">
                  {invoice.Client ? invoice.Client.name : 'Client Contact'}<br />
                  <span className="client-company">{invoice.Client ? invoice.Client.company : 'Client Company'}</span>
                </p>
                <p className="client-contact-info">
                  {invoice.Client ? invoice.Client.email : ''}<br />
                  {invoice.Client ? invoice.Client.phone : ''}<br />
                  {invoice.Client ? invoice.Client.country : ''}
                </p>
              </div>
              <div className="payment-details">
                <h3>Payment Details:</h3>
                <div style={{ marginTop: '8px' }}>
                  <span className={`badge ${invoice.status === 'Paid' ? 'badge-active' : invoice.status === 'Overdue' ? 'badge-high' : 'badge-medium'}`} style={{ fontSize: '12px' }}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Line items Table */}
            <table className="invoice-sheet-table">
              <thead>
                <tr>
                  <th style={{ width: '55%', textAlign: 'left' }}>Description</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Rate</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'left' }}>{item.description}</td>
                      <td style={{ textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.qty * item.rate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ textAlign: 'left' }}>General Consulting and Agency Retainer</td>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.amount)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.amount)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Sub-total summary box */}
            <div className="invoice-sheet-summary">
              <div className="invoice-sheet-summary-box">
                <div className="invoice-sheet-summary-row">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="invoice-sheet-summary-row">
                  <span className="summary-label">Tax (0%):</span>
                  <span className="summary-value">₹0.00</span>
                </div>
                <div className="invoice-sheet-summary-row invoice-sheet-summary-total">
                  <span className="total-label">Balance Due:</span>
                  <span className="total-value">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </div>

            <div className="invoice-footer">
              Thank you for partnering with Akaria Innovations. Payments are due within 15 days of invoice issue dates.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceGenerator;
