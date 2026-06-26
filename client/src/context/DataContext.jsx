import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  
  // State variables
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sales, setSales] = useState([]);
  const [leads, setLeads] = useState([]);
  const [team, setTeam] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  const [loading, setLoading] = useState(false);

  // Fetch all operations datasets
  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [statsData, clientsData, projectsData, tasksData, salesData, leadsData, teamData, documentsData] = await Promise.all([
        api('/reports/stats').catch(() => null),
        api('/crm').catch(() => []),
        api('/projects').catch(() => []),
        api('/tasks').catch(() => []),
        // Conditional fetches based on role capabilities
        user.role !== 'Employee' ? api('/sales').catch(() => []) : Promise.resolve([]),
        user.role !== 'Employee' ? api('/leads').catch(() => []) : Promise.resolve([]),
        api('/team').catch(() => []),
        api('/documents').catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      setClients(clientsData || []);
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setSales(salesData || []);
      setLeads(leadsData || []);
      setTeam(teamData || []);
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Failed to sync operation datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch on user login
  useEffect(() => {
    fetchAllData();
  }, [user]);

  const refreshStats = async () => {
    try {
      const statsData = await api('/reports/stats');
      if (statsData) setStats(statsData);
    } catch (e) {
      console.error('Stats reload error:', e);
    }
  };

  // --- CRM ACTIONS ---
  const addClient = async (clientBody) => {
    const fresh = await api('/crm', { method: 'POST', body: clientBody });
    if (fresh) {
      setClients(prev => [fresh, ...prev]);
      refreshStats();
    }
  };

  const editClient = async (id, clientBody) => {
    const updated = await api(`/crm/${id}`, { method: 'PUT', body: clientBody });
    if (updated) {
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      refreshStats();
    }
  };

  const removeClient = async (id) => {
    const ok = await api(`/crm/${id}`, { method: 'DELETE' });
    if (ok) {
      setClients(prev => prev.filter(c => c.id !== id));
      refreshStats();
    }
  };

  // --- PROJECTS ACTIONS ---
  const addProject = async (projectBody) => {
    const fresh = await api('/projects', { method: 'POST', body: projectBody });
    if (fresh) {
      setProjects(prev => [fresh, ...prev]);
      refreshStats();
    }
  };

  const editProject = async (id, projectBody) => {
    const updated = await api(`/projects/${id}`, { method: 'PUT', body: projectBody });
    if (updated) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      refreshStats();
    }
  };

  const removeProject = async (id) => {
    const ok = await api(`/projects/${id}`, { method: 'DELETE' });
    if (ok) {
      setProjects(prev => prev.filter(p => p.id !== id));
      refreshStats();
    }
  };

  // --- TASKS ACTIONS ---
  const addTask = async (taskBody) => {
    const fresh = await api('/tasks', { method: 'POST', body: taskBody });
    if (fresh) {
      setTasks(prev => [fresh, ...prev]);
      // Update local project progress if server triggered it
      await fetchAllData(); 
    }
  };

  const editTask = async (id, taskBody) => {
    const updated = await api(`/tasks/${id}`, { method: 'PUT', body: taskBody });
    if (updated) {
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      // Re-sync all to mirror progress change updates in project lists
      await fetchAllData();
    }
  };

  const removeTask = async (id) => {
    const ok = await api(`/tasks/${id}`, { method: 'DELETE' });
    if (ok) {
      setTasks(prev => prev.filter(t => t.id !== id));
      await fetchAllData();
    }
  };

  const addTaskComment = async (taskId, commentText) => {
    const newComment = await api(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: { text: commentText }
    });
    if (newComment) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const cms = JSON.parse(t.comments || '[]');
          cms.push(newComment);
          return { ...t, comments: JSON.stringify(cms) };
        }
        return t;
      }));
    }
  };

  // --- SALES & BILLING ACTIONS ---
  const addInvoice = async (invoiceBody) => {
    const fresh = await api('/sales', { method: 'POST', body: invoiceBody });
    if (fresh) {
      setSales(prev => [fresh, ...prev]);
      refreshStats();
    }
  };

  const editInvoiceStatus = async (id, status) => {
    const updated = await api(`/sales/${id}`, { method: 'PUT', body: { status } });
    if (updated) {
      setSales(prev => prev.map(s => s.id === id ? updated : s));
      refreshStats();
    }
  };

  // --- LEADS ACTIONS ---
  const addLead = async (leadBody) => {
    const fresh = await api('/leads', { method: 'POST', body: leadBody });
    if (fresh) {
      setLeads(prev => [fresh, ...prev]);
      refreshStats();
    }
  };

  const editLead = async (id, leadBody) => {
    const updated = await api(`/leads/${id}`, { method: 'PUT', body: leadBody });
    if (updated) {
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
      refreshStats();
    }
  };

  const removeLead = async (id) => {
    const ok = await api(`/leads/${id}`, { method: 'DELETE' });
    if (ok) {
      setLeads(prev => prev.filter(l => l.id !== id));
      refreshStats();
    }
  };

  // --- TEAM ACTIONS ---
  const updateTeamRole = async (id, newRole) => {
    const updated = await api(`/team/${id}`, { method: 'PUT', body: { role: newRole } });
    if (updated) {
      setTeam(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    }
  };

  // --- DOCUMENTS ACTIONS ---
  const addDocument = async (docBody) => {
    const fresh = await api('/documents', { method: 'POST', body: docBody });
    if (fresh) {
      setDocuments(prev => [fresh, ...prev]);
      refreshStats();
    }
  };

  const removeDocument = async (id) => {
    const ok = await api(`/documents/${id}`, { method: 'DELETE' });
    if (ok) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      refreshStats();
    }
  };

  return (
    <DataContext.Provider value={{
      stats, loading, clients, projects, tasks, sales, leads, team, documents,
      syncData: fetchAllData,
      addClient, editClient, removeClient,
      addProject, editProject, removeProject,
      addTask, editTask, removeTask, addTaskComment,
      addInvoice, editInvoiceStatus,
      addLead, editLead, removeLead,
      updateTeamRole,
      addDocument, removeDocument
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
