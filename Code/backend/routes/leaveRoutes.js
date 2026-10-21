const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getTeamLeaves,
  reviewLeave
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/all', authorize('hr'), getAllLeaves);
router.get('/team', authorize('manager', 'hr'), getTeamLeaves);
router.put('/:id/review', authorize('hr', 'manager'), reviewLeave);

module.exports = router;
