const { Lead, Activity } = require('../models');

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(leads);
  } catch (error) {
    console.error('Get Leads Error:', error);
    return res.status(500).json({ message: 'Failed to fetch leads.' });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { name, company, email, phone, source, status, notes, followUpDate } = req.body;

    if (!name || !company || !email) {
      return res.status(400).json({ message: 'Lead Name, Company, and Email are required.' });
    }

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      source: source || 'Website',
      status: status || 'New',
      notes,
      followUpDate
    });

    await Activity.create({
      type: 'LEAD',
      action: 'Captured Lead',
      details: `New lead acquired: ${name} (${company}) via ${source || 'Website'}.`,
      userId: req.user.id
    });

    return res.status(201).json(lead);
  } catch (error) {
    console.error('Create Lead Error:', error);
    return res.status(500).json({ message: 'Failed to create lead.' });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone, source, status, notes, followUpDate } = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return res.status(444).json({ message: 'Lead not found.' });
    }

    const oldStatus = lead.status;

    await lead.update({
      name: name || lead.name,
      company: company || lead.company,
      email: email || lead.email,
      phone: phone !== undefined ? phone : lead.phone,
      source: source || lead.source,
      status: status || lead.status,
      notes: notes !== undefined ? notes : lead.notes,
      followUpDate: followUpDate !== undefined ? followUpDate : lead.followUpDate
    });

    if (status && oldStatus !== status) {
      await Activity.create({
        type: 'LEAD',
        action: 'Updated Lead Status',
        details: `${req.user.name} updated lead "${lead.name}" pipeline status to ${status}.`,
        userId: req.user.id
      });
    }

    return res.json(lead);
  } catch (error) {
    console.error('Update Lead Error:', error);
    return res.status(500).json({ message: 'Failed to update lead.' });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return res.status(444).json({ message: 'Lead not found.' });
    }

    const leadName = lead.name;
    await lead.destroy();

    await Activity.create({
      type: 'LEAD',
      action: 'Deleted Lead',
      details: `${req.user.name} removed lead "${leadName}".`,
      userId: req.user.id
    });

    return res.json({ message: 'Lead deleted successfully.' });
  } catch (error) {
    console.error('Delete Lead Error:', error);
    return res.status(500).json({ message: 'Failed to delete lead.' });
  }
};
