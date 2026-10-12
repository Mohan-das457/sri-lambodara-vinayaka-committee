require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Route imports
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const duesRoutes = require('./routes/dues');
const paymentsRoutes = require('./routes/payments');
const financesRoutes = require('./routes/finances');
const meetingsRoutes = require('./routes/meetings');
const announcementsRoutes = require('./routes/announcements');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root test endpoint as per specification
app.get('/', (req, res) => {
  res.json({
    message: 'Sri Lambodara Vinayaka Committee API',
    status: 'running'
  });
});

// Health check endpoint as per specification
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: process.env.DB_NAME || 'temple_committee',
    dbMode: db.mode,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/dues', duesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize Database & Start Server
async function startServer() {
  await db.init();
  const server = app.listen(PORT, () => {
    console.log(`Temple Committee API running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = PORT === 5000 ? 5001 : Number(PORT) + 1;
      console.warn(`⚠️ Port ${PORT} is in use (often macOS AirPlay on 5000). Retrying on http://localhost:${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`Temple Committee API running on http://localhost:${fallbackPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
