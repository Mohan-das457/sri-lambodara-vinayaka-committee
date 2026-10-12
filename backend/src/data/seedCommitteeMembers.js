require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const membersList = [
  { id: 1, code: 'SLV-001', name: 'Chinna anna', nameTe: 'చిన్న అన్న', phone: '9848011001', designation: 'President', designationTe: 'అధ్యక్షులు' },
  { id: 2, code: 'SLV-002', name: 'Nagaraj anna', nameTe: 'నాగరాజ్ అన్న', phone: '9848011002', designation: 'Vice President', designationTe: 'ఉపాధ్యక్షులు' },
  { id: 3, code: 'SLV-003', name: 'Chandu', nameTe: 'చందు', phone: '9848011003', designation: 'Secretary', designationTe: 'కార్యదర్శి' },
  { id: 4, code: 'SLV-004', name: 'Hemanth', nameTe: 'హేమంత్', phone: '9848011004', designation: 'Treasurer', designationTe: 'కోశాధికారి' },
  { id: 5, code: 'SLV-005', name: 'Santhosh anna', nameTe: 'సంతోష్ అన్న', phone: '9848011005', designation: 'Executive Member', designationTe: 'కార్యవర్గ సభ్యుడు' },
  { id: 6, code: 'SLV-006', name: 'Praveen anna', nameTe: 'ప్రవీణ్ అన్న', phone: '9848011006', designation: 'Executive Member', designationTe: 'కార్యవర్గ సభ్యుడు' },
  { id: 7, code: 'SLV-007', name: 'Kutti anna', nameTe: 'కుట్టి అన్న', phone: '9848011007', designation: 'Member', designationTe: 'సభ్యుడు' },
  { id: 8, code: 'SLV-008', name: 'Jagadeesh anna', nameTe: 'జగదీష్ అన్న', phone: '9848011008', designation: 'Member', designationTe: 'సభ్యుడు' },
  { id: 9, code: 'SLV-009', name: 'Maheshwari / Rajini', nameTe: 'మహేశ్వరి / రజినీ', phone: '9848011009', designation: 'Member', designationTe: 'సభ్యురాలు' },
  { id: 10, code: 'SLV-010', name: 'Kavya / Mohan / Harsha', nameTe: 'కావ్య / మోహన్ / హర్ష', phone: '9848011010', designation: 'Member', designationTe: 'సభ్యులు' },
  { id: 11, code: 'SLV-011', name: 'Ajay / Chinni anna', nameTe: 'అజయ్ / చిన్ని అన్న', phone: '9848011011', designation: 'Member', designationTe: 'సభ్యుడు' },
  { id: 12, code: 'SLV-012', name: 'Shiva', nameTe: 'శివ', phone: '9848011012', designation: 'Member', designationTe: 'సభ్యుడు' },
  { id: 13, code: 'SLV-013', name: 'Kalyan', nameTe: 'కళ్యాణ్', phone: '9848011013', designation: 'Member', designationTe: 'సభ్యుడు' },
  { id: 14, code: 'SLV-014', name: 'Madhava anna', nameTe: 'మాధవ అన్న', phone: '9848011014', designation: 'Member', designationTe: 'సభ్యుడు' },
  { id: 15, code: 'SLV-015', name: 'Kunni anna', nameTe: 'కున్ని అన్న', phone: '9848011015', designation: 'Member', designationTe: 'సభ్యుడు' }
];

async function seedRealMembers() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'temple_committee';

  console.log(`🔌 Connecting to MySQL at ${user}@${host}:${port}/${database}...`);
  const conn = await mysql.createConnection({ host, port, user, password, database });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('TRUNCATE TABLE members');
  await conn.query('TRUNCATE TABLE monthly_dues');
  await conn.query('TRUNCATE TABLE payments');
  await conn.query('TRUNCATE TABLE expenses');
  await conn.query('TRUNCATE TABLE other_income');
  await conn.query('TRUNCATE TABLE meeting_attendance');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // Insert Funds starting from 0 balance
  await conn.query(
    `INSERT INTO funds (id, fund_code, name, name_te, balance, description) VALUES
     (1, 'general', 'General Temple Fund', 'సాధారణ ఆలయ నిధి', 0.00, 'Monthly member subscriptions of ₹1,000, regular temple maintenance and nitya pooja'),
     (2, 'festival', 'Ganesh Utsav & Festival Fund', 'గణేష్ ఉత్సవ & పండుగ నిధి', 0.00, 'Special donations for Vinayaka Chavithi, Annadanam, and festival celebrations')
     ON DUPLICATE KEY UPDATE balance = 0.00`
  );

  // Insert 15 Members
  console.log(`👥 Registering ${membersList.length} Committee Members...`);
  for (const m of membersList) {
    await conn.query(
      `INSERT INTO members (id, member_code, full_name, full_name_te, phone, designation, designation_te, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, '2026-10-01', 'active')`,
      [m.id, m.code, m.name, m.nameTe, m.phone, m.designation, m.designationTe]
    );
  }

  // Generate October 2026 dues of ₹1,000 for each of the 15 members
  const currentMonth = 10;
  const currentYear = 2026;
  const dueDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`;

  console.log(`📅 Generating October 2026 ₹1,000 dues for all 15 members (Due date: ${dueDate})...`);
  for (const m of membersList) {
    await conn.query(
      `INSERT INTO monthly_dues (member_id, due_month, due_year, amount, paid_amount, status, due_date)
       VALUES (?, ?, ?, 1000.00, 0.00, 'pending', ?)`,
      [m.id, currentMonth, currentYear, dueDate]
    );
  }

  // Update or insert user accounts linked to members
  const salt = bcrypt.genSaltSync(10);
  const passHash = bcrypt.hashSync('admin123', salt);
  await conn.query(
    `INSERT INTO users (id, member_id, username, password_hash, role, status) VALUES
     (1, 1, 'admin', ?, 'admin', 'active')
     ON DUPLICATE KEY UPDATE member_id = 1`
  , [passHash]);

  // Update local store.json
  const storePath = path.join(__dirname, '../../data/store.json');
  const storeData = {
    members: membersList.map(m => ({
      id: m.id,
      member_code: m.code,
      full_name: m.name,
      full_name_te: m.nameTe,
      phone: m.phone,
      designation: m.designation,
      designation_te: m.designationTe,
      join_date: '2026-10-01',
      status: 'active',
      created_at: new Date().toISOString()
    })),
    users: [
      { id: 1, member_id: 1, username: 'admin', password_hash: passHash, role: 'admin', status: 'active' }
    ],
    funds: [
      { id: 1, fund_code: 'general', name: 'General Temple Fund', name_te: 'సాధారణ ఆలయ నిధి', balance: 0.00, description: 'Monthly member subscriptions of ₹1,000' },
      { id: 2, fund_code: 'festival', name: 'Ganesh Utsav & Festival Fund', name_te: 'గణేష్ ఉత్సవ & పండుగ నిధి', balance: 0.00, description: 'Special donations for Vinayaka Chavithi' }
    ],
    monthly_dues: membersList.map((m, idx) => ({
      id: idx + 1,
      member_id: m.id,
      due_month: currentMonth,
      due_year: currentYear,
      amount: 1000.00,
      paid_amount: 0.00,
      status: 'pending',
      due_date: dueDate,
      created_at: new Date().toISOString()
    })),
    payments: [],
    expenses: [],
    other_income: [],
    meetings: [
      {
        id: 1,
        title: 'October 2026 Monthly Committee Meeting',
        title_te: 'అక్టోబర్ 2026 నెలవారీ కమిటీ సమావేశం',
        meeting_date: '2026-10-15',
        meeting_time: '19:30:00',
        venue: 'Sri Lambodara Vinayaka Temple Hall',
        venue_te: 'శ్రీ లంబోదర వినాయక ఆలయ ప్రాంగణం',
        agenda: '1. Collection of October 2026 monthly dues (₹1,000 per member)\n2. Deepavali special pooja planning\n3. General maintenance review',
        agenda_te: '1. అక్టోబర్ నెలవారీ చందా (సభ్యునికి ₹1,000) సేకరణ\n2. దీపావళి విశేష పూజల ప్రణాళిక\n3. ఆలయ సాధారణ నిర్వహణ సమీక్ష',
        status: 'Scheduled'
      }
    ],
    meeting_attendance: [],
    announcements: [
      {
        id: 1,
        title: 'Monthly Contribution Notice: ₹1,000 by 15th October',
        title_te: 'నెలవారీ చందా ప్రకటన: ఈ నెల 15వ తేదీలోగా ₹1,000 చెల్లింపు',
        message: 'All 15 committee members are requested to pay the monthly subscription of ₹1,000 on or before the 15th through Cash or UPI.',
        message_te: 'గౌరవ 15 మంది కమిటీ సభ్యులు అక్టోబర్ 15వ తేదీలోగా తమ నెలవారీ చందా ₹1,000 ను నగదు లేదా UPI ద్వారా చెల్లించగలరు.',
        category: 'Dues',
        priority: 'High',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ],
    documents: []
  };

  fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf8');

  console.log(`✅ Successfully loaded all 15 members into MySQL! Total Target: ₹${membersList.length * 1000}`);
  await conn.end();
}

seedRealMembers().catch(err => {
  console.error('❌ Error seeding members:', err);
  process.exit(1);
});
