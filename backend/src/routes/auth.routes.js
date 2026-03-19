const router = require('express').Router();
const { login, getMe, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  changePassword
);

module.exports = router;
