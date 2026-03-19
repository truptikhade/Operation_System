const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch officer from DB
    const result = await query(
      'SELECT id, badge_number, name, rank, role, sector, status FROM officers WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Officer not found' });
    }

    req.officer = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// Role-based access control factory
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.officer.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
}

// Roles constants
const ROLES = {
  SENIOR_PLANNER: 'senior_planner',
  FIELD_OFFICER: 'field_officer',
  SUPERVISOR: 'supervisor',
};

module.exports = { authenticate, authorize, ROLES };
