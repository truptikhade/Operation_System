const router = require('express').Router();
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const { getBeats, checkIn, getLiveLocations, getPatrolLogs } = require('../controllers/patrol.controller');

router.use(authenticate);
router.get('/beats', getBeats);
router.get('/officers/locations', authorize(ROLES.SENIOR_PLANNER, ROLES.SUPERVISOR), getLiveLocations);
router.get('/logs/:operationId', getPatrolLogs);
router.post('/checkin', checkIn); // any officer can check in

module.exports = router;
