const router = require('express').Router();
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const { getAllAlerts, raiseAlert, resolveAlert } = require('../controllers/alert.controller');

router.use(authenticate);
router.get('/', getAllAlerts);
router.post('/', raiseAlert); // any officer can raise
router.patch('/:id/resolve', authorize(ROLES.SENIOR_PLANNER, ROLES.SUPERVISOR), resolveAlert);

module.exports = router;
