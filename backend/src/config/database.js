const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'polops_db',
  user: process.env.DB_USER || 'polops_user',
  password: process.env.DB_PASSWORD || 'polops_pass',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function connectDB() {
  try {
    const client = await pool.connect();
    logger.info('PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error.message);
    throw error;
  }
}

// Helper: run a query
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('Query executed', { text, duration, rows: res.rowCount });
  return res;
}

module.exports = { pool, connectDB, query };
