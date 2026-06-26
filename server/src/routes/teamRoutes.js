const express = require('express');
const { getTeam, updateTeamMember } = require('../controllers/teamController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTeam);
router.put('/:id', roleMiddleware(['Admin']), updateTeamMember);

module.exports = router;
