const { Sale, Client, Activity } = require('../models');

exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [Client],
      order: [['issueDate', 'DESC']]
    });
    return res.json(sales);
  } catch (error) {
    console.error('Get Sales Error:', error);
    return res.status(500).json({ message: 'Failed to fetch sales data.' });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { clientId, amount, status, issueDate, dueDate, items } = req.body;

    if (!clientId || !amount || !issueDate || !dueDate) {
      return res.status(400).json({ message: 'Client ID, Amount, Issue Date, and Due Date are required.' });
    }

    // Generate simulated clean sequential invoice numbers e.g., INV-2026-X
    const count = await Sale.count();
    const invoiceNumber = `${String(count + 1).padStart(3, '0')}`;

    const sale = await Sale.create({
      invoiceNumber,
      amount,
      status: status || 'Unpaid',
      issueDate,
      dueDate,
      clientId,
      items: items || '[]'
    });

    const client = await Client.findByPk(clientId);
    const clientName = client ? client.name : 'Unknown Client';

    await Activity.create({
      type: 'SALE',
      action: 'Created Invoice',
      details: `${req.user.name} created invoice ${invoiceNumber} for ${clientName} in the amount of ₹${parseFloat(amount).toLocaleString('en-IN')}.`,
      userId: req.user.id
    });

    const populated = await Sale.findByPk(sale.id, { include: [Client] });
    return res.status(201).json(populated);
  } catch (error) {
    console.error('Create Invoice Error:', error);
    return res.status(500).json({ message: 'Failed to create invoice.' });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const sale = await Sale.findByPk(id, { include: [Client] });
    if (!sale) {
      return res.status(444).json({ message: 'Invoice not found.' });
    }

    const oldStatus = sale.status;
    await sale.update({ status });

    await Activity.create({
      type: 'SALE',
      action: 'Updated Invoice',
      details: `${req.user.name} changed status of invoice ${sale.invoiceNumber} from ${oldStatus} to ${status}.`,
      userId: req.user.id
    });

    return res.json(sale);
  } catch (error) {
    console.error('Update Invoice Status Error:', error);
    return res.status(500).json({ message: 'Failed to update invoice.' });
  }
};
