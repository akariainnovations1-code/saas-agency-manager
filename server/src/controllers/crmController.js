const { Client, Activity } = require('../models');

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(clients);
  } catch (error) {
    console.error('CRM Get Clients Error:', error);
    return res.status(500).json({ message: 'Failed to fetch clients.' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { 
      name, company, email, phone, country, status, notes,
      accountType, whatsappNumber, subscriptionName, numberOfId, 
      loginEmail, loginPassword, issueDate, expiryDate, planDuration, 
      costPaidToDealer, paymentFromCustomer, dealerName
    } = req.body;

    if (!name || !company || !email) {
      return res.status(400).json({ message: 'Name, Company, and Email are required fields.' });
    }

    const client = await Client.create({
      name,
      company,
      email,
      phone,
      country,
      status: status || 'Prospect',
      notes: notes || '[]',
      accountType: accountType || 'Business',
      whatsappNumber,
      subscriptionName,
      numberOfId: numberOfId !== undefined ? numberOfId : 1,
      loginEmail,
      loginPassword,
      issueDate,
      expiryDate,
      planDuration: planDuration || '12 Months',
      costPaidToDealer: costPaidToDealer !== undefined ? costPaidToDealer : 0.00,
      paymentFromCustomer: paymentFromCustomer !== undefined ? paymentFromCustomer : 0.00,
      dealerName
    });

    // Create activity log
    await Activity.create({
      type: 'CRM',
      action: 'Created Client',
      details: `${req.user.name} added a new client profile: ${name} (${company}).`,
      userId: req.user.id
    });

    return res.status(201).json(client);
  } catch (error) {
    console.error('CRM Create Client Error:', error);
    return res.status(500).json({ message: 'Failed to create client.' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, company, email, phone, country, status, notes,
      accountType, whatsappNumber, subscriptionName, numberOfId, 
      loginEmail, loginPassword, issueDate, expiryDate, planDuration, 
      costPaidToDealer, paymentFromCustomer, dealerName
    } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(444).json({ message: 'Client profile not found.' });
    }

    await client.update({
      name: name || client.name,
      company: company || client.company,
      email: email || client.email,
      phone: phone !== undefined ? phone : client.phone,
      country: country || client.country,
      status: status || client.status,
      notes: notes !== undefined ? notes : client.notes,
      accountType: accountType !== undefined ? accountType : client.accountType,
      whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : client.whatsappNumber,
      subscriptionName: subscriptionName !== undefined ? subscriptionName : client.subscriptionName,
      numberOfId: numberOfId !== undefined ? numberOfId : client.numberOfId,
      loginEmail: loginEmail !== undefined ? loginEmail : client.loginEmail,
      loginPassword: loginPassword !== undefined ? loginPassword : client.loginPassword,
      issueDate: issueDate !== undefined ? issueDate : client.issueDate,
      expiryDate: expiryDate !== undefined ? expiryDate : client.expiryDate,
      planDuration: planDuration !== undefined ? planDuration : client.planDuration,
      costPaidToDealer: costPaidToDealer !== undefined ? costPaidToDealer : client.costPaidToDealer,
      paymentFromCustomer: paymentFromCustomer !== undefined ? paymentFromCustomer : client.paymentFromCustomer,
      dealerName: dealerName !== undefined ? dealerName : client.dealerName
    });

    // Create activity log
    await Activity.create({
      type: 'CRM',
      action: 'Updated Client',
      details: `${req.user.name} updated CRM profile for ${client.name} (${client.company}).`,
      userId: req.user.id
    });

    return res.json(client);
  } catch (error) {
    console.error('CRM Update Client Error:', error);
    return res.status(500).json({ message: 'Failed to update client.' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(444).json({ message: 'Client profile not found.' });
    }

    const clientName = client.name;
    const clientCompany = client.company;

    await client.destroy();

    // Create activity log
    await Activity.create({
      type: 'CRM',
      action: 'Deleted Client',
      details: `${req.user.name} deleted client profile for ${clientName} (${clientCompany}).`,
      userId: req.user.id
    });

    return res.json({ message: 'Client profile deleted successfully.' });
  } catch (error) {
    console.error('CRM Delete Client Error:', error);
    return res.status(500).json({ message: 'Failed to delete client.' });
  }
};
