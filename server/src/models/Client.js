const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Client = sequelize.define('Client', {
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
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'United States'
  },
  status: {
    type: DataTypes.ENUM('Lead', 'Prospect', 'Active', 'Closed'),
    defaultValue: 'Prospect',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]' // Will store stringified JSON array of communication logs
  },
  
  // --- RESELLER & LICENSING COLUMNS FROM CRM SCREENSHOT ---
  accountType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Business'
  },
  whatsappNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subscriptionName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numberOfId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  loginEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  loginPassword: {
    type: DataTypes.STRING,
    allowNull: true
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  planDuration: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '12 Months'
  },
  costPaidToDealer: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  paymentFromCustomer: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  dealerName: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Client;

