const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getMyTrainings,
  createTraining,
  updateTraining,
  deleteTraining
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('hr', 'manager'), getAllTrainings)
  .post(authorize('hr', 'manager'), createTraining);

router.get('/my', getMyTrainings);

router.route('/:id')
  .put(authorize('hr', 'manager'), updateTraining)
  .delete(authorize('hr', 'manager'), deleteTraining);

module.exports = router;
