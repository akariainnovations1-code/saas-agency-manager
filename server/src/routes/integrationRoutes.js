const express = require('express');
const { getIntegrations, configureIntegration, testPing } = require('../controllers/integrationController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getIntegrations);
router.post('/', roleMiddleware(['Admin', 'Manager']), configureIntegration);
router.post('/:serviceName/ping', roleMiddleware(['Admin', 'Manager']), testPing);

module.exports = router;
