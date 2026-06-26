const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Proposal = sequelize.define('Proposal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Approved', 'Rejected', 'Converted'),
    defaultValue: 'Draft',
    allowNull: false
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  signature: {
    type: DataTypes.TEXT, // Base64 drawing canvas coordinates or custom typed text
    allowNull: true
  },
  signedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  signedBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Proposal;
