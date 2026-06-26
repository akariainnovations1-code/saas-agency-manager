const express = require('express');
const { getSubscriptions, createSubscription, updateSubscription, deleteSubscription, sendRenewalReminder } = require('../controllers/subscriptionController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getSubscriptions);
router.post('/', roleMiddleware(['Admin', 'Manager']), createSubscription);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), updateSubscription);
router.delete('/:id', roleMiddleware(['Admin']), deleteSubscription);
router.post('/:id/reminder', roleMiddleware(['Admin', 'Manager']), sendRenewalReminder);

module.exports = router;
