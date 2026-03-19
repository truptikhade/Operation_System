const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT * FROM officers WHERE email = $1',
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const officer = result.rows[0];
    const isMatch = await bcrypt.compare(password, officer.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: officer.id, role: officer.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const { password_hash, ...officerData } = officer;

    res.json({
      success: true,
      token,
      officer: officerData,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json({ success: true, officer: req.officer });
}

// POST /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await query('SELECT password_hash FROM officers WHERE id = $1', [req.officer.id]);
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE officers SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.officer.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, getMe, changePassword };
