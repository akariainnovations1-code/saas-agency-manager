const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Todo', 'In Progress', 'Review', 'Done'),
    defaultValue: 'Todo',
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]' // Stores stringified JSON array of task discussions
  }
}, {
  timestamps: true
});

module.exports = Task;
