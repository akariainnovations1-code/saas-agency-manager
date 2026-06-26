const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid', 'Overdue'),
    defaultValue: 'Unpaid',
    allowNull: false
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]' // Stores stringified JSON array of line items: [{description, qty, rate, amount}]
  }
}, {
  timestamps: true
});

module.exports = Sale;
