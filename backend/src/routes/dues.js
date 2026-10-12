const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /api/dues
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { month, year, status, member_id } = req.query;
    let queryFilters = {};
    if (month) queryFilters.month = month;
    if (year) queryFilters.year = year;
    if (status) queryFilters.status = status;

    // Normal members can only view their own dues
    if (req.user.role === 'member') {
      queryFilters.member_id = req.user.member_id;
    } else if (member_id) {
      queryFilters.member_id = member_id;
    }

    const dues = await db.dues.getAll(queryFilters);
    return res.json(dues);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/dues/generate - Generate dues for all active members for a given month
router.post('/generate', authMiddleware, requireRole('admin', 'treasurer'), async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required.' });
    }

    const createdDues = await db.dues.generateForMonth(month, year, amount || 1000);
    return res.status(201).json({
      message: `Generated dues for ${createdDues.length} active members for ${month}/${year}`,
      generatedCount: createdDues.length,
      dues: createdDues
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/dues/summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const month = parseInt(req.query.month || (new Date().getMonth() + 1), 10);
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);

    const dues = await db.dues.getAll({ month, year });
    const totalObligation = dues.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalCollected = dues.reduce((sum, d) => sum + parseFloat(d.paid_amount || 0), 0);
    const totalPending = Math.max(0, totalObligation - totalCollected);
    const paidCount = dues.filter(d => d.status === 'paid').length;
    const partialCount = dues.filter(d => d.status === 'partial').length;
    const pendingCount = dues.filter(d => d.status === 'pending').length;

    return res.json({
      month,
      year,
      totalMembers: dues.length,
      totalObligation,
      totalCollected,
      totalPending,
      paidCount,
      partialCount,
      pendingCount,
      percentage: totalObligation > 0 ? Math.round((totalCollected / totalObligation) * 100) : 0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
