const TrainingProgram = require('../models/TrainingProgram');

// @desc    Get all training programs (HR, Manager)
// @route   GET /api/training
// @access  Private (HR, Manager)
const getAllTrainings = async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    const trainings = await TrainingProgram.find(query)
      .populate('assignedEmployees', 'firstName lastName employeeId department email')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get training programs assigned to logged in employee
// @route   GET /api/training/my
// @access  Private (Employee)
const getMyTrainings = async (req, res) => {
  try {
    const user = req.user;
    if (!user.employeeRef) {
      return res.status(200).json({ success: true, trainings: [] });
    }

    const trainings = await TrainingProgram.find({
      assignedEmployees: user.employeeRef
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new training program
// @route   POST /api/training
// @access  Private (Manager, HR)
const createTraining = async (req, res) => {
  try {
    const { title, description, department, instructor, startDate, endDate, assignedEmployees } = req.body;

    if (!title || !description || !department || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const training = await TrainingProgram.create({
      title: title.trim(),
      description: description.trim(),
      department,
      instructor: instructor || req.user.name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      assignedEmployees: assignedEmployees || [],
      createdBy: req.user._id,
      creatorName: req.user.name
    });

    res.status(201).json({
      success: true,
      message: 'Training program scheduled successfully',
      training
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update training program
// @route   PUT /api/training/:id
// @access  Private (Manager, HR)
const updateTraining = async (req, res) => {
  try {
    const training = await TrainingProgram.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedEmployees', 'firstName lastName employeeId department email');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Training program updated',
      training
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete training program
// @route   DELETE /api/training/:id
// @access  Private (Manager, HR)
const deleteTraining = async (req, res) => {
  try {
    const training = await TrainingProgram.findByIdAndDelete(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Training program removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllTrainings,
  getMyTrainings,
  createTraining,
  updateTraining,
  deleteTraining
};
