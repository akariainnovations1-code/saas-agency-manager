const express = require('express');
const { getSecurityLogs, getDatabaseConfig, getSystemConfig, updateSystemConfig } = require('../controllers/settingsController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// All settings routes require authentication and Super Admin privileges
router.use(authMiddleware);
router.use(roleMiddleware(['Super Admin']));

router.get('/logs', getSecurityLogs);
router.get('/database', getDatabaseConfig);
router.get('/system', getSystemConfig);
router.put('/system', updateSystemConfig);

module.exports = router;
