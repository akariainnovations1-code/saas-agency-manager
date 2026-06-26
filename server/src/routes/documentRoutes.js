const express = require('express');
const { getDocuments, createDocument, deleteDocument } = require('../controllers/documentController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getDocuments);
router.post('/', createDocument);
router.delete('/:id', roleMiddleware(['Admin', 'Manager']), deleteDocument);

module.exports = router;
