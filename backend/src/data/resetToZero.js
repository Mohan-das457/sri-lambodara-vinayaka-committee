require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function resetToZero() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'temple_committee';

  console.log(`🧹 Resetting database to ZERO on ${user}@${host}:${port}/${database}...`);
  const conn = await mysql.createConnection({ host, port, user, password, database });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = ['documents', 'announcements', 'meeting_attendance', 'meetings', 'other_income', 'expenses', 'payments', 'monthly_dues', 'funds', 'users', 'members'];
  for (const t of tables) {
    try {
      await conn.query(`TRUNCATE TABLE \`${t}\``);
    } catch (e) {}
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // 1. Initialize Funds with ZERO balances
  console.log('💰 Setting initial Funds with ZERO (₹0.00) balance...');
  await conn.query(
    `INSERT INTO funds (id, fund_code, name, name_te, balance, description) VALUES
     (1, 'general', 'General Temple Fund', 'సాధారణ ఆలయ నిధి', 0.00, 'Monthly member subscriptions of ₹1,000, regular temple maintenance and nitya pooja'),
     (2, 'festival', 'Ganesh Utsav & Festival Fund', 'గణేష్ ఉత్సవ & పండుగ నిధి', 0.00, 'Special donations for Vinayaka Chavithi, Annadanam, and festival celebrations')`
  );

  // 2. Insert Default Admin User so system remains accessible
  console.log('🔐 Setting up primary Admin user account (admin / admin123)...');
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  await conn.query(
    `INSERT INTO users (id, member_id, username, password_hash, role, status) VALUES
     (1, NULL, 'admin', ?, 'admin', 'active')`,
    [adminHash]
  );

  // 3. Initialize Initial Scheduled Meeting for 15th
  await conn.query(
    `INSERT INTO meetings (id, title, title_te, meeting_date, meeting_time, venue, venue_te, agenda, agenda_te, status) VALUES
     (1, 'Monthly Committee Meeting (15th at 7:30 PM)', 'నెలవారీ కమిటీ సమావేశం (15వ తేదీ రాత్రి 7:30 గంటలకు)', '2026-10-15', '19:30:00', 'Sri Lambodara Vinayaka Temple Hall', 'శ్రీ లంబోదర వినాయక ఆలయ ప్రాంగణం', '1. Member onboarding\n2. Monthly contribution collection of ₹1,000\n3. Committee agenda planning', '1. సభ్యుల నమోదు\n2. నెలవారీ చందా ₹1,000 వసూలు\n3. కమిటీ కార్యాచరణ ప్రణాళిక', 'Scheduled')`
  );

  // 4. Initialize Welcome Announcement
  await conn.query(
    `INSERT INTO announcements (id, title, title_te, message, message_te, category, priority, is_active) VALUES
     (1, 'Committee System Initialized - Monthly Dues ₹1,000', 'కమిటీ వ్యవస్థ ప్రారంభం - నెలవారీ చందా ₹1,000', 'Welcome to Sri Lambodara Vinayaka Committee. Monthly membership subscription is configured at ₹1,000 for all members.', 'శ్రీ లంబోదర వినాయక కమిటీ నిర్వహణ వ్యవస్థ ప్రారంభమైనది. సభ్యులందరికీ నెలవారీ చందా ₹1,000 గా నిర్ణయించబడింది.', 'General', 'Normal', 1)`
  );

  // Also update local store.json to reflect the clean zero state
  const storePath = path.join(__dirname, '../../data/store.json');
  const zeroStore = {
    members: [],
    users: [{ id: 1, member_id: null, username: 'admin', password_hash: adminHash, role: 'admin', status: 'active' }],
    funds: [
      { id: 1, fund_code: 'general', name: 'General Temple Fund', name_te: 'సాధారణ ఆలయ నిధి', balance: 0.00, description: 'Monthly member subscriptions of ₹1,000' },
      { id: 2, fund_code: 'festival', name: 'Ganesh Utsav & Festival Fund', name_te: 'గణేష్ ఉత్సవ & పండుగ నిధి', balance: 0.00, description: 'Special donations for Vinayaka Chavithi' }
    ],
    monthly_dues: [],
    payments: [],
    expenses: [],
    other_income: [],
    meetings: [
      {
        id: 1,
        title: 'Monthly Committee Meeting (15th at 7:30 PM)',
        title_te: 'నెలవారీ కమిటీ సమావేశం (15వ తేదీ రాత్రి 7:30 గంటలకు)',
        meeting_date: '2026-10-15',
        meeting_time: '19:30:00',
        venue: 'Sri Lambodara Vinayaka Temple Hall',
        venue_te: 'శ్రీ లంబోదర వినాయక ఆలయ ప్రాంగణం',
        agenda: '1. Member onboarding\n2. Monthly dues ₹1,000 collection',
        agenda_te: '1. సభ్యుల నమోదు\n2. నెల చందా ₹1,000 సేకరణ',
        status: 'Scheduled'
      }
    ],
    meeting_attendance: [],
    announcements: [
      {
        id: 1,
        title: 'Committee System Initialized - Monthly Dues ₹1,000',
        title_te: 'కమిటీ వ్యవస్థ ప్రారంభం - నెలవారీ చందా ₹1,000',
        message: 'Monthly membership subscription is configured at ₹1,000 for all active members.',
        message_te: 'కమిటీ సభ్యులందరికీ నెలవారీ చందా ₹1,000 గా నిర్ణయించబడింది.',
        category: 'General',
        priority: 'Normal',
        is_active: true
      }
    ],
    documents: []
  };

  fs.writeFileSync(storePath, JSON.stringify(zeroStore, null, 2), 'utf8');

  console.log('✅ System successfully reset to ZERO with ₹1,000 dues configuration!');
  await conn.end();
}

resetToZero().catch(err => {
  console.error('❌ Error resetting:', err);
  process.exit(1);
});
