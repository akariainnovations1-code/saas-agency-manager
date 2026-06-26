const { Proposal, Client, Project, Sale, Activity } = require('../models');

// Get all proposals
exports.getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      include: [{ model: Client, attributes: ['name', 'company'] }],
      order: [['createdAt', 'DESC']]
    });
    return res.json(proposals);
  } catch (error) {
    console.error('Get Proposals Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve proposals.' });
  }
};

// Create a proposal
exports.createProposal = async (req, res) => {
  try {
    const { clientId, title, description, amount, validUntil } = req.body;

    if (!clientId || !title || !amount || !validUntil) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const proposal = await Proposal.create({
      clientId,
      title,
      description,
      amount,
      validUntil,
      status: 'Draft'
    });

    const fullProposal = await Proposal.findByPk(proposal.id, {
      include: [{ model: Client, attributes: ['name', 'company'] }]
    });

    await Activity.create({
      type: 'CRM',
      action: 'Created Proposal',
      details: `Created proposal "${title}" for ₹${parseFloat(amount).toLocaleString('en-IN')} to ${fullProposal.Client ? fullProposal.Client.company : 'Client'}`,
      userId: req.user.id
    });

    return res.status(201).json(fullProposal);
  } catch (error) {
    console.error('Create Proposal Error:', error);
    return res.status(500).json({ message: 'Failed to create proposal.' });
  }
};

// Update a proposal (includes signing)
exports.updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, validUntil, status, signature, signedBy } = req.body;

    const proposal = await Proposal.findByPk(id);
    if (!proposal) {
      return res.status(444).json({ message: 'Proposal not found.' });
    }

    const updateFields = {
      title: title || proposal.title,
      description: description || proposal.description,
      amount: amount !== undefined ? amount : proposal.amount,
      validUntil: validUntil || proposal.validUntil,
      status: status || proposal.status
    };

    if (signature) {
      updateFields.signature = signature;
      updateFields.signedAt = new Date();
      updateFields.signedBy = signedBy || 'Client E-Sign';
      updateFields.status = 'Approved'; // Automatically set to approved when signed
    }

    await proposal.update(updateFields);

    const fullProposal = await Proposal.findByPk(id, {
      include: [{ model: Client, attributes: ['name', 'company'] }]
    });

    if (signature) {
      await Activity.create({
        type: 'CRM',
        action: 'Signed Proposal',
        details: `Proposal "${proposal.title}" signed and approved by ${updateFields.signedBy}.`,
        userId: req.user.id
      });
    }

    return res.json(fullProposal);
  } catch (error) {
    console.error('Update Proposal Error:', error);
    return res.status(500).json({ message: 'Failed to update proposal.' });
  }
};

// Delete a proposal
exports.deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);
    if (!proposal) {
      return res.status(444).json({ message: 'Proposal not found.' });
    }

    await proposal.destroy();
    return res.json({ message: 'Proposal deleted successfully.' });
  } catch (error) {
    console.error('Delete Proposal Error:', error);
    return res.status(500).json({ message: 'Failed to delete proposal.' });
  }
};

// Convert Proposal -> Project -> Invoice
exports.convertProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id, {
      include: [{ model: Client }]
    });

    if (!proposal) {
      return res.status(444).json({ message: 'Proposal not found.' });
    }

    if (proposal.status !== 'Approved') {
      return res.status(400).json({ message: 'Only Approved proposals can be converted to operational assets.' });
    }

    // 1. Create a Project
    const today = new Date().toISOString().split('T')[0];
    const projectEndDate = new Date();
    projectEndDate.setMonth(projectEndDate.getMonth() + 3); // Default 3 months project duration
    const endDateStr = projectEndDate.toISOString().split('T')[0];

    const project = await Project.create({
      name: `${proposal.title} Implementation`,
      description: proposal.description || `Deliverables scoped under proposal: ${proposal.title}`,
      status: 'In Progress',
      progress: 0,
      startDate: today,
      endDate: endDateStr,
      budget: proposal.amount,
      clientId: proposal.clientId,
      milestones: JSON.stringify([
        { id: '1', title: 'Requirement Alignment', completed: false },
        { id: '2', title: 'Beta Release & Testing', completed: false },
        { id: '3', title: 'Deployment & Training', completed: false }
      ])
    });

    // 2. Create an Invoice (Sale entry)
    const count = await Sale.count();
    const nextInvoiceNum = `${String(count + 1).padStart(3, '0')}`;
    const invoiceDueDate = new Date();
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 14); // Due in 14 days
    const invoiceDueDateStr = invoiceDueDate.toISOString().split('T')[0];

    const invoice = await Sale.create({
      invoiceNumber: nextInvoiceNum,
      amount: proposal.amount,
      status: 'Unpaid',
      issueDate: today,
      dueDate: invoiceDueDateStr,
      clientId: proposal.clientId,
      items: JSON.stringify([
        { description: `Initial billing milestone for: ${proposal.title}`, qty: 1, rate: proposal.amount, amount: proposal.amount }
      ])
    });

    // 3. Mark proposal as closed/converted to prevent double conversion
    await proposal.update({ status: 'Converted' });

    // Log conversion activity
    await Activity.create({
      type: 'PROJECT',
      action: 'Converted Proposal',
      details: `Converted proposal "${proposal.title}" to Project "${project.name}" and Invoice "${invoice.invoiceNumber}" (₹${parseFloat(proposal.amount).toLocaleString('en-IN')})`,
      userId: req.user.id
    });

    return res.json({
      success: true,
      message: 'Proposal successfully converted to operational Project and Invoice!',
      project,
      invoice
    });
  } catch (error) {
    console.error('Convert Proposal Error:', error);
    return res.status(500).json({ message: 'Failed to convert proposal.' });
  }
};
