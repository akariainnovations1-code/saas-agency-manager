const { Notification } = require('../models');

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit: 15
    });
    return res.json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(444).json({ message: 'Notification not found.' });
    }

    await notification.update({ isRead: true });
    return res.json(notification);
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    return res.status(500).json({ message: 'Failed to update notification state.' });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { isRead: false } });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark All Read Error:', error);
    return res.status(500).json({ message: 'Failed to update notifications.' });
  }
};
