const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stats
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stats = await db.getStats();
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/whatsapp-reminder-text
router.get('/whatsapp-reminder-text', authMiddleware, async (req, res) => {
  try {
    const { member_id, month, year, amount } = req.query;
    const member = await db.members.getById(member_id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const monthName = month ? `నెల ${month}/${year}` : 'ఈ నెల';
    const text = `🛕 *శ్రీ లంబోదర వినాయక కమిటీ* 🛕\n\nనమస్కారం ${member.full_name_te || member.full_name} గారు (ID: ${member.member_code}),\n\nకమిటీ సభ్యులందరి సహకారంతో ఆలయ కార్యక్రమాలు దివ్యంగా కొనసాగుతున్నాయి. ${monthName} నెలవారీ చందా బకాయి *₹${amount || 1000}* ఉంది.\n\nదయచేసి మీ చందాను PhonePe / GPay / నగదు రూపంలో కోశాధికారి గారికి చెల్లించగలరు.\nUPI ID: slvcommittee@upi\n\nచెల్లించిన వెంటనే డిజిటల్ రసీదు జారీ చేయబడుతుంది.\n- కార్యదర్శి / కోశాధికారి`;

    return res.json({ text, phone: member.phone });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
