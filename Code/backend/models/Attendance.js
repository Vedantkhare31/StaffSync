const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    employeeName: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true
    },
    clockIn: {
      type: Date,
      default: null
    },
    clockOut: {
      type: Date,
      default: null
    },
    workHours: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'late'],
      default: 'present'
    },
    workNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Ensure one attendance document per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
