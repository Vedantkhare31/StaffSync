const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee)
const applyLeave = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found'
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date'
      });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const employee = await Employee.findById(user.employeeRef);

    const leave = await LeaveRequest.create({
      employee: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get logged in employee's leave requests
// @route   GET /api/leaves/my
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(200).json({ success: true, leaves: [] });
    }

    const leaves = await LeaveRequest.find({ employee: user.employeeRef }).sort({ createdAt: -1 });

    const employee = await Employee.findById(user.employeeRef);

    res.status(200).json({
      success: true,
      leaveBalance: employee ? employee.leaveBalance : null,
      leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all company leave requests (HR)
// @route   GET /api/leaves/all
// @access  Private (HR)
const getAllLeaves = async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    const leaves = await LeaveRequest.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get team leave requests (Manager)
// @route   GET /api/leaves/team
// @access  Private (Manager)
const getTeamLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Manager can view leaves from their department (case-insensitive)
    if (req.user.department && req.user.department !== 'General') {
      query.department = new RegExp(`^${req.user.department.trim()}$`, 'i');
    }

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    const leaves = await LeaveRequest.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Review (Approve/Reject) leave request
// @route   PUT /api/leaves/:id/review
// @access  Private (HR or Manager)
const reviewLeave = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewerName = req.user.name;
    leave.reviewNotes = reviewNotes || '';
    leave.reviewedAt = Date.now();

    await leave.save();

    // If approved, optionally adjust employee's leave balance
    if (status === 'approved') {
      const employee = await Employee.findById(leave.employee);
      if (employee && employee.leaveBalance) {
        const type = leave.leaveType;
        if (employee.leaveBalance[type] !== undefined) {
          employee.leaveBalance[type] = Math.max(0, employee.leaveBalance[type] - leave.totalDays);
          await employee.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getTeamLeaves,
  reviewLeave
};
