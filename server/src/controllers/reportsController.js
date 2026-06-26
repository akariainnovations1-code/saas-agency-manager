const { sequelize, Project, Client, Task, Sale, Lead, Activity, User } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Core Counts
    const totalClientsCount = await Client.count();
    const activeProjectsCount = await Project.count({ where: { status: 'In Progress' } });
    const pendingTasksCount = await Task.count({ 
      where: { 
        status: { [Op.ne]: 'Done' } 
      } 
    });

    // 2. Financial Metrics (Total Revenue = Sum of all Paid Invoices)
    const paidSales = await Sale.findAll({ where: { status: 'Paid' } });
    const totalRevenue = paidSales.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const unpaidSales = await Sale.findAll({ where: { status: 'Unpaid' } });
    const outstandingRevenue = unpaidSales.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // 3. Lead stats
    const totalLeads = await Lead.count();
    const qualifiedLeads = await Lead.count({ where: { status: 'Qualified' } });

    // 4. Time series grouping for Sales Line Graph (monthly revenue)
    // We group sales by month (based on issueDate)
    const allInvoices = await Sale.findAll({ order: [['issueDate', 'ASC']] });
    const monthlyRevenue = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Pre-populate last 6 months with 0
    const currentMonthIndex = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      monthlyRevenue[months[idx]] = 0;
    }

    allInvoices.forEach(inv => {
      const date = new Date(inv.issueDate);
      const m = months[date.getMonth()];
      if (monthlyRevenue[m] !== undefined && inv.status === 'Paid') {
        monthlyRevenue[m] += parseFloat(inv.amount);
      }
    });

    const salesChartData = Object.keys(monthlyRevenue).map(key => ({
      name: key,
      value: monthlyRevenue[key]
    }));

    // 5. Recent Activities
    const recentActivities = await Activity.findAll({
      limit: 6,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'avatar', 'role'] }]
    });

    // 6. Lead conversion breakdown
    const leadsBySource = await Lead.findAll({
      attributes: ['source', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['source']
    });

    // 7. Team Performance (Tasks completed per user)
    const completedTasks = await Task.findAll({
      where: { status: 'Done' },
      include: [{ model: User, as: 'assignee', attributes: ['name', 'avatar'] }]
    });
    
    const teamPerformers = {};
    completedTasks.forEach(t => {
      if (t.assignee) {
        const name = t.assignee.name;
        if (!teamPerformers[name]) {
          teamPerformers[name] = { name, avatar: t.assignee.avatar, completed: 0 };
        }
        teamPerformers[name].completed += 1;
      }
    });

    return res.json({
      metrics: {
        totalRevenue,
        outstandingRevenue,
        totalClients: totalClientsCount,
        activeProjects: activeProjectsCount,
        pendingTasks: pendingTasksCount,
        totalLeads,
        qualifiedLeads
      },
      salesChart: salesChartData,
      activities: recentActivities,
      leadsBySource,
      teamPerformance: Object.values(teamPerformers)
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Failed to compile dashboard reports.' });
  }
};
