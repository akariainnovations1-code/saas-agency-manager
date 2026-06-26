const express = require('express');
const { getProposals, createProposal, updateProposal, deleteProposal, convertProposal } = require('../controllers/proposalController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProposals);
router.post('/', roleMiddleware(['Admin', 'Manager']), createProposal);
router.put('/:id', updateProposal); // Clients/Employees can sign, hence open to auth users
router.delete('/:id', roleMiddleware(['Admin']), deleteProposal);
router.post('/:id/convert', roleMiddleware(['Admin', 'Manager']), convertProposal);

module.exports = router;
