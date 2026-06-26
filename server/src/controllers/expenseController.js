const { Expense, Sale, Activity } = require('../models');

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [['date', 'DESC']]
    });
    return res.json(expenses);
  } catch (error) {
    console.error('Get Expenses Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve expenses.' });
  }
};

// Create an expense
exports.createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, vendor, status } = req.body;

    if (!title || !category || !amount || !date) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const expense = await Expense.create({
      title,
      category,
      amount,
      date,
      vendor: vendor || 'Vendor',
      status: status || 'Paid'
    });

    await Activity.create({
      type: 'SALE',
      action: 'Logged Expense',
      details: `Logged expense "${title}" of ₹${parseFloat(amount).toLocaleString('en-IN')} to vendor "${vendor}"`,
      userId: req.user.id
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Create Expense Error:', error);
    return res.status(500).json({ message: 'Failed to record expense.' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, date, vendor, status } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(444).json({ message: 'Expense not found.' });
    }

    await expense.update({
      title: title || expense.title,
      category: category || expense.category,
      amount: amount !== undefined ? amount : expense.amount,
      date: date || expense.date,
      vendor: vendor || expense.vendor,
      status: status || expense.status
    });

    return res.json(expense);
  } catch (error) {
    console.error('Update Expense Error:', error);
    return res.status(500).json({ message: 'Failed to update expense.' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(444).json({ message: 'Expense not found.' });
    }

    await expense.destroy();
    return res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Delete Expense Error:', error);
    return res.status(500).json({ message: 'Failed to delete expense.' });
  }
};

// Calculate Profit & Category Summaries
exports.getProfitCalculation = async (req, res) => {
  try {
    // 1. Fetch sales revenue (Paid invoices)
    const paidSales = await Sale.findAll({ where: { status: 'Paid' } });
    const totalRevenue = paidSales.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // 2. Fetch expenses (Paid expenses)
    const paidExpenses = await Expense.findAll({ where: { status: 'Paid' } });
    const totalExpenses = paidExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // 3. Category Breakdown
    const categoryTotals = {};
    paidExpenses.forEach(exp => {
      const cat = exp.category;
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = 0;
      }
      categoryTotals[cat] += parseFloat(exp.amount);
    });

    const categoriesBreakdown = Object.keys(categoryTotals).map(key => ({
      category: key,
      total: categoryTotals[key]
    }));

    return res.json({
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      breakdown: categoriesBreakdown
    });
  } catch (error) {
    console.error('Profit Calculation Error:', error);
    return res.status(500).json({ message: 'Failed to calculate profit ledger.' });
  }
};
