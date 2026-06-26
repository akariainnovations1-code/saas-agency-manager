const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Project', 'Client', 'General'),
    defaultValue: 'General',
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.STRING, // e.g. "2.4 MB", "450 KB"
    allowNull: false,
    defaultValue: '0 KB'
  }
}, {
  timestamps: true
});

module.exports = Document;
