const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateMyProfile,
  getHRStats
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/hr/stats', authorize('hr'), getHRStats);
router.put('/me/profile', updateMyProfile);

router.route('/')
  .get(authorize('hr', 'manager'), getAllEmployees)
  .post(authorize('hr'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(authorize('hr'), updateEmployee)
  .delete(authorize('hr'), deleteEmployee);

module.exports = router;
