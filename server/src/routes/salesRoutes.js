const express = require('express');
const { getSales, createInvoice, updateInvoiceStatus } = require('../controllers/salesController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // Standard auth check
router.use(roleMiddleware(['Admin', 'Manager'])); // Restrict sales/invoices strictly to Admins and Managers

router.get('/', getSales);
router.post('/', createInvoice);
router.put('/:id', updateInvoiceStatus);

module.exports = router;
