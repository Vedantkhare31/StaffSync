const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'staffsync_enterprise_secret_key_2026_secure', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Login user with strict role and credential match
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const selectedRole = role ? role.toLowerCase().trim() : null;

    // Strict search by email AND selected role
    const query = { email: cleanEmail };
    if (selectedRole) {
      query.role = selectedRole;
    }

    const user = await User.findOne(query).select('+password').populate('employeeRef');

    // If account doesn't exist under this role
    if (!user) {
      return res.status(404).json({
        success: false,
        message: selectedRole
          ? `User does not exist here as ${selectedRole.toUpperCase()}. Please check your role or create an account.`
          : 'Account does not exist. Please create an account first.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR administration.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar || '',
        employeeRef: user.employeeRef
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register new account
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role ? role.toLowerCase().trim() : 'employee';

    // Verify if already exists with same email and role
    const existingUser = await User.findOne({ email: cleanEmail, role: assignedRole });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account already exists as ${assignedRole.toUpperCase()} with this email. Please sign in.`
      });
    }

    const assignedDept = department || (assignedRole === 'hr' ? 'Human Resources' : 'Engineering');

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || assignedRole.toUpperCase();

    // Generate unique employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP-${1000 + count + 1}`;

    // Create Employee record in real time in database
    const newEmployee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email: cleanEmail,
      department: assignedDept,
      position: assignedRole === 'hr' ? 'HR Specialist' : assignedRole === 'manager' ? 'Department Lead' : 'Associate Specialist',
      salary: assignedRole === 'hr' ? 85000 : assignedRole === 'manager' ? 105000 : 70000,
      managerName: assignedRole === 'manager' ? 'Executive Board' : 'Marcus Sterling',
      status: 'active',
      leaveBalance: { casual: 12, sick: 10, annual: 15 }
    });

    // Create User record in real time
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      department: assignedDept,
      employeeRef: newEmployee._id,
      avatar: ''
    });

    newEmployee.userId = user._id;
    await newEmployee.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully in database.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar || '',
        employeeRef: newEmployee
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email, role, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const query = { email: cleanEmail };
    if (role) {
      query.role = role.toLowerCase().trim();
    }

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: role
          ? `User does not exist here as ${role.toUpperCase()}. Please check your role or register first.`
          : 'Account does not exist with this email address. Please create an account.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('employeeRef');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update profile and avatar photo
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar, department } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (department) user.department = department;

    await user.save();

    if (user.employeeRef) {
      const empUpdate = {};
      if (name) {
        const parts = name.trim().split(' ');
        empUpdate.firstName = parts[0] || '';
        empUpdate.lastName = parts.slice(1).join(' ') || '';
      }
      if (avatar !== undefined) empUpdate.avatar = avatar;
      if (phone !== undefined) empUpdate.phone = phone;
      if (address !== undefined) empUpdate.address = address;
      if (department) empUpdate.department = department;

      await Employee.findByIdAndUpdate(user.employeeRef, empUpdate);
    }

    const updatedUser = await User.findById(user._id).populate('employeeRef');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  getMe,
  updateProfile
};
