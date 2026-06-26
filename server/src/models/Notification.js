const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('Renewal', 'PaymentDue', 'Overdue', 'Deadline', 'TeamAlert'),
    defaultValue: 'TeamAlert',
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  targetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Notification;
