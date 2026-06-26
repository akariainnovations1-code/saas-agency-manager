const { Activity, User } = require('../models');

// Fetch security and audit logs
exports.getSecurityLogs = async (req, res) => {
  try {
    const logs = await Activity.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    return res.json(logs);
  } catch (error) {
    console.error('💥 Get Security Logs Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve audit logs.' });
  }
};

// Fetch mock database configuration
exports.getDatabaseConfig = async (req, res) => {
  try {
    return res.json({
      dialect: 'sqlite',
      storage: './saas.db',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      ssl: false,
      status: 'Connected',
      tablesCount: 14,
      lastBackup: new Date(Date.now() - 36 * 3600000).toISOString()
    });
  } catch (error) {
    console.error('💥 Get DB Config Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve database configuration.' });
  }
};

// Fetch mock system configuration
exports.getSystemConfig = async (req, res) => {
  try {
    return res.json({
      appName: 'Akaria Innovations SaaS',
      version: '2.4.0-premium',
      debugMode: false,
      enableNotifications: true,
      maintenanceMode: false,
      allowedUploadSizeMB: 10,
      sessionTimeoutMin: 15,
      mfaRequired: false
    });
  } catch (error) {
    console.error('💥 Get System Config Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve system configuration.' });
  }
};

// Update system configuration
exports.updateSystemConfig = async (req, res) => {
  try {
    const { appName, debugMode, maintenanceMode, sessionTimeoutMin } = req.body;
    
    // Log the configuration change action
    await Activity.create({
      type: 'SYSTEM',
      action: 'Updated Configuration',
      details: `Super Admin ${req.user.name} updated system config settings.`,
      userId: req.user.id
    });

    return res.json({
      message: 'System configuration updated successfully.',
      config: {
        appName: appName || 'Akaria Innovations SaaS',
        debugMode: !!debugMode,
        maintenanceMode: !!maintenanceMode,
        sessionTimeoutMin: sessionTimeoutMin || 15
      }
    });
  } catch (error) {
    console.error('💥 Update System Config Error:', error);
    return res.status(500).json({ message: 'Failed to update system configuration.' });
  }
};
