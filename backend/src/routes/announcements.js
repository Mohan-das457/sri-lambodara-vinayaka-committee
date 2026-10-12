const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /api/announcements
router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await db.announcements.getAll();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/announcements
router.post('/', authMiddleware, requireRole('admin', 'secretary'), async (req, res) => {
  try {
    const { title, title_te, message, message_te, category, priority } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const ann = await db.announcements.create({
      title,
      title_te: title_te || title,
      message,
      message_te: message_te || message,
      category: category || 'General',
      priority: priority || 'Normal'
    });

    return res.status(201).json(ann);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
