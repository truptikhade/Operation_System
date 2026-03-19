const { query } = require('../config/database');
const { getRedis, KEYS } = require('../config/redis');

// GET /api/alerts
async function getAllAlerts(req, res, next) {
  try {
    const { is_resolved, severity, sector } = req.query;
    let sql = `
      SELECT a.*, o.name AS raised_by_name, o.badge_number AS raised_by_badge,
        op.name AS operation_name
      FROM alerts a
      LEFT JOIN officers o ON a.raised_by = o.id
      LEFT JOIN operations op ON a.operation_id = op.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (is_resolved !== undefined) { sql += ` AND a.is_resolved = $${idx++}`; params.push(is_resolved === 'true'); }
    if (severity) { sql += ` AND a.severity = $${idx++}`; params.push(severity); }
    if (sector)   { sql += ` AND a.sector = $${idx++}`;   params.push(sector); }

    sql += ' ORDER BY a.created_at DESC LIMIT 50';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

// POST /api/alerts — any authenticated officer can raise an alert
async function raiseAlert(req, res, next) {
  try {
    const { title, description, severity, location, sector, operation_id } = req.body;

    const incidentCode = `INC-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const result = await query(`
      INSERT INTO alerts (incident_code, title, description, severity, location, sector, operation_id, raised_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [incidentCode, title, description, severity, location, sector, operation_id || null, req.officer.id]);

    const alert = result.rows[0];

    // Publish to Redis pub/sub so connected clients receive it instantly
    const redis = getRedis();
    await redis.publish(KEYS.alertChannel(), JSON.stringify({
      type: 'NEW_ALERT',
      alert,
      officer: { name: req.officer.name, badge: req.officer.badge_number },
    }));

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/alerts/:id/resolve
async function resolveAlert(req, res, next) {
  try {
    const result = await query(`
      UPDATE alerts 
      SET is_resolved = TRUE, resolved_by = $1, resolved_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [req.officer.id, req.params.id]);

    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Alert not found' });

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllAlerts, raiseAlert, resolveAlert };
