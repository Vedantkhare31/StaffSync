const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['General', 'Policy', 'Urgent', 'Event', 'Holiday', 'Mail', 'Memo', 'Inquiry', 'Feedback'],
      default: 'General'
    },
    targetRole: {
      type: String,
      enum: ['all', 'employee', 'manager', 'hr'],
      default: 'all'
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);
