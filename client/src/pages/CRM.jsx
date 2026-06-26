import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import InvoiceGenerator from '../components/InvoiceGenerator';
import { 
  Plus, Search, Edit2, Trash2, Globe, Phone, 
  Mail, X, MessageSquare, PlusCircle, DollarSign, Key, Calendar, ShieldCheck,
  FileText
} from 'lucide-react';

const calendarStyles = `
@keyframes calendarPopupShow {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
`;

const CRM = () => {
  const { user } = useAuth();
  const { clients, addClient, editClient, removeClient, syncData } = useData();

  // Search & Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Calendar-based Date Filtering State
  const currentLocalDate = new Date();
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [filterType, setFilterType] = useState(null); // 'day' | 'month' | 'year' | null
  const [selectedMonth, setSelectedMonth] = useState(currentLocalDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(currentLocalDate.getFullYear()); // e.g. 2026
  const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'
  const [dateFilterActive, setDateFilterActive] = useState(false); // default false (show all records)

  // Extract date from record (issueDate or createdAt fallback)
  const getRecordDate = (client) => {
    if (client.issueDate) return client.issueDate;
    if (client.createdAt) return client.createdAt.split('T')[0];
    return '';
  };

  // Group record counts by month for selected year
  const getMonthRecordCounts = (year) => {
    const counts = Array(12).fill(0);
    clients.forEach(c => {
      const rDate = getRecordDate(c);
      if (rDate) {
        const [y, m] = rDate.split('-').map(Number);
        if (y === year) {
          counts[m - 1]++;
        }
      }
    });
    return counts;
  };

  // Group record counts by day for selected month and year
  const getDayRecordCounts = (year, month) => {
    const counts = {};
    clients.forEach(c => {
      const rDate = getRecordDate(c);
      if (rDate) {
        const [y, m, d] = rDate.split('-').map(Number);
        if (y === year && (m - 1) === month) {
          counts[d] = (counts[d] || 0) + 1;
        }
      }
    });
    return counts;
  };

  const monthCounts = getMonthRecordCounts(selectedYear);
  const dayCounts = getDayRecordCounts(selectedYear, selectedMonth);

  const handleMonthNav = (dir) => {
    let nextMonth = selectedMonth;
    let nextYear = selectedYear;
    
    if (dir === 'prev') {
      if (selectedMonth === 0) {
        nextMonth = 11;
        nextYear = selectedYear - 1;
      } else {
        nextMonth = selectedMonth - 1;
      }
    } else {
      if (selectedMonth === 11) {
        nextMonth = 0;
        nextYear = selectedYear + 1;
      } else {
        nextMonth = selectedMonth + 1;
      }
    }
    
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    setSelectedDate(null);
    setFilterType('month');
    setDateFilterActive(true);
  };

  const handleYearNav = (dir) => {
    const nextYear = dir === 'prev' ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(nextYear);
    setSelectedDate(null);
    setFilterType('month');
    setDateFilterActive(true);
  };

  // Calendar generation helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const daysGrid = [];
  
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  // Modal Dialogs Control
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeEditClient, setActiveEditClient] = useState(null);
  const [selectedClientLogs, setSelectedClientLogs] = useState(null);
  const [activePreviewInvoice, setActivePreviewInvoice] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [status, setStatus] = useState('Prospect');

  // --- NEW RESELLER & LICENSING STATES ---
  const [accountType, setAccountType] = useState('Business');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [subscriptionName, setSubscriptionName] = useState('');
  const [numberOfId, setNumberOfId] = useState(1);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [planDuration, setPlanDuration] = useState('12 Months');
  const [costPaidToDealer, setCostPaidToDealer] = useState(0);
  const [paymentFromCustomer, setPaymentFromCustomer] = useState(0);
  const [dealerName, setDealerName] = useState('');
  
  // Note Addition field
  const [newNoteText, setNewNoteText] = useState('');

  const resetForm = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setCountry('United States');
    setStatus('Prospect');

    // Reseller Form Resets
    setAccountType('Business');
    setWhatsappNumber('');
    setSubscriptionName('');
    setNumberOfId(1);
    setLoginEmail('');
    setLoginPassword('');
    setIssueDate('');
    setExpiryDate('');
    setPlanDuration('12 Months');
    setCostPaidToDealer(0);
    setPaymentFromCustomer(0);
    setDealerName('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await addClient({ 
      name, company, email, phone, country, status,
      accountType, whatsappNumber, subscriptionName, numberOfId,
      loginEmail, loginPassword, issueDate, expiryDate, planDuration,
      costPaidToDealer, paymentFromCustomer, dealerName
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeEditClient) return;
    await editClient(activeEditClient.id, { 
      name, company, email, phone, country, status,
      accountType, whatsappNumber, subscriptionName, numberOfId,
      loginEmail, loginPassword, issueDate, expiryDate, planDuration,
      costPaidToDealer, paymentFromCustomer, dealerName
    });
    setActiveEditClient(null);
    resetForm();
    syncData(); // Re-fetch
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client? This will remove all their project contracts.')) {
      await removeClient(id);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !selectedClientLogs) return;
    
    const logs = JSON.parse(selectedClientLogs.notes || '[]');
    const freshLog = {
      date: new Date().toISOString().split('T')[0],
      sender: user.name,
      text: newNoteText.trim()
    };
    logs.push(freshLog);

    const updatedNotesString = JSON.stringify(logs);
    
    // Save note via API edit
    await editClient(selectedClientLogs.id, { notes: updatedNotesString });
    
    // Update active modal layout
    setSelectedClientLogs(prev => ({
      ...prev,
      notes: updatedNotesString
    }));
    
    setNewNoteText('');
  };

  const triggerEditModal = (client) => {
    setActiveEditClient(client);
    setName(client.name);
    setCompany(client.company);
    setEmail(client.email);
    setPhone(client.phone || '');
    setCountry(client.country || 'United States');
    setStatus(client.status);

    // Populate Reseller fields
    setAccountType(client.accountType || 'Business');
    setWhatsappNumber(client.whatsappNumber || '');
    setSubscriptionName(client.subscriptionName || '');
    setNumberOfId(client.numberOfId || 1);
    setLoginEmail(client.loginEmail || '');
    setLoginPassword(client.loginPassword || '');
    setIssueDate(client.issueDate || '');
    setExpiryDate(client.expiryDate || '');
    setPlanDuration(client.planDuration || '12 Months');
    setCostPaidToDealer(client.costPaidToDealer || 0);
    setPaymentFromCustomer(client.paymentFromCustomer || 0);
    setDealerName(client.dealerName || '');
  };

  // Search & Filter Operations
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.company.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase()) ||
                          (c.subscriptionName && c.subscriptionName.toLowerCase().includes(search.toLowerCase())) ||
                          (c.dealerName && c.dealerName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilterActive) {
      const rDate = getRecordDate(c);
      if (!rDate) {
        matchesDate = false;
      } else {
        const [y, m, d] = rDate.split('-').map(Number);
        if (filterType === 'day' && selectedDate) {
          matchesDate = (rDate === selectedDate);
        } else if (filterType === 'month') {
          matchesDate = (y === selectedYear && (m - 1) === selectedMonth);
        } else if (filterType === 'year') {
          matchesDate = (y === selectedYear);
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-body)' }}>
      
      {/* Controls and filters tool bar */}
      <div className="filters-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div className="search-box-wrapper" style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
          <Search size={16} className="search-icon-pos" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input search-input"
            style={{ width: '100%', paddingLeft: '36px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)', paddingRight: '12px', height: '38px' }}
            placeholder="Search company, subscription, dealer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            className="form-select" 
            style={{ width: '160px', height: '38px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)', padding: '0 8px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Prospect">Prospect Accounts</option>
            <option value="Lead">Lead Pipelines</option>
            <option value="Closed">Closed Accounts</option>
          </select>

          {/* Calendar Filter Trigger and Dropdown Popup */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowCalendarPopup(prev => !prev)}
              style={{
                height: '38px',
                width: '38px',
                borderRadius: '8px',
                border: dateFilterActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: dateFilterActive ? 'var(--primary-light)' : 'var(--bg-light)',
                color: dateFilterActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              title="Calendar Filters"
            >
              <Calendar size={18} />
              {dateFilterActive && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)'
                }} />
              )}
            </button>

            {showCalendarPopup && (
              <>
                {/* Backdrop Click-Close overlay */}
                <div 
                  onClick={() => setShowCalendarPopup(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 998,
                    background: 'transparent'
                  }}
                />
                
                {/* Popover Card */}
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 999,
                  width: '300px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animation: 'calendarPopupShow 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {/* Style block for animations */}
                  <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />

                  {/* Header Navigators */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    
                    {/* Month Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button 
                        type="button" 
                        onClick={() => handleMonthNav('prev')}
                        style={{ background: 'var(--bg-light)', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        &lt;
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text)', minWidth: '40px', textAlign: 'center' }}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedMonth]}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleMonthNav('next')}
                        style={{ background: 'var(--bg-light)', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        &gt;
                      </button>
                    </div>

                    {/* Year Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button 
                        type="button" 
                        onClick={() => handleYearNav('prev')}
                        style={{ background: 'var(--bg-light)', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        &lt;
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text)', minWidth: '34px', textAlign: 'center' }}>
                        {selectedYear}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleYearNav('next')}
                        style={{ background: 'var(--bg-light)', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        &gt;
                      </button>
                    </div>

                  </div>

                  {/* Active Filter State Summary banner */}
                  {dateFilterActive && (
                    <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', backgroundColor: 'var(--primary-light)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                      Filtered: {filterType === 'day' ? selectedDate : filterType === 'year' ? selectedYear : `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedMonth]} ${selectedYear}`}
                    </div>
                  )}

                  {/* Calendar day grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                      {daysGrid.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} style={{ width: '32px', height: '32px' }} />;
                        }
                        
                        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSelectedDay = dateFilterActive && filterType === 'day' && selectedDate === dateStr;
                        const recordCount = dayCounts[day] || 0;
                        const hasRecords = recordCount > 0;

                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setFilterType('day');
                              setDateFilterActive(true);
                              setShowCalendarPopup(false);
                            }}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: isSelectedDay ? '2px solid var(--primary)' : 'none',
                              backgroundColor: isSelectedDay 
                                ? 'var(--primary-light)' 
                                : hasRecords 
                                  ? 'var(--bg-light)' 
                                  : 'transparent',
                              color: isSelectedDay 
                                ? 'var(--primary)' 
                                : hasRecords 
                                  ? 'var(--text)' 
                                  : 'var(--text-muted)',
                              fontSize: '11px',
                              fontWeight: isSelectedDay || hasRecords ? '700' : '400',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              transition: 'all 0.15s ease'
                            }}
                            title={hasRecords ? `${recordCount} record(s)` : ''}
                          >
                            <span>{day}</span>
                            {hasRecords && !isSelectedDay && (
                              <span style={{
                                position: 'absolute',
                                bottom: '3px',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)'
                              }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Filters Footer Actions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '10px', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                        setSelectedDate(todayStr);
                        setSelectedMonth(today.getMonth());
                        setSelectedYear(today.getFullYear());
                        setFilterType('day');
                        setDateFilterActive(true);
                        setShowCalendarPopup(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'var(--bg-light)',
                        color: 'var(--text)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        setSelectedMonth(today.getMonth());
                        setSelectedYear(today.getFullYear());
                        setSelectedDate(null);
                        setFilterType('month');
                        setDateFilterActive(true);
                        setShowCalendarPopup(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'var(--bg-light)',
                        color: 'var(--text)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        setSelectedYear(today.getFullYear());
                        setSelectedDate(null);
                        setFilterType('year');
                        setDateFilterActive(true);
                        setShowCalendarPopup(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'var(--bg-light)',
                        color: 'var(--text)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      This Year
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDateFilterActive(false);
                        setSelectedDate(null);
                        setFilterType(null);
                        setShowCalendarPopup(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        color: 'var(--priority-high)',
                        backgroundColor: 'var(--priority-high-bg)'
                      }}
                    >
                      Clear
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', height: '38px' }}>
            <Plus size={16} />
            <span>Onboard Client</span>
          </button>
        </div>
      </div>

      {/* Main CRM profiles Table with horizontal scroll support */}
      <div className="table-container" style={{ overflowX: 'auto', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="saas-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '1600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--bg-light)' }}>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Client Name</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Account Type</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Country Name</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Whatsapp Number</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Subscription Name</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Number of ID</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Login Email</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Login Password</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Issue Date</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Expiry Date</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Months & Years Plans</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Paid to Dealer</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Rec. from Customer</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Profit</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Dealer Name</th>
              <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right', position: 'sticky', right: 0, backgroundColor: 'var(--bg-light)', boxShadow: '-4px 0 8px rgba(0,0,0,0.05)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const profitVal = parseFloat(client.paymentFromCustomer || 0) - parseFloat(client.costPaidToDealer || 0);
                
                return (
                  <tr key={client.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                    {/* 1. Client Name & Company */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text)' }}>{client.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.company}</span>
                      </div>
                    </td>

                    {/* 2. Account Type */}
                    <td style={{ padding: '14px' }}>
                      <span className="badge badge-active" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text)', fontSize: '11px', padding: '4px 8px' }}>
                        {client.accountType || 'Business'}
                      </span>
                    </td>

                    {/* 3. Country Location */}
                    <td style={{ padding: '14px', color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{client.country || 'N/A'}</span>
                      </div>
                    </td>

                    {/* 4. Whatsapp Number */}
                    <td style={{ padding: '14px', color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{client.whatsappNumber || client.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* 5. Subscription Name */}
                    <td style={{ padding: '14px', color: 'var(--text)', fontWeight: '600' }}>
                      {client.subscriptionName || 'N/A'}
                    </td>

                    {/* 6. Number of ID */}
                    <td style={{ padding: '14px', color: 'var(--text)', textAlign: 'center' }}>
                      {client.numberOfId !== undefined ? client.numberOfId : 1}
                    </td>

                    {/* 7. Login Email */}
                    <td style={{ padding: '14px', color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{client.loginEmail || client.email}</span>
                      </div>
                    </td>

                    {/* 8. Login Password */}
                    <td style={{ padding: '14px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {client.loginPassword || '••••••••'}
                    </td>

                    {/* 9. Issue Date */}
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      {client.issueDate || 'N/A'}
                    </td>

                    {/* 10. Expiry Date */}
                    <td style={{ padding: '14px', color: 'var(--text)' }}>
                      {client.expiryDate ? (
                        <span style={{ fontWeight: '500' }}>{client.expiryDate}</span>
                      ) : 'N/A'}
                    </td>

                    {/* 11. Months & Years Plans */}
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      {client.planDuration || '12 Months'}
                    </td>

                    {/* 12. Paid by us to Dealer */}
                    <td style={{ padding: '14px', color: 'hsl(354, 85%, 56%)', fontWeight: '600' }}>
                      ₹{parseFloat(client.costPaidToDealer || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* 13. Payment Received from Customer */}
                    <td style={{ padding: '14px', color: 'hsl(142, 70%, 29%)', fontWeight: '600' }}>
                      ₹{parseFloat(client.paymentFromCustomer || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* 14. Net Profit calculated dynamically */}
                    <td style={{ 
                      padding: '14px', 
                      fontWeight: '700', 
                      color: profitVal >= 0 ? 'hsl(142, 70%, 29%)' : 'hsl(354, 85%, 56%)',
                      backgroundColor: profitVal >= 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                    }}>
                      ₹{profitVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* 15. Dealer Name */}
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                      {client.dealerName || 'N/A'}
                    </td>

                    {/* Stickied Actions panel */}
                    <td style={{ 
                      padding: '14px', 
                      textAlign: 'right', 
                      position: 'sticky', 
                      right: 0, 
                      backgroundColor: 'var(--card-bg)', 
                      boxShadow: '-4px 0 8px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary btn-icon" 
                          title="Download Invoice"
                          onClick={() => {
                            const virtualInvoice = {
                              invoiceNumber: `${String(clients.indexOf(client) + 1).padStart(3, '0')}`,
                              issueDate: client.issueDate || new Date().toISOString().split('T')[0],
                              dueDate: client.expiryDate || new Date().toISOString().split('T')[0],
                              amount: parseFloat(client.paymentFromCustomer || 0),
                              status: client.status === 'Active' ? 'Paid' : 'Unpaid',
                              items: JSON.stringify([
                                { 
                                  description: `${client.subscriptionName || 'SaaS Agency Subscription'} - ${client.planDuration || '12 Months Plan'} (${client.numberOfId || 1} Licenses)`, 
                                  qty: 1, 
                                  rate: parseFloat(client.paymentFromCustomer || 0), 
                                  amount: parseFloat(client.paymentFromCustomer || 0) 
                                }
                              ]),
                              Client: {
                                name: client.name,
                                company: client.company,
                                email: client.email,
                                phone: client.phone,
                                country: client.country
                              }
                            };
                            setActivePreviewInvoice(virtualInvoice);
                          }}
                          style={{ padding: '6px', borderRadius: '6px' }}
                        >
                          <FileText size={13} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon" 
                          title="Journal Logs"
                          onClick={() => setSelectedClientLogs(client)}
                          style={{ padding: '6px', borderRadius: '6px' }}
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon" 
                          title="Edit Profile"
                          onClick={() => triggerEditModal(client)}
                          style={{ padding: '6px', borderRadius: '6px' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        {user?.role === 'Admin' && (
                          <button 
                            className="btn btn-danger btn-icon" 
                            title="Remove Client"
                            onClick={() => handleDelete(client.id)}
                            style={{ padding: '6px', borderRadius: '6px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="16" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  {dateFilterActive ? (
                    <div>
                      <p style={{ margin: 0, fontWeight: '650', color: 'var(--text)' }}>No CRM client profiles found matching the active date filters.</p>
                      <p style={{ margin: '6px 0 0', fontSize: '12px' }}>
                        Try choosing a different month or click <button onClick={() => { setDateFilterActive(false); setSelectedDate(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Clear Filter</button> to see all.
                      </p>
                    </div>
                  ) : (
                    'No CRM client profiles matched the search criteria.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> {/* Table container ends */}

      {/* 1. ADD CLIENT MODAL OVERLAY */}
      {showAddModal && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="dialog-header">
              <h3>Onboard Client & License Profile</h3>
              <button className="dialog-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Clark Kent" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input type="text" className="form-input" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Daily Planet" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. contact@dailyplanet.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Whatsapp Number</label>
                  <input type="text" className="form-input" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select className="form-select" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Country Location</label>
                  <input type="text" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>🔐 System Login Credentials</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Login Email</label>
                    <input type="email" className="form-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="login@portal.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Login Password</label>
                    <input type="text" className="form-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password Key" />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>💰 Subscription & Reseller Ledger</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Subscription Name</label>
                    <input type="text" className="form-input" value={subscriptionName} onChange={(e) => setSubscriptionName(e.target.value)} placeholder="Gold Plan" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of ID</label>
                    <input type="number" className="form-input" value={numberOfId} onChange={(e) => setNumberOfId(parseInt(e.target.value) || 1)} min="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Months & Years plans</label>
                    <input type="text" className="form-input" value={planDuration} onChange={(e) => setPlanDuration(e.target.value)} placeholder="12 Months" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input type="date" className="form-input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" className="form-input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Paid to Dealer (₹)</label>
                    <input type="number" className="form-input" value={costPaidToDealer} onChange={(e) => setCostPaidToDealer(parseFloat(e.target.value) || 0)} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rec. from Customer (₹)</label>
                    <input type="number" className="form-input" value={paymentFromCustomer} onChange={(e) => setPaymentFromCustomer(parseFloat(e.target.value) || 0)} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dealer Name</label>
                    <input type="text" className="form-input" value={dealerName} onChange={(e) => setDealerName(e.target.value)} placeholder="Reseller Co" />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <label className="form-label">CRM Lifecycle Phase</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Lead">Lead Pipeline</option>
                  <option value="Prospect">Prospect Account</option>
                  <option value="Active">Active Account</option>
                  <option value="Closed">Closed Account</option>
                </select>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT CLIENT MODAL OVERLAY */}
      {activeEditClient && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="dialog-header">
              <h3>Edit CRM & Licensing Profile</h3>
              <button className="dialog-close" onClick={() => setActiveEditClient(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input type="text" className="form-input" required value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Whatsapp Number</label>
                  <input type="text" className="form-input" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select className="form-select" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Country Location</label>
                  <input type="text" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>🔐 System Login Credentials</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Login Email</label>
                    <input type="email" className="form-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Login Password</label>
                    <input type="text" className="form-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>💰 Subscription & Reseller Ledger</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Subscription Name</label>
                    <input type="text" className="form-input" value={subscriptionName} onChange={(e) => setSubscriptionName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of ID</label>
                    <input type="number" className="form-input" value={numberOfId} onChange={(e) => setNumberOfId(parseInt(e.target.value) || 1)} min="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Months & Years plans</label>
                    <input type="text" className="form-input" value={planDuration} onChange={(e) => setPlanDuration(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input type="date" className="form-input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" className="form-input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Paid to Dealer (₹)</label>
                    <input type="number" className="form-input" value={costPaidToDealer} onChange={(e) => setCostPaidToDealer(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rec. from Customer (₹)</label>
                    <input type="number" className="form-input" value={paymentFromCustomer} onChange={(e) => setPaymentFromCustomer(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dealer Name</label>
                    <input type="text" className="form-input" value={dealerName} onChange={(e) => setDealerName(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <label className="form-label">CRM Lifecycle Phase</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Lead">Lead Pipeline</option>
                  <option value="Prospect">Prospect Account</option>
                  <option value="Active">Active Account</option>
                  <option value="Closed">Closed Account</option>
                </select>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveEditClient(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CRM COMMUNICATIONS JOURNAL DIALOG OVERLAY */}
      {selectedClientLogs && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '600px', width: '90%' }}>
            
            <div className="dialog-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px' }}>Interaction Journal</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedClientLogs.name} — <b>{selectedClientLogs.company}</b>
                </p>
              </div>
              <button className="dialog-close" onClick={() => setSelectedClientLogs(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Note logs list container */}
            <div style={{ maxHeight: '250px', overflowY: 'auto', margin: '20px 0', padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {JSON.parse(selectedClientLogs.notes || '[]').length > 0 ? (
                JSON.parse(selectedClientLogs.notes || '[]').map((log, idx) => (
                  <div key={idx} style={{ backgroundColor: 'var(--bg-light)', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px' }}>
                      <span>BY: {log.sender}</span>
                      <span>DATE: {log.date}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0 }}>{log.text}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px 0' }}>
                  No journals registered for this client contact.
                </div>
              )}
            </div>

            {/* Note Logger Input Form */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)', padding: '8px 12px' }}
                placeholder="Log a client interaction (e.g. Call notes, email follow up)..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button className="btn btn-primary" onClick={handleAddNote} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}>
                <PlusCircle size={15} />
                <span>Log Note</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {activePreviewInvoice && (
        <InvoiceGenerator 
          invoice={activePreviewInvoice} 
          onClose={() => setActivePreviewInvoice(null)} 
        />
      )}

    </div>
  );
};

export default CRM;

