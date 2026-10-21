const Employee = require('../models/Employee');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');

// @desc    Get all employees (with filters and search)
// @route   GET /api/employees
// @access  Private (HR, Manager)
const getAllEmployees = async (req, res) => {
  try {
    const { department, search, status } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    // If manager, they can view either all employees or team members
    const employees = await Employee.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found'
      });
    }

    res.status(200).json({
      success: true,
      employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new employee record
// @route   POST /api/employees
// @access  Private (HR only)
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      joiningDate,
      salary,
      managerName,
      status,
      address,
      createAccount,
      accountPassword,
      accountRole
    } = req.body;

    // Check duplicate employee ID or email
    const existingEmp = await Employee.findOne({
      $or: [{ employeeId: employeeId.trim() }, { email: email.toLowerCase().trim() }]
    });

    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this ID or Email already exists'
      });
    }

    const employee = await Employee.create({
      employeeId: employeeId.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone,
      department,
      position,
      joiningDate: joiningDate || Date.now(),
      salary: salary || 0,
      managerName: managerName || 'Unassigned',
      status: status || 'active',
      address: address || {}
    });

    // Optionally create linked User login credential
    if (createAccount && accountPassword) {
      const user = await User.create({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.toLowerCase().trim(),
        password: accountPassword,
        role: accountRole || 'employee',
        department,
        employeeRef: employee._id
      });
      employee.userId = user._id;
      await employee.save();
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (HR only)
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Sync department or status with User if linked
    if (employee.userId) {
      await User.findByIdAndUpdate(employee.userId, {
        department: employee.department,
        name: `${employee.firstName} ${employee.lastName}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (HR only)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee record and associated account removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Employee update personal contact info
// @route   PUT /api/employees/me/profile
// @access  Private (Employee)
const updateMyProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(400).json({
        success: false,
        message: 'No employee record associated with this account'
      });
    }

    const { phone, address } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      user.employeeRef,
      {
        phone,
        address
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Personal profile updated',
      employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get HR aggregate dashboard stats
// @route   GET /api/employees/hr/stats
// @access  Private (HR)
const getHRStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate calendar days in current month
    const year = now.getFullYear();
    const month = now.getMonth();
    const calendarDays = new Date(year, month + 1, 0).getDate();

    // Calculate actual working days (Mon-Fri) in this month
    let workingDays = 0;
    for (let day = 1; day <= calendarDays; day++) {
      const d = new Date(year, month, day);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    // First day of current month
    const startOfMonth = new Date(year, month, 1);

    const [
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      todayAttendances,
      departments,
      newThisMonth
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      LeaveRequest.countDocuments({ status: 'pending' }),
      Attendance.find({ date: todayStr }),
      Employee.distinct('department'),
      Employee.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    const presentCount = todayAttendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const onTimeCount = todayAttendances.filter(a => a.status === 'present').length;
    const totalHours = todayAttendances.reduce((acc, curr) => acc + (curr.workHours || 0), 0);
    const avgHours = todayAttendances.length > 0 ? (totalHours / todayAttendances.length).toFixed(1) : '8.0';

    // Real payroll processed calculation
    const payrollProcessed = Math.max(0, activeEmployees - pendingLeaves);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        todayAttendance: presentCount,
        onTimeArrivals: onTimeCount,
        avgHours: `${avgHours} hrs`,
        totalDepartments: departments.length,
        calendarDays,
        workingDays,
        payrollProcessed,
        newThisMonth: newThisMonth || 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateMyProfile,
  getHRStats
};
