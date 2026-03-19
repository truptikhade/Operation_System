const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// GET /api/officers
async function getAllOfficers(req, res, next) {
  try {
    const { status, sector, role } = req.query;
    let sql = `SELECT id, badge_number, name, rank, role, sector, phone, email, status, created_at FROM officers WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) { sql += ` AND status = $${idx++}`; params.push(status); }
    if (sector) { sql += ` AND sector = $${idx++}`; params.push(sector); }
    if (role)   { sql += ` AND role = $${idx++}`;   params.push(role); }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

// GET /api/officers/:id
async function getOfficer(req, res, next) {
  try {
    const result = await query(
      `SELECT id, badge_number, name, rank, role, sector, phone, email, status, created_at 
       FROM officers WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Officer not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// POST /api/officers
async function createOfficer(req, res, next) {
  try {
    const { badge_number, name, rank, role, sector, phone, email, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(`
      INSERT INTO officers (badge_number, name, rank, role, sector, phone, email, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, badge_number, name, rank, role, sector, phone, email, status, created_at
    `, [badge_number, name, rank, role, sector, phone, email, password_hash]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/officers/:id/status
async function updateOfficerStatus(req, res, next) {
  try {
    const { status } = req.body;
    const result = await query(
      `UPDATE officers SET status = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, badge_number, name, rank, status`,
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Officer not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// GET /api/officers/stats/summary
async function getStats(req, res, next) {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'on_duty') AS on_duty,
        COUNT(*) FILTER (WHERE status = 'available') AS available,
        COUNT(*) FILTER (WHERE status = 'on_leave') AS on_leave,
        COUNT(*) FILTER (WHERE status = 'sick') AS sick,
        COUNT(*) AS total
      FROM officers
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllOfficers, getOfficer, createOfficer, updateOfficerStatus, getStats };
