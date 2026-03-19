const router = require('express').Router();
const { authenticate, authorize, ROLES } = require('../middleware/auth.middleware');
const {
  getAllOperations, getOperation, createOperation,
  updateStatus, assignOfficers, getActiveCount
} = require('../controllers/operation.controller');

// All routes require authentication
router.use(authenticate);

router.get('/', getAllOperations);
router.get('/active/count', getActiveCount);
router.get('/:id', getOperation);

// Only planners can create/modify
router.post('/', authorize(ROLES.SENIOR_PLANNER), createOperation);
router.patch('/:id/status', authorize(ROLES.SENIOR_PLANNER, ROLES.SUPERVISOR), updateStatus);
router.post('/:id/assign', authorize(ROLES.SENIOR_PLANNER), assignOfficers);

module.exports = router;
