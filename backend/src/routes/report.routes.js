const router = require('express').Router();
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const { getAllReports, submitReport, getReport } = require('../controllers/report.controller');

router.use(authenticate);
router.get('/', getAllReports);
router.get('/:id', getReport);
router.post('/', authorize(ROLES.SENIOR_PLANNER, ROLES.SUPERVISOR), submitReport);

module.exports = router;
