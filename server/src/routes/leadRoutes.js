const express = require('express');
const { getLeads, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['Admin', 'Manager'])); // Restrict leads to Admins and Managers

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
