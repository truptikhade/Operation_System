const { query } = require('../config/database');
const { getRedis, KEYS } = require('../config/redis');

// GET /api/patrols/beats
async function getBeats(req, res, next) {
  try {
    const { sector } = req.query;
    let sql = 'SELECT * FROM patrol_beats WHERE 1=1';
    const params = [];
    if (sector) { sql += ' AND sector = $1'; params.push(sector); }
    sql += ' ORDER BY beat_code ASC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

// POST /api/patrols/checkin  — officer checks in from the field
async function checkIn(req, res, next) {
  try {
    const { operation_id, beat_id, vehicle_number, latitude, longitude, notes } = req.body;

    const result = await query(`
      INSERT INTO patrol_logs (operation_id, beat_id, officer_id, vehicle_number, latitude, longitude, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [operation_id, beat_id || null, req.officer.id, vehicle_number, latitude, longitude, notes]);

    // Cache officer's last known location in Redis (TTL 4h)
    const redis = getRedis();
    await redis.set(
      KEYS.officerLocation(req.officer.id),
      JSON.stringify({ latitude, longitude, beat_id, checked_in_at: new Date().toISOString() }),
      'EX', 14400
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// GET /api/patrols/officers/locations  — get all live officer locations from Redis
async function getLiveLocations(req, res, next) {
  try {
    const officerResult = await query(
      `SELECT id, name, badge_number, rank FROM officers WHERE status = 'on_duty'`
    );

    const redis = getRedis();
    const locations = await Promise.all(
      officerResult.rows.map(async (officer) => {
        const loc = await redis.get(KEYS.officerLocation(officer.id));
        return { ...officer, location: loc ? JSON.parse(loc) : null };
      })
    );

    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
}

// GET /api/patrols/logs/:operationId
async function getPatrolLogs(req, res, next) {
  try {
    const result = await query(`
      SELECT pl.*, o.name AS officer_name, o.badge_number, b.name AS beat_name, b.beat_code
      FROM patrol_logs pl
      JOIN officers o ON pl.officer_id = o.id
      LEFT JOIN patrol_beats b ON pl.beat_id = b.id
      WHERE pl.operation_id = $1
      ORDER BY pl.checked_in_at DESC
    `, [req.params.operationId]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

module.exports = { getBeats, checkIn, getLiveLocations, getPatrolLogs };
