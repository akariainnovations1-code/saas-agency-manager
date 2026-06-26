const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  source: {
    type: DataTypes.ENUM('Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Partner'),
    defaultValue: 'Website',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('New', 'Contacted', 'Qualified', 'Lost'),
    defaultValue: 'New',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Lead;
