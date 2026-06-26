const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Software License', 'Vendor Payment', 'Rent & Utilities', 'Marketing', 'Travel & Meals', 'Other'),
    defaultValue: 'Other',
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  vendor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Pending'),
    defaultValue: 'Paid',
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Expense;
