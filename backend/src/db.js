const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { getSeedData } = require('./data/seedData');

const storePath = path.join(__dirname, '../data/store.json');
const storeDir = path.dirname(storePath);

let pool = null;
let activeMode = 'local'; // 'mysql' | 'local'
let memoryStore = null;

function ensureStoreDir() {
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }
}

function loadLocalStore() {
  ensureStoreDir();
  if (fs.existsSync(storePath)) {
    try {
      const data = fs.readFileSync(storePath, 'utf8');
      memoryStore = JSON.parse(data);
      return memoryStore;
    } catch (err) {
      console.warn('⚠️ Could not parse store.json, reinitializing from seed data...');
    }
  }
  memoryStore = getSeedData();
  saveLocalStore();
  return memoryStore;
}

function saveLocalStore() {
  ensureStoreDir();
  fs.writeFileSync(storePath, JSON.stringify(memoryStore, null, 2), 'utf8');
}

// Initialize Database connection (MySQL or Fallback Local)
async function initDb() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'temple_committee';
  const isRemote = host !== 'localhost' && host !== '127.0.0.1';
  const sslConfig = (process.env.DB_SSL === 'true' || isRemote) ? { rejectUnauthorized: false } : undefined;

  try {
    // Attempt connecting to MySQL
    const connConfig = process.env.DATABASE_URL ? process.env.DATABASE_URL : {
      host,
      port,
      user,
      password,
      ssl: sslConfig,
      connectTimeout: 8000
    };

    const testConn = await mysql.createConnection(connConfig);

    try {
      await testConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    } catch (e) {
      // Some cloud providers (e.g. AWS RDS or PlanetScale) restrict CREATE DATABASE privileges
    }
    await testConn.end();

    const poolConfig = process.env.DATABASE_URL ? { uri: process.env.DATABASE_URL, ssl: sslConfig } : {
      host,
      port,
      user,
      password,
      database,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    pool = mysql.createPool(poolConfig);

    // Test query
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    activeMode = 'mysql';
    console.log(`✅ [Database] Connected successfully to Remote/Cloud MySQL (${database}@${host}:${port})`);

    // Verify if tables exist and are populated
    await setupMysqlTables();
  } catch (err) {
    activeMode = 'local';
    console.log(`ℹ️ [Database] MySQL connection notice (${err.message})`);
    console.log(`⚡ [Database] Activated resilient local persistent database store at: ${storePath}`);
    loadLocalStore();
  }
}

async function setupMysqlTables() {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'members'");
    if (tables.length === 0) {
      console.log('📦 Setting up initial MySQL tables and seed data...');
      const schemaPath = path.join(__dirname, 'data/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql
          .replace(/--.*$/gm, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE '));

        for (const sql of statements) {
          try {
            await pool.query(sql);
          } catch (e) {
            // ignore
          }
        }
        console.log('✅ MySQL schema applied.');
      }
    }
  } catch (err) {
    console.error('⚠️ MySQL table setup notice:', err.message);
  }
}

// Unified repository methods supporting both MySQL and Local store
const db = {
  get mode() {
    return activeMode;
  },
  init: initDb,

  // MEMBERS
  members: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM members ORDER BY id ASC');
        return rows;
      }
      return [...memoryStore.members];
    },
    async getById(id) {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
        return rows[0] || null;
      }
      return memoryStore.members.find(m => m.id === parseInt(id, 10)) || null;
    },
    async create(data) {
      if (activeMode === 'mysql' && pool) {
        const [result] = await pool.query(
          `INSERT INTO members (member_code, full_name, full_name_te, phone, email, address, designation, designation_te, join_date, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.member_code || `SLV-${Date.now().toString().slice(-3)}`,
            data.full_name,
            data.full_name_te || null,
            data.phone,
            data.email || null,
            data.address || null,
            data.designation || 'Member',
            data.designation_te || 'సభ్యుడు',
            data.join_date || new Date().toISOString().split('T')[0],
            data.status || 'active'
          ]
        );
        return { id: result.insertId, ...data };
      }
      const newId = memoryStore.members.length ? Math.max(...memoryStore.members.map(m => m.id)) + 1 : 1;
      const newMember = {
        id: newId,
        member_code: data.member_code || `SLV-${String(newId).padStart(3, '0')}`,
        full_name: data.full_name,
        full_name_te: data.full_name_te || data.full_name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        designation: data.designation || 'Member',
        designation_te: data.designation_te || 'సభ్యుడు',
        join_date: data.join_date || new Date().toISOString().split('T')[0],
        status: data.status || 'active',
        created_at: new Date().toISOString()
      };
      memoryStore.members.push(newMember);
      saveLocalStore();
      return newMember;
    },
    async update(id, data) {
      const numId = parseInt(id, 10);
      if (activeMode === 'mysql' && pool) {
        await pool.query(
          `UPDATE members SET full_name = ?, full_name_te = ?, phone = ?, email = ?, address = ?, designation = ?, designation_te = ?, status = ? WHERE id = ?`,
          [data.full_name, data.full_name_te, data.phone, data.email, data.address, data.designation, data.designation_te, data.status, numId]
        );
        return this.getById(numId);
      }
      const idx = memoryStore.members.findIndex(m => m.id === numId);
      if (idx === -1) return null;
      memoryStore.members[idx] = { ...memoryStore.members[idx], ...data, updated_at: new Date().toISOString() };
      saveLocalStore();
      return memoryStore.members[idx];
    },
    async delete(id) {
      const numId = parseInt(id, 10);
      if (activeMode === 'mysql' && pool) {
        await pool.query('DELETE FROM members WHERE id = ?', [numId]);
        return true;
      }
      const initialLen = memoryStore.members.length;
      memoryStore.members = memoryStore.members.filter(m => m.id !== numId);
      saveLocalStore();
      return memoryStore.members.length < initialLen;
    }
  },

  // USERS
  users: {
    async findByUsername(username) {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0] || null;
      }
      return memoryStore.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    },
    async findById(id) {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
      }
      return memoryStore.users.find(u => u.id === parseInt(id, 10)) || null;
    },
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT id, member_id, username, role, status, created_at FROM users');
        return rows;
      }
      return memoryStore.users.map(({ password_hash, ...u }) => u);
    }
  },

  // DUES
  dues: {
    async getAll(filters = {}) {
      if (activeMode === 'mysql' && pool) {
        let sql = `
          SELECT d.*, m.full_name, m.full_name_te, m.member_code, m.phone, m.designation
          FROM monthly_dues d
          JOIN members m ON d.member_id = m.id
          WHERE 1=1
        `;
        const params = [];
        if (filters.month) {
          sql += ' AND d.due_month = ?';
          params.push(filters.month);
        }
        if (filters.year) {
          sql += ' AND d.due_year = ?';
          params.push(filters.year);
        }
        if (filters.status) {
          sql += ' AND d.status = ?';
          params.push(filters.status);
        }
        if (filters.member_id) {
          sql += ' AND d.member_id = ?';
          params.push(filters.member_id);
        }
        sql += ' ORDER BY d.due_year DESC, d.due_month DESC, m.id ASC';
        const [rows] = await pool.query(sql, params);
        return rows;
      }
      let dues = memoryStore.monthly_dues.map(due => {
        const m = memoryStore.members.find(x => x.id === due.member_id) || {};
        return {
          ...due,
          full_name: m.full_name,
          full_name_te: m.full_name_te,
          member_code: m.member_code,
          phone: m.phone,
          designation: m.designation
        };
      });

      if (filters.month) dues = dues.filter(d => d.due_month === parseInt(filters.month, 10));
      if (filters.year) dues = dues.filter(d => d.due_year === parseInt(filters.year, 10));
      if (filters.status) dues = dues.filter(d => d.status === filters.status);
      if (filters.member_id) dues = dues.filter(d => d.member_id === parseInt(filters.member_id, 10));
      return dues;
    },
    async generateForMonth(month, year, amount = 1000) {
      const activeMembers = (await db.members.getAll()).filter(m => m.status === 'active');
      const createdDues = [];
      const dueDate = `${year}-${String(month).padStart(2, '0')}-15`;

      for (const m of activeMembers) {
        if (activeMode === 'mysql' && pool) {
          const [exists] = await pool.query(
            'SELECT id FROM monthly_dues WHERE member_id = ? AND due_month = ? AND due_year = ?',
            [m.id, month, year]
          );
          if (exists.length === 0) {
            const [res] = await pool.query(
              `INSERT INTO monthly_dues (member_id, due_month, due_year, amount, paid_amount, status, due_date)
               VALUES (?, ?, ?, ?, 0, 'pending', ?)`,
              [m.id, month, year, amount, dueDate]
            );
            createdDues.push({ id: res.insertId, member_id: m.id, due_month: month, due_year: year, amount, status: 'pending' });
          }
        } else {
          const existing = memoryStore.monthly_dues.find(
            d => d.member_id === m.id && d.due_month === parseInt(month, 10) && d.due_year === parseInt(year, 10)
          );
          if (!existing) {
            const newId = memoryStore.monthly_dues.length ? Math.max(...memoryStore.monthly_dues.map(d => d.id)) + 1 : 1;
            const dueObj = {
              id: newId,
              member_id: m.id,
              due_month: parseInt(month, 10),
              due_year: parseInt(year, 10),
              amount: parseFloat(amount),
              paid_amount: 0,
              status: 'pending',
              due_date: dueDate,
              created_at: new Date().toISOString()
            };
            memoryStore.monthly_dues.push(dueObj);
            createdDues.push(dueObj);
          }
        }
      }
      if (activeMode === 'local') saveLocalStore();
      return createdDues;
    }
  },

  // PAYMENTS & RECEIPTS
  payments: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query(`
          SELECT p.*, m.full_name, m.full_name_te, m.member_code, m.phone
          FROM payments p
          JOIN members m ON p.member_id = m.id
          ORDER BY p.id DESC
        `);
        return rows;
      }
      return memoryStore.payments
        .map(p => {
          const m = memoryStore.members.find(x => x.id === p.member_id) || {};
          return {
            ...p,
            full_name: m.full_name,
            full_name_te: m.full_name_te,
            member_code: m.member_code,
            phone: m.phone
          };
        })
        .sort((a, b) => b.id - a.id);
    },
    async getById(id) {
      const numId = parseInt(id, 10);
      const payments = await this.getAll();
      return payments.find(p => p.id === numId) || null;
    },
    async create(data) {
      const paymentAmount = parseFloat(data.amount);

      if (activeMode === 'mysql' && pool) {
        const [countRow] = await pool.query('SELECT COUNT(*) AS total FROM payments');
        const nextNum = (countRow[0]?.total || 0) + 1;
        const receiptNo = `SLV-REC-${new Date().getFullYear()}-${String(nextNum + 1000).slice(-4)}`;

        const [res] = await pool.query(
          `INSERT INTO payments (receipt_number, member_id, due_id, fund_code, amount, payment_mode, upi_ref, payment_date, received_by, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            receiptNo,
            data.member_id,
            data.due_id || null,
            data.fund_code || 'general',
            paymentAmount,
            data.payment_mode || 'Cash',
            data.upi_ref || null,
            data.payment_date || new Date().toISOString().split('T')[0],
            data.received_by || 'Treasurer',
            data.remarks || ''
          ]
        );

        if (data.due_id) {
          const [dueRows] = await pool.query('SELECT * FROM monthly_dues WHERE id = ?', [data.due_id]);
          if (dueRows.length > 0) {
            const currentDue = dueRows[0];
            const newPaid = parseFloat(currentDue.paid_amount || 0) + paymentAmount;
            const newStatus = newPaid >= currentDue.amount ? 'paid' : 'partial';
            await pool.query('UPDATE monthly_dues SET paid_amount = ?, status = ? WHERE id = ?', [newPaid, newStatus, data.due_id]);
          }
        }

        await pool.query('UPDATE funds SET balance = balance + ? WHERE fund_code = ?', [paymentAmount, data.fund_code || 'general']);

        return this.getById(res.insertId);
      }

      const newId = memoryStore.payments.length ? Math.max(...memoryStore.payments.map(p => p.id)) + 1 : 1;
      const receiptNo = `SLV-REC-${new Date().getFullYear()}-${String(newId + 1000).slice(-4)}`;

      const paymentRecord = {
        id: newId,
        receipt_number: receiptNo,
        member_id: parseInt(data.member_id, 10),
        due_id: data.due_id ? parseInt(data.due_id, 10) : null,
        fund_code: data.fund_code || 'general',
        amount: paymentAmount,
        payment_mode: data.payment_mode || 'Cash',
        upi_ref: data.upi_ref || null,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
        received_by: data.received_by || 'Treasurer',
        remarks: data.remarks || '',
        created_at: new Date().toISOString()
      };

      memoryStore.payments.push(paymentRecord);

      if (data.due_id) {
        const dueIdx = memoryStore.monthly_dues.findIndex(d => d.id === parseInt(data.due_id, 10));
        if (dueIdx !== -1) {
          const currentDue = memoryStore.monthly_dues[dueIdx];
          const newPaid = parseFloat(currentDue.paid_amount || 0) + paymentAmount;
          currentDue.paid_amount = newPaid;
          currentDue.status = newPaid >= currentDue.amount ? 'paid' : 'partial';
          currentDue.updated_at = new Date().toISOString();
        }
      }

      const fund = memoryStore.funds.find(f => f.fund_code === (data.fund_code || 'general'));
      if (fund) {
        fund.balance = parseFloat(fund.balance || 0) + paymentAmount;
      }

      saveLocalStore();
      return this.getById(newId);
    }
  },

  // EXPENSES
  expenses: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM expenses ORDER BY id DESC');
        return rows;
      }
      return [...memoryStore.expenses].sort((a, b) => b.id - a.id);
    },
    async create(data) {
      const amount = parseFloat(data.amount);

      if (activeMode === 'mysql' && pool) {
        const [countRow] = await pool.query('SELECT COUNT(*) AS total FROM expenses');
        const nextNum = (countRow[0]?.total || 0) + 1;
        const voucherNo = `SLV-EXP-${new Date().getFullYear()}-${String(nextNum + 100).slice(-3)}`;

        const [res] = await pool.query(
          `INSERT INTO expenses (voucher_number, fund_code, title, title_te, category, amount, expense_date, paid_to, approved_by, bill_receipt_ref, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            voucherNo,
            data.fund_code || 'general',
            data.title,
            data.title_te || data.title,
            data.category || 'Maintenance',
            amount,
            data.expense_date || new Date().toISOString().split('T')[0],
            data.paid_to,
            data.approved_by,
            data.bill_receipt_ref || null,
            data.remarks || null
          ]
        );
        await pool.query('UPDATE funds SET balance = GREATEST(0, balance - ?) WHERE fund_code = ?', [amount, data.fund_code || 'general']);
        return { id: res.insertId, voucher_number: voucherNo, ...data };
      }

      const newId = memoryStore.expenses.length ? Math.max(...memoryStore.expenses.map(e => e.id)) + 1 : 1;
      const voucherNo = `SLV-EXP-${new Date().getFullYear()}-${String(newId + 100).slice(-3)}`;

      const expense = {
        id: newId,
        voucher_number: voucherNo,
        fund_code: data.fund_code || 'general',
        title: data.title,
        title_te: data.title_te || data.title,
        category: data.category || 'Maintenance',
        amount,
        expense_date: data.expense_date || new Date().toISOString().split('T')[0],
        paid_to: data.paid_to,
        approved_by: data.approved_by,
        bill_receipt_ref: data.bill_receipt_ref || null,
        remarks: data.remarks || null,
        created_at: new Date().toISOString()
      };

      memoryStore.expenses.push(expense);

      const fund = memoryStore.funds.find(f => f.fund_code === (data.fund_code || 'general'));
      if (fund) {
        fund.balance = Math.max(0, parseFloat(fund.balance || 0) - amount);
      }

      saveLocalStore();
      return expense;
    }
  },

  // OTHER INCOME / DONATIONS
  otherIncome: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM other_income ORDER BY id DESC');
        return rows;
      }
      return [...memoryStore.other_income].sort((a, b) => b.id - a.id);
    },
    async create(data) {
      const amount = parseFloat(data.amount);

      if (activeMode === 'mysql' && pool) {
        const [countRow] = await pool.query('SELECT COUNT(*) AS total FROM other_income');
        const nextNum = (countRow[0]?.total || 0) + 1;
        const receiptNo = `SLV-DON-${new Date().getFullYear()}-${String(nextNum + 100).slice(-3)}`;

        const [res] = await pool.query(
          `INSERT INTO other_income (receipt_number, fund_code, donor_name, donor_phone, amount, income_date, payment_mode, upi_ref, purpose, received_by, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            receiptNo,
            data.fund_code || 'festival',
            data.donor_name,
            data.donor_phone || null,
            amount,
            data.income_date || new Date().toISOString().split('T')[0],
            data.payment_mode || 'Cash',
            data.upi_ref || null,
            data.purpose || 'Special Festival Contribution',
            data.received_by || 'Treasurer',
            data.remarks || null
          ]
        );
        await pool.query('UPDATE funds SET balance = balance + ? WHERE fund_code = ?', [amount, data.fund_code || 'festival']);
        return { id: res.insertId, receipt_number: receiptNo, ...data };
      }

      const newId = memoryStore.other_income.length ? Math.max(...memoryStore.other_income.map(i => i.id)) + 1 : 1;
      const receiptNo = `SLV-DON-${new Date().getFullYear()}-${String(newId + 100).slice(-3)}`;

      const income = {
        id: newId,
        receipt_number: receiptNo,
        fund_code: data.fund_code || 'festival',
        donor_name: data.donor_name,
        donor_phone: data.donor_phone || null,
        amount,
        income_date: data.income_date || new Date().toISOString().split('T')[0],
        payment_mode: data.payment_mode || 'Cash',
        upi_ref: data.upi_ref || null,
        purpose: data.purpose || 'Special Festival Contribution',
        received_by: data.received_by || 'Treasurer',
        remarks: data.remarks || null,
        created_at: new Date().toISOString()
      };

      memoryStore.other_income.push(income);

      const fund = memoryStore.funds.find(f => f.fund_code === (data.fund_code || 'festival'));
      if (fund) {
        fund.balance = parseFloat(fund.balance || 0) + amount;
      }

      saveLocalStore();
      return income;
    }
  },

  // MEETINGS & ATTENDANCE
  meetings: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [meetings] = await pool.query('SELECT * FROM meetings ORDER BY meeting_date DESC');
        const [attendance] = await pool.query('SELECT meeting_id, status FROM meeting_attendance');
        const [memberCount] = await pool.query("SELECT COUNT(*) AS total FROM members WHERE status = 'active'");

        return meetings.map(meeting => {
          const att = attendance.filter(a => a.meeting_id === meeting.id);
          return {
            ...meeting,
            attendanceStats: {
              present: att.filter(a => a.status === 'Present').length,
              absent: att.filter(a => a.status === 'Absent').length,
              total: memberCount[0]?.total || 8
            }
          };
        });
      }
      return memoryStore.meetings.map(meeting => {
        const attendance = memoryStore.meeting_attendance.filter(a => a.meeting_id === meeting.id);
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        const absentCount = attendance.filter(a => a.status === 'Absent').length;
        const totalCount = memoryStore.members.filter(m => m.status === 'active').length;
        return {
          ...meeting,
          attendanceStats: { present: presentCount, absent: absentCount, total: totalCount }
        };
      }).sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date));
    },
    async getById(id) {
      const numId = parseInt(id, 10);
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [numId]);
        if (rows.length === 0) return null;
        const meeting = rows[0];

        const [members] = await pool.query('SELECT * FROM members ORDER BY id ASC');
        const [attRows] = await pool.query('SELECT * FROM meeting_attendance WHERE meeting_id = ?', [numId]);

        const attendance = members.map(m => {
          const att = attRows.find(a => a.member_id === m.id);
          return {
            member_id: m.id,
            member_code: m.member_code,
            full_name: m.full_name,
            full_name_te: m.full_name_te,
            designation: m.designation,
            phone: m.phone,
            status: att ? att.status : 'Absent',
            notes: att ? att.notes : ''
          };
        });

        return { ...meeting, attendance };
      }

      const meeting = memoryStore.meetings.find(m => m.id === numId);
      if (!meeting) return null;
      const attendance = memoryStore.members.map(member => {
        const att = memoryStore.meeting_attendance.find(a => a.meeting_id === numId && a.member_id === member.id);
        return {
          member_id: member.id,
          member_code: member.member_code,
          full_name: member.full_name,
          full_name_te: member.full_name_te,
          designation: member.designation,
          phone: member.phone,
          status: att ? att.status : 'Absent',
          notes: att ? att.notes : ''
        };
      });
      return { ...meeting, attendance };
    },
    async create(data) {
      if (activeMode === 'mysql' && pool) {
        const [res] = await pool.query(
          `INSERT INTO meetings (title, title_te, meeting_date, meeting_time, venue, venue_te, agenda, agenda_te, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.title,
            data.title_te || data.title,
            data.meeting_date,
            data.meeting_time || '19:30:00',
            data.venue || 'Sri Lambodara Vinayaka Temple Hall',
            data.venue_te || 'శ్రీ లంబోదర వినాయక ఆలయ ప్రాంగణం',
            data.agenda || '',
            data.agenda_te || data.agenda || '',
            data.status || 'Scheduled'
          ]
        );
        return { id: res.insertId, ...data };
      }

      const newId = memoryStore.meetings.length ? Math.max(...memoryStore.meetings.map(m => m.id)) + 1 : 1;
      const meeting = {
        id: newId,
        title: data.title,
        title_te: data.title_te || data.title,
        meeting_date: data.meeting_date,
        meeting_time: data.meeting_time || '19:30:00',
        venue: data.venue || 'Sri Lambodara Vinayaka Temple Hall',
        venue_te: data.venue_te || 'శ్రీ లంబోదర వినాయక ఆలయ ప్రాంగణం',
        agenda: data.agenda || '',
        agenda_te: data.agenda_te || data.agenda || '',
        minutes: data.minutes || null,
        minutes_te: data.minutes_te || null,
        decisions: data.decisions || null,
        status: data.status || 'Scheduled',
        created_at: new Date().toISOString()
      };
      memoryStore.meetings.push(meeting);
      saveLocalStore();
      return meeting;
    },
    async update(id, data) {
      const numId = parseInt(id, 10);
      if (activeMode === 'mysql' && pool) {
        await pool.query(
          `UPDATE meetings SET minutes = ?, minutes_te = ?, decisions = ?, status = ? WHERE id = ?`,
          [data.minutes, data.minutes_te, data.decisions, data.status || 'Completed', numId]
        );
        return this.getById(numId);
      }
      const idx = memoryStore.meetings.findIndex(m => m.id === numId);
      if (idx === -1) return null;
      memoryStore.meetings[idx] = { ...memoryStore.meetings[idx], ...data, updated_at: new Date().toISOString() };
      saveLocalStore();
      return memoryStore.meetings[idx];
    },
    async updateAttendance(meetingId, records) {
      const numMeetingId = parseInt(meetingId, 10);
      if (activeMode === 'mysql' && pool) {
        await pool.query('DELETE FROM meeting_attendance WHERE meeting_id = ?', [numMeetingId]);
        for (const rec of records) {
          await pool.query(
            `INSERT INTO meeting_attendance (meeting_id, member_id, status, notes)
             VALUES (?, ?, ?, ?)`,
            [numMeetingId, rec.member_id, rec.status || 'Absent', rec.notes || '']
          );
        }
        return true;
      }
      memoryStore.meeting_attendance = memoryStore.meeting_attendance.filter(a => a.meeting_id !== numMeetingId);
      for (const rec of records) {
        const newId = memoryStore.meeting_attendance.length ? Math.max(...memoryStore.meeting_attendance.map(a => a.id)) + 1 : 1;
        memoryStore.meeting_attendance.push({
          id: newId,
          meeting_id: numMeetingId,
          member_id: parseInt(rec.member_id, 10),
          status: rec.status || 'Absent',
          notes: rec.notes || ''
        });
      }
      saveLocalStore();
      return true;
    }
  },

  // FUNDS
  funds: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM funds ORDER BY id ASC');
        return rows;
      }
      return [...memoryStore.funds];
    }
  },

  // ANNOUNCEMENTS
  announcements: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM announcements ORDER BY id DESC');
        return rows;
      }
      return [...memoryStore.announcements].sort((a, b) => b.id - a.id);
    },
    async create(data) {
      if (activeMode === 'mysql' && pool) {
        const [res] = await pool.query(
          `INSERT INTO announcements (title, title_te, message, message_te, category, priority, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            data.title,
            data.title_te || data.title,
            data.message,
            data.message_te || data.message,
            data.category || 'General',
            data.priority || 'Normal',
            data.is_active !== undefined ? data.is_active : true
          ]
        );
        return { id: res.insertId, ...data };
      }
      const newId = memoryStore.announcements.length ? Math.max(...memoryStore.announcements.map(a => a.id)) + 1 : 1;
      const ann = {
        id: newId,
        title: data.title,
        title_te: data.title_te || data.title,
        message: data.message,
        message_te: data.message_te || data.message,
        category: data.category || 'General',
        priority: data.priority || 'Normal',
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_at: new Date().toISOString()
      };
      memoryStore.announcements.push(ann);
      saveLocalStore();
      return ann;
    }
  },

  // DOCUMENTS
  documents: {
    async getAll() {
      if (activeMode === 'mysql' && pool) {
        const [rows] = await pool.query('SELECT * FROM documents ORDER BY id DESC');
        return rows;
      }
      return [...memoryStore.documents].sort((a, b) => b.id - a.id);
    }
  },

  // SUMMARY STATS
  async getStats() {
    const members = await db.members.getAll();
    const activeCount = members.filter(m => m.status === 'active').length;
    const funds = await db.funds.getAll();
    const payments = await db.payments.getAll();
    const expenses = await db.expenses.getAll();
    const donations = await db.otherIncome.getAll();
    const currentMonth = 10;
    const currentYear = 2026;
    const currentDues = await db.dues.getAll({ month: currentMonth, year: currentYear });

    const totalDuesAmount = currentDues.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const collectedDuesAmount = currentDues.reduce((sum, d) => sum + parseFloat(d.paid_amount || 0), 0);
    const pendingDuesAmount = Math.max(0, totalDuesAmount - collectedDuesAmount);

    const totalGeneralFund = funds.find(f => f.fund_code === 'general')?.balance || 0;
    const totalFestivalFund = funds.find(f => f.fund_code === 'festival')?.balance || 0;

    return {
      membersCount: members.length,
      activeMembersCount: activeCount,
      generalFundBalance: parseFloat(totalGeneralFund),
      festivalFundBalance: parseFloat(totalFestivalFund),
      totalReserves: parseFloat(totalGeneralFund) + parseFloat(totalFestivalFund),
      currentMonthDues: {
        total: totalDuesAmount,
        collected: collectedDuesAmount,
        pending: pendingDuesAmount,
        collectionPercentage: totalDuesAmount > 0 ? Math.round((collectedDuesAmount / totalDuesAmount) * 100) : 0
      },
      recentPaymentsCount: payments.length,
      recentExpensesCount: expenses.length,
      recentDonationsCount: donations.length,
      dbMode: activeMode
    };
  }
};

module.exports = db;
