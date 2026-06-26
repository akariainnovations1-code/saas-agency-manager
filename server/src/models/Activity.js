const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING, // e.g., 'CRM', 'PROJECT', 'TASK', 'SALE', 'LEAD'
    allowNull: false
  },
  action: {
    type: DataTypes.STRING, // e.g., 'Created Client', 'Updated Task status', 'Paid Invoice'
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Activity;
