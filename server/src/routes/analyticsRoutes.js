const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Manager']), getAnalytics);

module.exports = router;
