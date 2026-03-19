const { query } = require('../config/database');
const { getRedis, KEYS } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

// GET /api/operations
async function getAllOperations(req, res, next) {
  try {
    const { status, type, sector, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT o.*, 
        co.name AS commanding_officer_name, co.rank AS commanding_officer_rank,
        COUNT(a.id) AS assigned_officers
      FROM operations o
      LEFT JOIN officers co ON o.commanding_officer_id = co.id
      LEFT JOIN assignments a ON o.id = a.operation_id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (status) { sql += ` AND o.status = $${paramIdx++}`; params.push(status); }
    if (type)   { sql += ` AND o.type = $${paramIdx++}`;   params.push(type); }
    if (sector) { sql += ` AND o.sector = $${paramIdx++}`; params.push(sector); }

    // Field officers only see their assigned ops
    if (req.officer.role === 'field_officer') {
      sql += ` AND o.id IN (SELECT operation_id FROM assignments WHERE officer_id = $${paramIdx++})`;
      params.push(req.officer.id);
    }

    sql += ` GROUP BY o.id, co.name, co.rank ORDER BY o.created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query('SELECT COUNT(*) FROM operations WHERE 1=1', []);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: +page, limit: +limit, total: +countResult.rows[0].count },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/operations/:id
async function getOperation(req, res, next) {
  try {
    const result = await query(`
      SELECT o.*, 
        co.name AS commanding_officer_name,
        json_agg(json_build_object(
          'id', off.id, 'name', off.name, 'rank', off.rank, 
          'badge_number', off.badge_number, 'shift', a.shift
        )) FILTER (WHERE off.id IS NOT NULL) AS officers
      FROM operations o
      LEFT JOIN officers co ON o.commanding_officer_id = co.id
      LEFT JOIN assignments a ON o.id = a.operation_id
      LEFT JOIN officers off ON a.officer_id = off.id
      WHERE o.id = $1
      GROUP BY o.id, co.name
    `, [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Operation not found' });
    }

    // Enrich with Redis real-time status
    const redis = getRedis();
    const rtStatus = await redis.get(KEYS.opStatus(req.params.id));

    res.json({
      success: true,
      data: { ...result.rows[0], rt_status: rtStatus },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/operations
async function createOperation(req, res, next) {
  try {
    const {
      name, type, priority, location, sector, zone, brief,
      start_time, end_time, officers_required, vehicles_required,
      radio_channel, commanding_officer_id, shifts
    } = req.body;

    const opCode = `OP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const result = await query(`
      INSERT INTO operations 
        (op_code, name, type, priority, location, sector, zone, brief, 
         start_time, end_time, officers_required, vehicles_required, 
         radio_channel, commanding_officer_id, created_by, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'draft')
      RETURNING *
    `, [opCode, name, type, priority, location, sector, zone, brief,
        start_time, end_time, officers_required, vehicles_required,
        radio_channel, commanding_officer_id, req.officer.id]);

    const operation = result.rows[0];

    // Cache in Redis
    const redis = getRedis();
    await redis.set(KEYS.opStatus(operation.id), 'draft', 'EX', 86400);

    res.status(201).json({ success: true, data: operation });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/operations/:id/status
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validTransitions = {
      draft: ['pending', 'cancelled'],
      pending: ['active', 'cancelled'],
      active: ['closed', 'cancelled'],
    };

    const current = await query('SELECT status FROM operations WHERE id = $1', [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ success: false, message: 'Operation not found' });

    const currentStatus = current.rows[0].status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${currentStatus} to ${status}`
      });
    }

    const extra = status === 'closed' ? ', actual_end_time = NOW()' : '';
    const result = await query(
      `UPDATE operations SET status = $1${extra}, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    // Update Redis
    const redis = getRedis();
    await redis.set(KEYS.opStatus(req.params.id), status, 'EX', 86400);
    if (status === 'active') await redis.sadd(KEYS.activeOps(), req.params.id);
    if (['closed', 'cancelled'].includes(status)) await redis.srem(KEYS.activeOps(), req.params.id);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// POST /api/operations/:id/assign
async function assignOfficers(req, res, next) {
  try {
    const { officer_ids, shift } = req.body;
    const { id } = req.params;

    const insertPromises = officer_ids.map(officerId =>
      query(
        `INSERT INTO assignments (operation_id, officer_id, shift, assigned_by)
         VALUES ($1, $2, $3, $4) ON CONFLICT (operation_id, officer_id) DO NOTHING`,
        [id, officerId, shift, req.officer.id]
      )
    );

    await Promise.all(insertPromises);

    // Update officer status to on_duty
    await query(
      `UPDATE officers SET status = 'on_duty', updated_at = NOW() WHERE id = ANY($1::uuid[])`,
      [officer_ids]
    );

    res.json({ success: true, message: `${officer_ids.length} officers assigned` });
  } catch (error) {
    next(error);
  }
}

// GET /api/operations/active/count
async function getActiveCount(req, res, next) {
  try {
    const redis = getRedis();
    const count = await redis.scard(KEYS.activeOps());
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllOperations, getOperation, createOperation, updateStatus, assignOfficers, getActiveCount };
