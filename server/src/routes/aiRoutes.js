const express = require('express');
const { generateProposal, generateInvoiceDesc, generateEmail, generateMeetingSummary, recommendTasks, forecastRevenue } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/proposal', generateProposal);
router.post('/invoice', generateInvoiceDesc);
router.post('/email', generateEmail);
router.post('/meeting', generateMeetingSummary);
router.post('/tasks', recommendTasks);
router.get('/forecast', forecastRevenue);

module.exports = router;
