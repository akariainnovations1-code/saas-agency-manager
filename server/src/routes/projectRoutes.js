const express = require('express');
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // All project endpoints require active login sessions

router.get('/', getProjects);
router.post('/', roleMiddleware(['Admin', 'Manager']), createProject);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), updateProject);
router.delete('/:id', roleMiddleware(['Admin']), deleteProject);

module.exports = router;
