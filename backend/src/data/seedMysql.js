require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const { getSeedData } = require('./seedData');

async function seedMysql() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'temple_committee';

  console.log(`🔌 Connecting to MySQL at ${user}@${host}:${port}/${database}...`);
  const conn = await mysql.createConnection({ host, port, user, password, database });

  const data = getSeedData();

  // Clear existing
  console.log('🧹 Clearing old records if any...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = ['documents', 'announcements', 'meeting_attendance', 'meetings', 'other_income', 'expenses', 'payments', 'monthly_dues', 'funds', 'users', 'members'];
  for (const t of tables) {
    try {
      await conn.query(`TRUNCATE TABLE \`${t}\``);
    } catch (e) {}
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // Insert Members
  console.log(`👥 Inserting ${data.members.length} members...`);
  for (const m of data.members) {
    await conn.query(
      `INSERT INTO members (id, member_code, full_name, full_name_te, phone, email, address, designation, designation_te, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.member_code, m.full_name, m.full_name_te, m.phone, m.email, m.address, m.designation, m.designation_te, m.join_date, m.status]
    );
  }

  // Insert Users
  console.log(`🔐 Inserting ${data.users.length} users...`);
  for (const u of data.users) {
    await conn.query(
      `INSERT INTO users (id, member_id, username, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, u.member_id, u.username, u.password_hash, u.role, u.status]
    );
  }

  // Insert Funds
  console.log(`💰 Inserting ${data.funds.length} funds...`);
  for (const f of data.funds) {
    await conn.query(
      `INSERT INTO funds (id, fund_code, name, name_te, balance, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [f.id, f.fund_code, f.name, f.name_te, f.balance, f.description]
    );
  }

  // Insert Monthly Dues
  console.log(`📅 Inserting ${data.monthly_dues.length} dues...`);
  for (const d of data.monthly_dues) {
    await conn.query(
      `INSERT INTO monthly_dues (id, member_id, due_month, due_year, amount, paid_amount, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.member_id, d.due_month, d.due_year, d.amount, d.paid_amount, d.status, d.due_date]
    );
  }

  // Insert Payments
  console.log(`🧾 Inserting ${data.payments.length} payments...`);
  for (const p of data.payments) {
    await conn.query(
      `INSERT INTO payments (id, receipt_number, member_id, due_id, fund_code, amount, payment_mode, upi_ref, payment_date, received_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.receipt_number, p.member_id, p.due_id, p.fund_code, p.amount, p.payment_mode, p.upi_ref, p.payment_date, p.received_by, p.remarks]
    );
  }

  // Insert Expenses
  console.log(`📉 Inserting ${data.expenses.length} expenses...`);
  for (const exp of data.expenses) {
    await conn.query(
      `INSERT INTO expenses (id, voucher_number, fund_code, title, title_te, category, amount, expense_date, paid_to, approved_by, bill_receipt_ref, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [exp.id, exp.voucher_number, exp.fund_code, exp.title, exp.title_te, exp.category, exp.amount, exp.expense_date, exp.paid_to, exp.approved_by, exp.bill_receipt_ref, exp.remarks]
    );
  }

  // Insert Other Income
  console.log(`📈 Inserting ${data.other_income.length} donations...`);
  for (const inc of data.other_income) {
    await conn.query(
      `INSERT INTO other_income (id, receipt_number, fund_code, donor_name, donor_phone, amount, income_date, payment_mode, upi_ref, purpose, received_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [inc.id, inc.receipt_number, inc.fund_code, inc.donor_name, inc.donor_phone, inc.amount, inc.income_date, inc.payment_mode, inc.upi_ref, inc.purpose, inc.received_by, inc.remarks]
    );
  }

  // Insert Meetings
  console.log(`🏛️ Inserting ${data.meetings.length} meetings...`);
  for (const m of data.meetings) {
    await conn.query(
      `INSERT INTO meetings (id, title, title_te, meeting_date, meeting_time, venue, venue_te, agenda, agenda_te, minutes, minutes_te, decisions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.title, m.title_te, m.meeting_date, m.meeting_time, m.venue, m.venue_te, m.agenda, m.agenda_te, m.minutes, m.minutes_te, m.decisions, m.status]
    );
  }

  // Insert Meeting Attendance
  console.log(`📋 Inserting ${data.meeting_attendance.length} attendance records...`);
  for (const a of data.meeting_attendance) {
    await conn.query(
      `INSERT INTO meeting_attendance (id, meeting_id, member_id, status, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [a.id, a.meeting_id, a.member_id, a.status, a.notes]
    );
  }

  // Insert Announcements
  console.log(`📢 Inserting ${data.announcements.length} announcements...`);
  for (const ann of data.announcements) {
    await conn.query(
      `INSERT INTO announcements (id, title, title_te, message, message_te, category, priority, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ann.id, ann.title, ann.title_te, ann.message, ann.message_te, ann.category, ann.priority, ann.is_active]
    );
  }

  console.log('✅ Successfully seeded MySQL database `temple_committee`!');
  await conn.end();
}

seedMysql().catch(err => {
  console.error('❌ Error seeding MySQL:', err);
  process.exit(1);
});
