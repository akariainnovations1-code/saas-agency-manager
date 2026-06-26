const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Integration = sequelize.define('Integration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  serviceName: {
    type: DataTypes.ENUM('WhatsApp', 'Gmail', 'Calendar', 'Meetings', 'ChatGPT', 'Gemini'),
    allowNull: false,
    unique: true
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  status: {
    type: DataTypes.ENUM('Connected', 'Disconnected'),
    defaultValue: 'Disconnected',
    allowNull: false
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Integration;
