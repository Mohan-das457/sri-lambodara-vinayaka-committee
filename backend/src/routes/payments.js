const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /api/payments
router.get('/', authMiddleware, async (req, res) => {
  try {
    let payments = await db.payments.getAll();
    if (req.user.role === 'member') {
      payments = payments.filter(p => p.member_id === req.user.member_id);
    }
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await db.payments.getById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    if (req.user.role === 'member' && payment.member_id !== req.user.member_id) {
      return res.status(403).json({ error: 'Unauthorized to view this payment' });
    }
    return res.json(payment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments - record new payment
router.post('/', authMiddleware, requireRole('admin', 'treasurer'), async (req, res) => {
  try {
    const { member_id, due_id, fund_code, amount, payment_mode, upi_ref, payment_date, remarks } = req.body;
    if (!member_id || !amount) {
      return res.status(400).json({ error: 'Member and amount are required.' });
    }

    if (payment_mode === 'UPI' && !upi_ref) {
      return res.status(400).json({ error: 'UPI Transaction Reference / UTR Number is required for UPI payments.' });
    }

    const member = await db.members.getById(member_id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const payment = await db.payments.create({
      member_id,
      due_id: due_id || null,
      fund_code: fund_code || 'general',
      amount: parseFloat(amount),
      payment_mode: payment_mode || 'Cash',
      upi_ref: upi_ref || null,
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      received_by: `${req.user.username} (${req.user.role.toUpperCase()})`,
      remarks: remarks || ''
    });

    return res.status(201).json(payment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id/receipt - Formatted digital receipt
router.get('/:id/receipt', authMiddleware, async (req, res) => {
  try {
    const payment = await db.payments.getById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment receipt not found' });
    }

    if (req.user.role === 'member' && payment.member_id !== req.user.member_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const member = await db.members.getById(payment.member_id);

    return res.json({
      organization: {
        name: 'Sri Lambodara Vinayaka Committee',
        name_te: 'శ్రీ లంబోదర వినాయక కమిటీ',
        subtitle: 'Temple Seva & Welfare Trust',
        subtitle_te: 'ఆలయ సేవ & అభివృద్ధి సంక్షేమ సంఘం',
        address: 'Sri Lambodara Vinayaka Temple, Main Road',
        registrationNo: 'REG/SLV/2023/881'
      },
      receipt: {
        receipt_number: payment.receipt_number,
        date: payment.payment_date,
        amount: payment.amount,
        payment_mode: payment.payment_mode,
        upi_ref: payment.upi_ref,
        fund_type: payment.fund_code === 'festival' ? 'Festival Fund (ఉత్సవ నిధి)' : 'General Fund (సాధారణ నిధి)',
        received_by: payment.received_by,
        remarks: payment.remarks
      },
      member: {
        member_code: member.member_code,
        full_name: member.full_name,
        full_name_te: member.full_name_te,
        phone: member.phone,
        designation: member.designation
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
