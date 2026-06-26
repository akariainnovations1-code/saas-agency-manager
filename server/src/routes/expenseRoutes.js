const express = require('express');
const { getExpenses, createExpense, updateExpense, deleteExpense, getProfitCalculation } = require('../controllers/expenseController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getExpenses);
router.get('/profit', roleMiddleware(['Admin', 'Manager']), getProfitCalculation);
router.post('/', roleMiddleware(['Admin', 'Manager']), createExpense);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), updateExpense);
router.delete('/:id', roleMiddleware(['Admin']), deleteExpense);

module.exports = router;
