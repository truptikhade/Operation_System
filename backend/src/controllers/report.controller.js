const { query } = require('../config/database');

// GET /api/reports
async function getAllReports(req, res, next) {
  try {
    const result = await query(`
      SELECT r.*, o.op_code, o.name AS operation_name, o.type AS operation_type,
        o.start_time, o.actual_end_time,
        sub.name AS submitted_by_name
      FROM reports r
      JOIN operations o ON r.operation_id = o.id
      LEFT JOIN officers sub ON r.submitted_by = sub.id
      ORDER BY r.submitted_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

// POST /api/reports
async function submitReport(req, res, next) {
  try {
    const {
      operation_id, outcome, arrests_made, incidents_count,
      officer_injuries, vehicles_checked, commanding_officer_remarks
    } = req.body;

    // Close the operation
    await query(
      `UPDATE operations SET status = 'closed', actual_end_time = NOW(), updated_at = NOW() WHERE id = $1`,
      [operation_id]
    );

    const result = await query(`
      INSERT INTO reports 
        (operation_id, outcome, arrests_made, incidents_count, officer_injuries, vehicles_checked, commanding_officer_remarks, submitted_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [operation_id, outcome, arrests_made || 0, incidents_count || 0,
        officer_injuries || 0, vehicles_checked || 0,
        commanding_officer_remarks, req.officer.id]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// GET /api/reports/:id
async function getReport(req, res, next) {
  try {
    const result = await query(`
      SELECT r.*, o.op_code, o.name AS operation_name, o.type, o.location, o.sector,
        o.start_time, o.actual_end_time,
        sub.name AS submitted_by_name, sub.rank AS submitted_by_rank,
        co.name AS commanding_officer_name
      FROM reports r
      JOIN operations o ON r.operation_id = o.id
      LEFT JOIN officers sub ON r.submitted_by = sub.id
      LEFT JOIN officers co ON o.commanding_officer_id = co.id
      WHERE r.id = $1
    `, [req.params.id]);

    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllReports, submitReport, getReport };
