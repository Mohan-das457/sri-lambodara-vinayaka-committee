
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { getSeedData } = require('./data/seedData');
require('dotenv').config();

const storePath = path.join(__dirname, '../data/store.json');
const storeDir = path.dirname(storePath);

let pool = null;
let activeMode = 'local';
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
      memoryStore = JSON.parse(
        fs.readFileSync(storePath, 'utf8')
      );
      return memoryStore;
    } catch (err) {
      console.warn(
        '[Database] Could not parse store.json; initializing seed data.'
      );
    }
  }

  memoryStore = getSeedData();
  saveLocalStore();
  return memoryStore;
}

function saveLocalStore() {
  ensureStoreDir();
  fs.writeFileSync(
    storePath,
    JSON.stringify(memoryStore, null, 2),
    'utf8'
  );
}

async function initDb() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'temple_committee';

  const isRemote =
    !['localhost', '127.0.0.1'].includes(host);

  let sslConfig;

  if (isRemote) {
    const caPath = path.join(
      __dirname,
      '..',
      'certs',
      'ca.pem'
    );

    if (!fs.existsSync(caPath)) {
      throw new Error(
        `Aiven CA certificate not found at ${caPath}`
      );
    }

    sslConfig = {
      ca: fs.readFileSync(caPath, 'utf8'),
      rejectUnauthorized: true
    };
  }

  const connectionOptions = {
    host,
    port,
    user,
    password,
    ...(sslConfig ? { ssl: sslConfig } : {}),
    connectTimeout: 10000
  };

  try {
    // Connect to the configured database server.
    // Do not use DATABASE_URL here: this configuration
    // consistently uses the DB_HOST/DB_PORT/DB_USER variables.
    const connection = await mysql.createConnection(
      connectionOptions
    );

    try {
      if (!/^[a-zA-Z0-9_]+$/.test(database)) {
        throw new Error('Invalid DB_NAME configuration');
      }

      try {
        await connection.query(
          `CREATE DATABASE IF NOT EXISTS \`${database}\`
           CHARACTER SET utf8mb4
           COLLATE utf8mb4_unicode_ci`
        );
      } catch (err) {
        // Cloud database users may not have permission to
        // create databases. The database must already exist.
        if (err.code !== 'ER_DBACCESS_DENIED_ERROR' &&
            err.code !== 'ER_ACCESS_DENIED_ERROR' &&
            err.code !== 'ER_DBACCESS_DENIED_ERROR') {
          // Continue to the selected database connection below.
          console.warn(
            '[Database] Could not create database; checking whether it exists.'
          );
        }
      }
    } finally {
      await connection.end();
    }

    pool = mysql.createPool({
      ...connectionOptions,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.query('SELECT 1');

    activeMode = 'mysql';

    console.log(
      `[Database] Connected to MySQL database "${database}" on ${host}:${port}`
    );

    await setupMysqlTables();
  } catch (err) {
    if (pool) {
      try {
        await pool.end();
      } catch (_) {
        // Ignore cleanup errors.
      }
      pool = null;
    }

    activeMode = 'local';

    console.error(
      '[Database] MySQL connection failed:',
      err.message
    );

    // Production must not silently save committee data
    // to an ephemeral local JSON file.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'MySQL connection failed in production. ' +
        'Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, ' +
        'DB_NAME and the Aiven CA certificate.'
      );
    }

    // Local fallback is only available during development.
    console.warn(
      '[Database] Using local JSON storage for development only.'
    );
    loadLocalStore();
  }
}

async function setupMysqlTables() {
  const schemaPath = path.join(
    __dirname,
    'data',
    'schema.sql'
  );

  if (!fs.existsSync(schemaPath)) {
    throw new Error(
      `MySQL schema file not found: ${schemaPath}`
    );
  }

  const [tables] = await pool.query(
    "SHOW TABLES LIKE 'members'"
  );

  if (tables.length > 0) {
    console.log('[Database] Tables already exist.');
    return;
  }

  console.log('[Database] Applying initial SQL schema...');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const statements = schemaSql
    .replace(/--.*$/gm, '')
    .split(';')
    .map(sql => sql.trim())
    .filter(sql =>
      sql.length > 0 &&
      !sql.toUpperCase().startsWith('CREATE DATABASE') &&
      !sql.toUpperCase().startsWith('USE ')
    );

  for (const sql of statements) {
    // Fail immediately if any table cannot be created.
    // Silently ignoring schema errors can leave the app broken.
    await pool.query(sql);
  }

  const [verifyTables] = await pool.query(
    "SHOW TABLES LIKE 'members'"
  );

  if (verifyTables.length === 0) {
    throw new Error(
      'Schema setup finished, but the members table is missing.'
    );
  }

  console.log('[Database] SQL schema applied successfully.');
}
