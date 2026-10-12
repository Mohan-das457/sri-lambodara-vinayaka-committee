const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /api/members - list all members
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    let members = await db.members.getAll();

    if (status) {
      members = members.filter(m => m.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      members = members.filter(
        m =>
          m.full_name.toLowerCase().includes(q) ||
          (m.full_name_te && m.full_name_te.includes(q)) ||
          m.member_code.toLowerCase().includes(q) ||
          m.phone.includes(q)
      );
    }

    return res.json(members);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/members/:id - member details + payment history + pending dues
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await db.members.getById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Member can only view their own profile unless they are admin/treasurer/secretary
    if (req.user.role === 'member' && req.user.member_id !== member.id) {
      return res.status(403).json({ error: 'Unauthorized to view other member profiles' });
    }

    const allPayments = await db.payments.getAll();
    const memberPayments = allPayments.filter(p => p.member_id === member.id);

    const allDues = await db.dues.getAll({ member_id: member.id });

    const totalPaid = memberPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const pendingDues = allDues.filter(d => d.status === 'pending' || d.status === 'partial');
    const totalPending = pendingDues.reduce((sum, d) => sum + (parseFloat(d.amount) - parseFloat(d.paid_amount || 0)), 0);

    return res.json({
      member,
      summary: {
        totalPaid,
        totalPending,
        totalTransactions: memberPayments.length,
        pendingMonthsCount: pendingDues.length
      },
      payments: memberPayments,
      dues: allDues
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/members - create member (admin)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { full_name, full_name_te, phone, email, address, designation, designation_te, join_date, status } = req.body;
    if (!full_name || !phone) {
      return res.status(400).json({ error: 'Full name and phone number are required.' });
    }

    const newMember = await db.members.create({
      full_name,
      full_name_te,
      phone,
      email,
      address,
      designation: designation || 'Member',
      designation_te: designation_te || 'సభ్యుడు',
      join_date: join_date || new Date().toISOString().split('T')[0],
      status: status || 'active'
    });

    return res.status(201).json(newMember);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/members/bulk - Bulk add committee members
router.post('/bulk', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { membersList, namesText, generateDues } = req.body;
    let list = [];

    if (Array.isArray(membersList) && membersList.length > 0) {
      list = membersList;
    } else if (namesText && typeof namesText === 'string') {
      const lines = namesText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      list = lines.map((line, idx) => {
        // format can be "Name, Phone, Designation" or just "Name"
        const parts = line.split(',').map(p => p.trim());
        return {
          full_name: parts[0],
          full_name_te: parts[0],
          phone: parts[1] || `98480${String(10000 + idx).slice(-5)}`,
          designation: parts[2] || (idx === 0 ? 'President' : idx === 1 ? 'Secretary' : idx === 2 ? 'Treasurer' : 'Member'),
          designation_te: idx === 0 ? 'అధ్యక్షులు' : idx === 1 ? 'కార్యదర్శి' : idx === 2 ? 'కోశాధికారి' : 'సభ్యుడు'
        };
      });
    }

    if (list.length === 0) {
      return res.status(400).json({ error: 'Please provide members list or names text.' });
    }

    const createdMembers = [];
    for (const item of list) {
      const m = await db.members.create({
        full_name: item.full_name,
        full_name_te: item.full_name_te || item.full_name,
        phone: item.phone || `98480${Math.floor(10000 + Math.random() * 90000)}`,
        designation: item.designation || 'Member',
        designation_te: item.designation_te || 'సభ్యుడు',
        status: 'active'
      });
      createdMembers.push(m);
    }

    // Automatically generate ₹1,000 dues for current month if requested (default true)
    if (generateDues !== false) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      await db.dues.generateForMonth(currentMonth, currentYear, 1000);
    }

    return res.status(201).json({
      message: `Successfully registered ${createdMembers.length} members with ₹1,000 monthly dues.`,
      count: createdMembers.length,
      members: createdMembers
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/members/:id - update member (admin)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const updated = await db.members.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Member not found' });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/members/:id - delete member (admin)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const success = await db.members.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Member not found' });
    }
    return res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
