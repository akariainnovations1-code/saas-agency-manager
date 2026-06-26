const { Subscription, Client, Activity } = require('../models');

// Get all subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [{ model: Client, attributes: ['name', 'company', 'email', 'phone'] }],
      order: [['endDate', 'ASC']]
    });
    return res.json(subscriptions);
  } catch (error) {
    console.error('Get Subscriptions Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve subscriptions.' });
  }
};

// Create a subscription
exports.createSubscription = async (req, res) => {
  try {
    const { clientId, planName, startDate, endDate, price, autoRenew, licenseKey } = req.body;

    if (!clientId || !planName || !startDate || !endDate || price === undefined) {
      return res.status(400).json({ message: 'Please provide all required subscription fields.' });
    }

    // Determine status based on endDate
    const today = new Date().toISOString().split('T')[0];
    const status = endDate < today ? 'Expired' : 'Active';

    const subscription = await Subscription.create({
      clientId,
      planName,
      startDate,
      endDate,
      price,
      autoRenew: autoRenew !== undefined ? autoRenew : true,
      licenseKey: licenseKey || `LIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status
    });

    // Fetch complete subscription with client details
    const fullSub = await Subscription.findByPk(subscription.id, {
      include: [{ model: Client, attributes: ['name', 'company'] }]
    });

    // Log Activity
    await Activity.create({
      type: 'CRM',
      action: 'Created Subscription',
      details: `Created plan ${planName} for ${fullSub.Client ? fullSub.Client.company : 'Client'}`,
      userId: req.user.id
    });

    return res.status(201).json(fullSub);
  } catch (error) {
    console.error('Create Subscription Error:', error);
    return res.status(500).json({ message: 'Failed to create subscription.' });
  }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, startDate, endDate, price, autoRenew, status, licenseKey } = req.body;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(444).json({ message: 'Subscription not found.' });
    }

    await subscription.update({
      planName: planName || subscription.planName,
      startDate: startDate || subscription.startDate,
      endDate: endDate || subscription.endDate,
      price: price !== undefined ? price : subscription.price,
      autoRenew: autoRenew !== undefined ? autoRenew : subscription.autoRenew,
      status: status || subscription.status,
      licenseKey: licenseKey || subscription.licenseKey
    });

    // Re-check expired status dynamically if endDate was changed
    if (endDate) {
      const today = new Date().toISOString().split('T')[0];
      const newStatus = endDate < today ? 'Expired' : subscription.status;
      if (newStatus !== subscription.status) {
        await subscription.update({ status: newStatus });
      }
    }

    const fullSub = await Subscription.findByPk(id, {
      include: [{ model: Client, attributes: ['name', 'company'] }]
    });

    return res.json(fullSub);
  } catch (error) {
    console.error('Update Subscription Error:', error);
    return res.status(500).json({ message: 'Failed to update subscription.' });
  }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(444).json({ message: 'Subscription not found.' });
    }

    await subscription.destroy();
    return res.json({ message: 'Subscription deleted successfully.' });
  } catch (error) {
    console.error('Delete Subscription Error:', error);
    return res.status(500).json({ message: 'Failed to delete subscription.' });
  }
};

// Simulate WhatsApp & Email Renewal Reminders
exports.sendRenewalReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { channel } = req.body; // 'WhatsApp' or 'Email' or 'Both'

    const subscription = await Subscription.findByPk(id, {
      include: [{ model: Client, attributes: ['name', 'company', 'email', 'phone'] }]
    });

    if (!subscription) {
      return res.status(444).json({ message: 'Subscription not found.' });
    }

    const clientName = subscription.Client ? subscription.Client.name : 'Customer';
    const clientCompany = subscription.Client ? subscription.Client.company : 'Company';
    const planName = subscription.planName;

    // Simulate sending by logging activity and returning receipt details
    const summary = `Simulated ${channel || 'WhatsApp & Email'} renewal reminder sent to ${clientName} (${clientCompany}) for their ${planName} subscription expiring on ${subscription.endDate}.`;
    
    await Activity.create({
      type: 'CRM',
      action: 'Sent Renewal Reminder',
      details: summary,
      userId: req.user.id
    });

    return res.json({
      success: true,
      message: 'Reminder simulation successful.',
      details: {
        to: clientName,
        company: clientCompany,
        phone: subscription.Client ? subscription.Client.phone : 'N/A',
        email: subscription.Client ? subscription.Client.email : 'N/A',
        messageSent: `Hi ${clientName}, this is a reminder that your ${planName} subscription for ${clientCompany} is set to expire on ${subscription.endDate}. Please review renewal invoices to prevent service interruption.`
      }
    });
  } catch (error) {
    console.error('Send Reminder Error:', error);
    return res.status(500).json({ message: 'Failed to trigger reminder simulation.' });
  }
};
