const sequelize = require('../config/db');
const User = require('./User');
const Client = require('./Client');
const Project = require('./Project');
const Task = require('./Task');
const Sale = require('./Sale');
const Lead = require('./Lead');
const Document = require('./Document');
const Activity = require('./Activity');
const Subscription = require('./Subscription');
const Proposal = require('./Proposal');
const Expense = require('./Expense');
const Notification = require('./Notification');
const Integration = require('./Integration');

// --- DATABASE RELATIONS ---

// Client <-> Project
Client.hasMany(Project, { foreignKey: 'clientId', onDelete: 'CASCADE' });
Project.belongsTo(Client, { foreignKey: 'clientId' });

// Project <-> Task
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

// User <-> Task (Assignee)
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// Client <-> Sale (Invoice)
Client.hasMany(Sale, { foreignKey: 'clientId', onDelete: 'CASCADE' });
Sale.belongsTo(Client, { foreignKey: 'clientId' });

// Project <-> Document
Project.hasMany(Document, { foreignKey: 'projectId', onDelete: 'SET NULL' });
Document.belongsTo(Project, { foreignKey: 'projectId' });

// Client <-> Document
Client.hasMany(Document, { foreignKey: 'clientId', onDelete: 'SET NULL' });
Document.belongsTo(Client, { foreignKey: 'clientId' });

// User <-> Document (Uploader)
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'uploadedDocuments', onDelete: 'SET NULL' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// User <-> Activity
User.hasMany(Activity, { foreignKey: 'userId', onDelete: 'CASCADE' });
Activity.belongsTo(User, { foreignKey: 'userId' });

// Client <-> Subscription
Client.hasMany(Subscription, { foreignKey: 'clientId', onDelete: 'CASCADE' });
Subscription.belongsTo(Client, { foreignKey: 'clientId' });

// Client <-> Proposal
Client.hasMany(Proposal, { foreignKey: 'clientId', onDelete: 'CASCADE' });
Proposal.belongsTo(Client, { foreignKey: 'clientId' });

module.exports = {
  sequelize,
  User,
  Client,
  Project,
  Task,
  Sale,
  Lead,
  Document,
  Activity,
  Subscription,
  Proposal,
  Expense,
  Notification,
  Integration
};

