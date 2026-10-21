const Announcement = require('../models/Announcement');

// @desc    Get announcements for active user
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const role = req.user.role;
    let query = {};

    if (role === 'employee') {
      // Employee sees notices targeted to all, employee, or mails/notes created by themselves
      query = {
        $or: [
          { targetRole: { $in: ['all', 'employee'] } },
          { createdBy: req.user._id }
        ]
      };
    } else if (role === 'manager') {
      // Manager sees notices for all, manager, employee, or mails sent to hr/manager, or created by themselves
      query = {
        $or: [
          { targetRole: { $in: ['all', 'manager', 'employee', 'hr'] } },
          { createdBy: req.user._id }
        ]
      };
    }
    // HR sees ALL announcements and employee mails across the entire organization (query = {})

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create announcement or mail message
// @route   POST /api/announcements
// @access  Private (All authenticated users: HR, Manager, Employee)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, targetRole, priority } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message content are required'
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      category: category || (req.user.role === 'employee' ? 'Mail' : 'General'),
      targetRole: targetRole || 'all',
      priority: priority || 'normal',
      createdBy: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role.toUpperCase()
    });

    res.status(201).json({
      success: true,
      message: 'Message / mail posted successfully to database',
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR or Author)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Only HR or author can delete
    if (req.user.role !== 'hr' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this announcement'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
