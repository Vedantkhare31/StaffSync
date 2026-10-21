const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// @desc    Clock in for today
// @route   POST /api/attendance/clock-in
// @access  Private (Employee)
const clockIn = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found'
      });
    }

    const todayStr = getTodayString();
    const employee = await Employee.findById(user.employeeRef);

    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: todayStr
    });

    if (attendance && attendance.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in for today',
        attendance
      });
    }

    const now = new Date();
    // Check if late (e.g. after 9:30 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    if (!attendance) {
      attendance = new Attendance({
        employee: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        date: todayStr,
        clockIn: now,
        status: isLate ? 'late' : 'present'
      });
    } else {
      attendance.clockIn = now;
      attendance.status = isLate ? 'late' : 'present';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Clocked in successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clock out for today
// @route   POST /api/attendance/clock-out
// @access  Private (Employee)
const clockOut = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee profile found'
      });
    }

    const todayStr = getTodayString();
    const { workNotes } = req.body;

    const attendance = await Attendance.findOne({
      employee: user.employeeRef,
      date: todayStr
    });

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'You must clock in before you can clock out'
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out for today',
        attendance
      });
    }

    const now = new Date();
    attendance.clockOut = now;
    if (workNotes) {
      attendance.workNotes = workNotes;
    }

    const durationMs = now - new Date(attendance.clockIn);
    const durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
    attendance.workHours = durationHours;

    if (durationHours < 4 && attendance.status !== 'absent') {
      attendance.status = 'half-day';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get employee today attendance status
// @route   GET /api/attendance/today
// @access  Private (Employee)
const getTodayStatus = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(200).json({ success: true, attendance: null });
    }

    const todayStr = getTodayString();
    const attendance = await Attendance.findOne({
      employee: user.employeeRef,
      date: todayStr
    });

    res.status(200).json({
      success: true,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get logged in employee attendance history
// @route   GET /api/attendance/my
// @access  Private (Employee)
const getMyAttendance = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(200).json({ success: true, records: [] });
    }

    const records = await Attendance.find({ employee: user.employeeRef }).sort({ date: -1 }).limit(31);

    res.status(200).json({
      success: true,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all attendance records (HR / Manager view)
// @route   GET /api/attendance/all
// @access  Private (HR, Manager)
const getAllAttendance = async (req, res) => {
  try {
    const { date, department, status } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const records = await Attendance.find(query).sort({ date: -1, employeeName: 1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance
};
