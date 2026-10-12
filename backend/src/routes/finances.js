const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /api/finances/funds
router.get('/funds', authMiddleware, async (req, res) => {
  try {
    const funds = await db.funds.getAll();
    return res.json(funds);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/finances/expenses
router.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const expenses = await db.expenses.getAll();
    return res.json(expenses);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/finances/expenses
router.post('/expenses', authMiddleware, requireRole('admin', 'treasurer'), async (req, res) => {
  try {
    const { fund_code, title, title_te, category, amount, expense_date, paid_to, approved_by, bill_receipt_ref, remarks } = req.body;
    if (!title || !amount || !paid_to) {
      return res.status(400).json({ error: 'Title, amount, and recipient are required.' });
    }

    const expense = await db.expenses.create({
      fund_code: fund_code || 'general',
      title,
      title_te: title_te || title,
      category: category || 'Maintenance',
      amount: parseFloat(amount),
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      paid_to,
      approved_by: approved_by || `${req.user.username} (${req.user.role})`,
      bill_receipt_ref,
      remarks
    });

    return res.status(201).json(expense);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/finances/other-income
router.get('/other-income', authMiddleware, async (req, res) => {
  try {
    const donations = await db.otherIncome.getAll();
    return res.json(donations);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/finances/other-income
router.post('/other-income', authMiddleware, requireRole('admin', 'treasurer'), async (req, res) => {
  try {
    const { fund_code, donor_name, donor_phone, amount, income_date, payment_mode, upi_ref, purpose, remarks } = req.body;
    if (!donor_name || !amount) {
      return res.status(400).json({ error: 'Donor name and amount are required.' });
    }

    const income = await db.otherIncome.create({
      fund_code: fund_code || 'festival',
      donor_name,
      donor_phone,
      amount: parseFloat(amount),
      income_date: income_date || new Date().toISOString().split('T')[0],
      payment_mode: payment_mode || 'Cash',
      upi_ref: upi_ref || null,
      purpose: purpose || 'Temple Donation',
      received_by: `${req.user.username} (${req.user.role})`,
      remarks
    });

    return res.status(201).json(income);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/finances/report - Consolidated Financial Statement
router.get('/report', authMiddleware, async (req, res) => {
  try {
    const funds = await db.funds.getAll();
    const payments = await db.payments.getAll();
    const otherIncomes = await db.otherIncome.getAll();
    const expenses = await db.expenses.getAll();

    // General fund calculations
    const generalDuesIncome = payments
      .filter(p => (p.fund_code || 'general') === 'general')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const generalDonations = otherIncomes
      .filter(i => i.fund_code === 'general')
      .reduce((sum, i) => sum + parseFloat(i.amount), 0);

    const totalGeneralIncome = generalDuesIncome + generalDonations;

    const generalExpenses = expenses
      .filter(e => (e.fund_code || 'general') === 'general')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Festival fund calculations
    const festivalDonations = otherIncomes
      .filter(i => i.fund_code === 'festival')
      .reduce((sum, i) => sum + parseFloat(i.amount), 0);

    const festivalDuesIncome = payments
      .filter(p => p.fund_code === 'festival')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalFestivalIncome = festivalDonations + festivalDuesIncome;

    const festivalExpenses = expenses
      .filter(e => e.fund_code === 'festival')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Categories breakdown
    const expensesByCategory = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + parseFloat(e.amount);
    });

    return res.json({
      funds,
      summary: {
        totalIncome: totalGeneralIncome + totalFestivalIncome,
        totalExpenses: generalExpenses + festivalExpenses,
        netSurplus: (totalGeneralIncome + totalFestivalIncome) - (generalExpenses + festivalExpenses)
      },
      generalFund: {
        totalIncome: totalGeneralIncome,
        breakdown: {
          monthlyDues: generalDuesIncome,
          otherDonations: generalDonations
        },
        totalExpenses: generalExpenses,
        currentBalance: funds.find(f => f.fund_code === 'general')?.balance || 0
      },
      festivalFund: {
        totalIncome: totalFestivalIncome,
        breakdown: {
          donationsAndSponsorships: festivalDonations,
          specialContributions: festivalDuesIncome
        },
        totalExpenses: festivalExpenses,
        currentBalance: funds.find(f => f.fund_code === 'festival')?.balance || 0
      },
      expensesByCategory,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
