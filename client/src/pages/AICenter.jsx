import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import api from '../utils/api';
import { Sparkles, FileText, Mail, FileCode, CheckSquare, BarChart, Copy, Check, Plus, AlertCircle } from 'lucide-react';

const AICenter = () => {
  const { addTask, projects } = useData();
  const [activeTab, setActiveTab] = useState('proposal');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // States for individual AI tools
  const [proposalInputs, setProposalInputs] = useState({ clientName: 'Stark Industries', niche: 'Clean Energy CRM & SEO', budget: '25000' });
  const [proposalOutput, setProposalOutput] = useState('');

  const [invoiceInput, setInvoiceInput] = useState('CRM Platform Core Dashboard');
  const [invoiceOutput, setInvoiceOutput] = useState('');

  const [emailInputs, setEmailInputs] = useState({ recipientName: 'Bruce Wayne', type: 'overdue', invoiceNumber: '004', amount: '8500' });
  const [emailOutput, setEmailOutput] = useState({ subject: '', body: '' });

  const [meetingNotes, setMeetingNotes] = useState('Sarah said the figma mockups look clean but need responsive styling. Jim needs to refactor grids in 3 days. Michael said we should hold off onTwilio integration till Q3. Sarah will execute the invoices check.');
  const [meetingOutput, setMeetingOutput] = useState('');

  const [scopeInput, setScopeInput] = useState('Build operations database with Sequelize models and custom cascade delete constraints.');
  const [tasksOutput, setTasksOutput] = useState([]);
  const [injectedTasks, setInjectedTasks] = useState({});

  const [forecastOutput, setForecastOutput] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI Proposal Generator Action
  const handleGenerateProposal = async () => {
    setLoading(true);
    try {
      const res = await api('/ai/proposal', {
        method: 'POST',
        body: proposalInputs
      });
      if (res) setProposalOutput(res.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // AI Invoice Description Action
  const handleGenerateInvoiceDesc = async () => {
    setLoading(true);
    try {
      const res = await api('/ai/invoice', {
        method: 'POST',
        body: { projectTitle: invoiceInput }
      });
      if (res) setInvoiceOutput(res.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // AI Email Writer Action
  const handleGenerateEmail = async () => {
    setLoading(true);
    try {
      const res = await api('/ai/email', {
        method: 'POST',
        body: {
          recipientName: emailInputs.recipientName,
          emailType: emailInputs.type,
          invoiceNumber: emailInputs.invoiceNumber,
          amount: emailInputs.amount
        }
      });
      if (res) setEmailOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // AI Meeting Notes Summary Action
  const handleGenerateMeetingSummary = async () => {
    setLoading(true);
    try {
      const res = await api('/ai/meeting', {
        method: 'POST',
        body: { rawNotes: meetingNotes }
      });
      if (res) setMeetingOutput(res.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // AI Task Recommendation Action
  const handleRecommendTasks = async () => {
    setLoading(true);
    try {
      const res = await api('/ai/tasks', {
        method: 'POST',
        body: { projectScope: scopeInput }
      });
      if (res) setTasksOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // AI Inject Task into Database
  const handleInjectTask = async (task, index) => {
    // Pick the first available project in context to bind task to
    const defaultProjId = projects.length > 0 ? projects[0].id : null;
    if (!defaultProjId) {
      alert('Please create a project first before injecting task cards.');
      return;
    }

    try {
      await addTask({
        name: task.name,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: defaultProjId,
        status: 'Todo'
      });
      setInjectedTasks(prev => ({ ...prev, [index]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  // AI Revenue Forecast Action
  const handleForecastRevenue = async () => {
    setLoading(true);
    try {
      const res = await api('/ai/forecast');
      if (res) setForecastOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>

      {/* Tab Navigation header */}
      <div className="glass-panel" style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: 'proposal', name: 'Proposal Builder', icon: FileText },
          { id: 'invoice', name: 'Billing Terms', icon: FileCode },
          { id: 'email', name: 'Email Assistant', icon: Mail },
          { id: 'meeting', name: 'Meeting Summarizer', icon: CheckSquare },
          { id: 'tasks', name: 'Task Auditor', icon: CheckSquare },
          { id: 'forecast', name: 'Revenue Modeler', icon: BarChart }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCopied(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={15} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Action Workspaces */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', minHeight: '400px' }}>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '350px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span>Akaria Innovations AI Engine generating response...</span>
            </div>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr', gap: '32px' }}>

            {/* Left Side: Inputs */}
            <div>

              {activeTab === 'proposal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>AI Proposal Generator</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Type prospective customer parameters to compile structural onboarding scopes, milestones breakdowns, and budget allocations.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Client Legal Company</label>
                      <input
                        type="text"
                        value={proposalInputs.clientName}
                        onChange={e => setProposalInputs(p => ({ ...p, clientName: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Operations Niche</label>
                      <input
                        type="text"
                        value={proposalInputs.niche}
                        onChange={e => setProposalInputs(p => ({ ...p, niche: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Budget Allowance (₹)</label>
                      <input
                        type="number"
                        value={proposalInputs.budget}
                        onChange={e => setProposalInputs(p => ({ ...p, budget: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={handleGenerateProposal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                    <Sparkles size={14} />
                    <span>Compile Scope Document</span>
                  </button>
                </div>
              )}

              {activeTab === 'invoice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>AI Invoice Description Generator</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Create detailed legal billing logs and itemized task scopes to present inside PDF invoice exports.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Project Deliverables Title</label>
                    <input
                      type="text"
                      value={invoiceInput}
                      onChange={e => setInvoiceInput(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleGenerateInvoiceDesc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                    <Sparkles size={14} />
                    <span>Compile Invoice Terms</span>
                  </button>
                </div>
              )}

              {activeTab === 'email' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>AI Email Writer</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Compose onboarding warm greetings or urgent payment alerts.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email Template Choice</label>
                      <select
                        value={emailInputs.type}
                        onChange={e => setEmailInputs(p => ({ ...p, type: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                      >
                        <option value="overdue">Overdue Invoices Reminder</option>
                        <option value="welcome">Welcome Onboarding Greeting</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recipient Name</label>
                      <input
                        type="text"
                        value={emailInputs.recipientName}
                        onChange={e => setEmailInputs(p => ({ ...p, recipientName: e.target.value }))}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                      />
                    </div>

                    {emailInputs.type === 'overdue' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Invoice ID</label>
                          <input
                            type="text"
                            value={emailInputs.invoiceNumber}
                            onChange={e => setEmailInputs(p => ({ ...p, invoiceNumber: e.target.value }))}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outstanding (₹)</label>
                          <input
                            type="number"
                            value={emailInputs.amount}
                            onChange={e => setEmailInputs(p => ({ ...p, amount: e.target.value }))}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="btn btn-primary" onClick={handleGenerateEmail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                    <Sparkles size={14} />
                    <span>Draft Email Copy</span>
                  </button>
                </div>
              )}

              {activeTab === 'meeting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>AI Meeting Summary</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Paste unorganized raw bullet points or brainstorming scripts, and let the AI extract decisions and deliverable checklists.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Raw meeting comments log</label>
                    <textarea
                      rows={6}
                      value={meetingNotes}
                      onChange={e => setMeetingNotes(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)', resize: 'none', fontSize: '12px', lineHeight: '1.4' }}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleGenerateMeetingSummary} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                    <Sparkles size={14} />
                    <span>Extract Summary Actions</span>
                  </button>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>AI Kanban Task Recommender</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Describe a project scope or core deliverable, and let the AI draft specific, actionable Kanban cards.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Project Scope description</label>
                    <textarea
                      rows={5}
                      value={scopeInput}
                      onChange={e => setScopeInput(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-light)', color: 'var(--text)', resize: 'none', fontSize: '12px', lineHeight: '1.4' }}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleRecommendTasks} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                    <Sparkles size={14} />
                    <span>Audit Scope & Get Cards</span>
                  </button>
                </div>
              )}

              {activeTab === 'forecast' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '15px', fontWeight: '600' }}>AI Compound Revenue Forecast</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Audits active agency databases, subscription models, churn records, and outstanding sales ledgers to model compounded forecasts.
                  </p>

                  <button className="btn btn-primary" onClick={handleForecastRevenue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                    <Sparkles size={14} />
                    <span>Compile Forecast Analysis</span>
                  </button>
                </div>
              )}

            </div>

            {/* Right Side: Generated Outputs (Highly polished Preview pane) */}
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '350px' }}>

              <div style={{ flex: 1 }}>

                {/* 1. Proposal Output preview */}
                {activeTab === 'proposal' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Agreement Scope Document</span>
                      {proposalOutput && (
                        <button
                          onClick={() => copyToClipboard(proposalOutput)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? 'Copied!' : 'Copy to Draft'}</span>
                        </button>
                      )}
                    </div>
                    <div style={{
                      maxHeight: '340px', overflowY: 'auto', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-light)', color: 'var(--text)', fontSize: '12.5px', lineHeight: '1.5', fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {proposalOutput || 'Awaiting criteria to compile document...'}
                    </div>
                  </div>
                )}

                {/* 2. Invoice Terms preview */}
                {activeTab === 'invoice' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)' }}>PDF Invoice Ledger Details</span>
                      {invoiceOutput && (
                        <button
                          onClick={() => copyToClipboard(invoiceOutput)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? 'Copied!' : 'Copy description'}</span>
                        </button>
                      )}
                    </div>
                    <div style={{
                      maxHeight: '340px', overflowY: 'auto', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-light)', color: 'var(--text)', fontSize: '12.5px', lineHeight: '1.5',
                      fontStyle: invoiceOutput ? 'normal' : 'italic'
                    }}>
                      {invoiceOutput || 'Ready to compile detailed legal terms based on project title...'}
                    </div>
                  </div>
                )}

                {/* 3. Email Preview */}
                {activeTab === 'email' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Email Draft Preview</span>
                      {emailOutput.body && (
                        <button
                          onClick={() => copyToClipboard(`Subject: ${emailOutput.subject}\n\n${emailOutput.body}`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? 'Copied!' : 'Copy entire mail'}</span>
                        </button>
                      )}
                    </div>

                    {emailOutput.body ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-light)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12.5px', fontWeight: '600', color: 'var(--text)' }}>
                          <strong>Subject:</strong> {emailOutput.subject}
                        </div>
                        <div style={{
                          maxHeight: '260px', overflowY: 'auto', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-light)', color: 'var(--text)', fontSize: '12px', lineHeight: '1.5',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {emailOutput.body}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '40px 16px', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                        No email draft compiles logged. Click "Draft Email Copy" on the left.
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Meeting Notes Preview */}
                {activeTab === 'meeting' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Extracted Decision Report</span>
                      {meetingOutput && (
                        <button
                          onClick={() => copyToClipboard(meetingOutput)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                        </button>
                      )}
                    </div>
                    <div style={{
                      maxHeight: '340px', overflowY: 'auto', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-light)', color: 'var(--text)', fontSize: '12.5px', lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {meetingOutput || 'Awaiting meeting raw logs inputs...'}
                    </div>
                  </div>
                )}

                {/* 5. Recommended Kanban Tasks Cards List */}
                {activeTab === 'tasks' && (
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Audited Kanban Recommendations</span>

                    {tasksOutput.length === 0 ? (
                      <div style={{ padding: '40px 16px', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                        Ready to extract structural Kanban card models. Click recommendation trigger on the left.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                        {tasksOutput.map((task, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--bg-light)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '12px'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className={`badge badge-${task.priority === 'High' ? 'active' : 'inactive'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                                  {task.priority} Priority
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Due: {task.dueDate}</span>
                              </div>
                              <h4 style={{ margin: '6px 0 2px 0', fontSize: '12.5px', fontWeight: '600', color: 'var(--text)' }}>{task.name}</h4>
                              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{task.description}</p>
                            </div>

                            <button
                              disabled={injectedTasks[idx]}
                              onClick={() => handleInjectTask(task, idx)}
                              style={{
                                background: injectedTasks[idx] ? 'hsl(142, 70%, 92%)' : 'var(--primary)',
                                color: injectedTasks[idx] ? 'hsl(142, 70%, 29%)' : '#ffffff',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: injectedTasks[idx] ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {injectedTasks[idx] ? <Check size={12} /> : <Plus size={12} />}
                              <span>{injectedTasks[idx] ? 'Injected' : 'Add Card'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Forecast Output Preview */}
                {activeTab === 'forecast' && (
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Revenue compound projections model</span>

                    {!forecastOutput ? (
                      <div style={{ padding: '40px 16px', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                        Click compiles forecast analysis to trigger compounds predictions models.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '12px', lineHeight: '1.4', color: 'var(--text)' }}>
                          <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '4px' }}>AI Predictive Model Strategy:</div>
                          {forecastOutput.summary}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '6px 8px', fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                            <span>Month</span>
                            <span>MRR Target</span>
                            <span>Exp. Renewal</span>
                            <span>Growth Rate</span>
                          </div>

                          {forecastOutput.projections.map(proj => (
                            <div key={proj.month} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '6px 8px', fontSize: '12px', color: 'var(--text)' }}>
                              <span style={{ fontWeight: '500' }}>{proj.month}</span>
                              <span style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{proj.mrr.toLocaleString('en-IN')}</span>
                              <span style={{ color: 'var(--text-muted)' }}>₹{proj.renewalForecast.toLocaleString('en-IN')}</span>
                              <span style={{ color: 'hsl(142, 70%, 29%)', fontWeight: '500' }}>+{proj.growth}</span>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default AICenter;
