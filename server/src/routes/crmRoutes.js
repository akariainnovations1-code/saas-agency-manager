const express = require('express');
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/crmController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // All CRM actions require authentication

router.get('/', getClients);
router.post('/', roleMiddleware(['Admin', 'Manager']), createClient);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), updateClient);
router.delete('/:id', roleMiddleware(['Admin']), deleteClient);

module.exports = router;
