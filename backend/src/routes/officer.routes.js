// officer.routes.js
const router = require('express').Router();
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const { getAllOfficers, getOfficer, createOfficer, updateOfficerStatus, getStats } = require('../controllers/officer.controller');

router.use(authenticate);
router.get('/', getAllOfficers);
router.get('/stats/summary', getStats);
router.get('/:id', getOfficer);
router.post('/', authorize(ROLES.SENIOR_PLANNER), createOfficer);
router.patch('/:id/status', authorize(ROLES.SENIOR_PLANNER, ROLES.SUPERVISOR), updateOfficerStatus);

module.exports = router;
