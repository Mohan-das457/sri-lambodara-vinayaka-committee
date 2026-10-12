const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /api/meetings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const meetings = await db.meetings.getAll();
    return res.json(meetings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/meetings/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await db.meetings.getById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    return res.json(meeting);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings
router.post('/', authMiddleware, requireRole('admin', 'secretary'), async (req, res) => {
  try {
    const { title, title_te, meeting_date, meeting_time, venue, venue_te, agenda, agenda_te } = req.body;
    if (!title || !meeting_date) {
      return res.status(400).json({ error: 'Title and meeting date are required.' });
    }

    const meeting = await db.meetings.create({
      title,
      title_te: title_te || title,
      meeting_date,
      meeting_time: meeting_time || '19:30:00',
      venue: venue || 'Sri Lambodara Vinayaka Temple Hall',
      venue_te: venue_te || 'శ్రీ లంబోదర వినాయక ఆలయ ప్రాంగణం',
      agenda: agenda || '',
      agenda_te: agenda_te || agenda || ''
    });

    return res.status(201).json(meeting);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/meetings/:id - update meeting details, minutes, decisions
router.put('/:id', authMiddleware, requireRole('admin', 'secretary'), async (req, res) => {
  try {
    const updated = await db.meetings.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings/:id/attendance
router.post('/:id/attendance', authMiddleware, requireRole('admin', 'secretary'), async (req, res) => {
  try {
    const { attendance } = req.body; // array of { member_id, status, notes }
    if (!Array.isArray(attendance)) {
      return res.status(400).json({ error: 'Attendance records must be an array.' });
    }

    await db.meetings.updateAttendance(req.params.id, attendance);
    return res.json({ message: 'Attendance records updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/meetings/:id/whatsapp-draft
router.get('/:id/whatsapp-draft', authMiddleware, async (req, res) => {
  try {
    const meeting = await db.meetings.getById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const draftText = `🛕 *శ్రీ లంబోదర వినాయక కమిటీ ముఖ్య సమాచారం* 🛕\n\n*Sri Lambodara Vinayaka Committee Meeting Notice*\n\nగౌరవ కమిటీ సభ్యులకు నమస్కారం,\nతేదీ: *${meeting.meeting_date}* (సమయం: *${meeting.meeting_time}*)\nవేదిక: *${meeting.venue_te || meeting.venue}*\n\n*ఎజెండా అంశాలు:*\n${meeting.agenda_te || meeting.agenda}\n\nదయచేసి సభ్యులందరూ సమయానికి హాజరుకావలసిందిగా కోరడమైనది.\n- సెక్రటరీ, శ్రీ లంబోదర వినాయక కమిటీ`;

    return res.json({ draftText });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
