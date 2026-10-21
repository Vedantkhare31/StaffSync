const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations', 'Customer Support']
    },
    position: {
      type: String,
      required: [true, 'Position is required']
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    salary: {
      type: Number,
      default: 0
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    managerName: {
      type: String,
      default: 'Unassigned'
    },
    status: {
      type: String,
      enum: ['active', 'on-leave', 'inactive', 'terminated'],
      default: 'active'
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' }
    },
    avatar: {
      type: String,
      default: ''
    },
    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      annual: { type: Number, default: 15 }
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
