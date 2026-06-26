const { User, Activity } = require('../models');

exports.getTeam = async (req, res) => {
  try {
    const team = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });
    return res.json(team);
  } catch (error) {
    console.error('Get Team Error:', error);
    return res.status(500).json({ message: 'Failed to fetch team details.' });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name, email } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(444).json({ message: 'Team member not found.' });
    }

    // Prevents self-demotion from Admin
    if (user.id === req.user.id && role && role !== 'Admin' && user.role === 'Admin') {
      return res.status(400).json({ message: 'Security Safeguard: Admin cannot demote themselves.' });
    }

    await user.update({
      role: role || user.role,
      name: name || user.name,
      email: email || user.email
    });

    await Activity.create({
      type: 'TEAM',
      action: 'Updated Profile',
      details: `${req.user.name} modified role/permissions for ${user.name} (${user.role}).`,
      userId: req.user.id
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Update Team Error:', error);
    return res.status(500).json({ message: 'Failed to update team profile.' });
  }
};
