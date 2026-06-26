const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, addTaskComment } = require('../controllers/taskController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // Authenticate all task requests

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', roleMiddleware(['Admin', 'Manager']), deleteTask);
router.post('/:id/comments', addTaskComment);

module.exports = router;
