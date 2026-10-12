const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await db.users.findByUsername(username.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    let member = null;
    if (user.member_id) {
      member = await db.members.getById(user.member_id);
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      member_id: user.member_id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        member: member ? {
          id: member.id,
          member_code: member.member_code,
          full_name: member.full_name,
          full_name_te: member.full_name_te,
          designation: member.designation,
          phone: member.phone
        } : null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let member = null;
    if (user.member_id) {
      member = await db.members.getById(user.member_id);
    }
    return res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      member
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/demo-users
router.get('/demo-users', async (req, res) => {
  res.json([
    { username: 'admin', role: 'admin', label: 'Admin (Chinna anna)', password: 'admin123' },
    { username: 'treasurer', role: 'treasurer', label: 'Treasurer (Hemanth)', password: 'treasurer123' },
    { username: 'secretary', role: 'secretary', label: 'Secretary (Chandu)', password: 'secretary123' },
    { username: 'member', role: 'member', label: 'Member (Kalyan)', password: 'member123' }
  ]);
});

module.exports = router;
