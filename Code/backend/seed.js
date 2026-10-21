const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Employee = require('./models/Employee');
const LeaveRequest = require('./models/LeaveRequest');
const Attendance = require('./models/Attendance');
const Announcement = require('./models/Announcement');
const TrainingProgram = require('./models/TrainingProgram');

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/staffsync');
    console.log(`MongoDB Connected for Seeding: ${conn.connection.host}`);

    // Clean current database
    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      LeaveRequest.deleteMany(),
      Attendance.deleteMany(),
      Announcement.deleteMany(),
      TrainingProgram.deleteMany()
    ]);
    console.log('Cleared existing collections.');

    const defaultPassword = 'password123';

    // 1. Create Employees
    const empAlex = await Employee.create({
      employeeId: 'EMP-1001',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'employee@staffsync.com',
      phone: '+1 (555) 234-5678',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      joiningDate: new Date('2023-03-15'),
      salary: 95000,
      managerName: 'Marcus Sterling',
      status: 'active',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zip: '97477'
      },
      leaveBalance: { casual: 10, sick: 8, annual: 14 }
    });

    const empPriya = await Employee.create({
      employeeId: 'EMP-1002',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@staffsync.com',
      phone: '+1 (555) 345-6789',
      department: 'Engineering',
      position: 'Frontend Specialist',
      joiningDate: new Date('2023-08-01'),
      salary: 88000,
      managerName: 'Marcus Sterling',
      status: 'active',
      address: {
        street: '120 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      leaveBalance: { casual: 12, sick: 10, annual: 15 }
    });

    const empDaniel = await Employee.create({
      employeeId: 'EMP-1003',
      firstName: 'Daniel',
      lastName: 'Wu',
      email: 'daniel.wu@staffsync.com',
      phone: '+1 (555) 456-7890',
      department: 'Operations',
      position: 'Site Reliability Engineer',
      joiningDate: new Date('2022-11-10'),
      salary: 92000,
      managerName: 'Marcus Sterling',
      status: 'active',
      address: {
        street: '88 Tech Boulevard',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      },
      leaveBalance: { casual: 7, sick: 9, annual: 10 }
    });

    const empEleanor = await Employee.create({
      employeeId: 'EMP-1004',
      firstName: 'Eleanor',
      lastName: 'Vance',
      email: 'hr@staffsync.com',
      phone: '+1 (555) 123-4567',
      department: 'Human Resources',
      position: 'Director of People & Culture',
      joiningDate: new Date('2021-01-10'),
      salary: 110000,
      managerName: 'Executive Board',
      status: 'active',
      address: {
        street: '500 Fifth Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10110'
      },
      leaveBalance: { casual: 12, sick: 10, annual: 15 }
    });

    const empMarcus = await Employee.create({
      employeeId: 'EMP-1005',
      firstName: 'Marcus',
      lastName: 'Sterling',
      email: 'manager@staffsync.com',
      phone: '+1 (555) 987-6543',
      department: 'Engineering',
      position: 'Engineering Operations Manager',
      joiningDate: new Date('2022-04-18'),
      salary: 125000,
      managerName: 'VP of Technology',
      status: 'active',
      address: {
        street: '42 Wallaby Way',
        city: 'Seattle',
        state: 'WA',
        zip: '98101'
      },
      leaveBalance: { casual: 11, sick: 10, annual: 12 }
    });

    // 2. Create Users for each portal
    const hrUser = await User.create({
      name: 'Eleanor Vance',
      email: 'hr@staffsync.com',
      password: defaultPassword,
      role: 'hr',
      department: 'Human Resources',
      employeeRef: empEleanor._id
    });
    empEleanor.userId = hrUser._id;
    await empEleanor.save();

    const managerUser = await User.create({
      name: 'Marcus Sterling',
      email: 'manager@staffsync.com',
      password: defaultPassword,
      role: 'manager',
      department: 'Engineering',
      employeeRef: empMarcus._id
    });
    empMarcus.userId = managerUser._id;
    await empMarcus.save();

    const employeeUser = await User.create({
      name: 'Alex Rivera',
      email: 'employee@staffsync.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      employeeRef: empAlex._id
    });
    empAlex.userId = employeeUser._id;
    await empAlex.save();

    console.log('Created accounts: HR, Manager, and Employee.');

    // 3. Create Sample Leave Requests
    await LeaveRequest.create([
      {
        employee: empAlex._id,
        employeeName: 'Alex Rivera',
        department: 'Engineering',
        leaveType: 'casual',
        startDate: new Date('2026-11-02'),
        endDate: new Date('2026-11-04'),
        totalDays: 3,
        reason: 'Attending family wedding out of state.',
        status: 'pending'
      },
      {
        employee: empPriya._id,
        employeeName: 'Priya Sharma',
        department: 'Engineering',
        leaveType: 'sick',
        startDate: new Date('2026-10-14'),
        endDate: new Date('2026-10-15'),
        totalDays: 2,
        reason: 'Viral fever rest prescription.',
        status: 'approved',
        reviewedBy: managerUser._id,
        reviewerName: 'Marcus Sterling',
        reviewNotes: 'Approved. Get well soon.',
        reviewedAt: new Date('2026-10-14')
      },
      {
        employee: empDaniel._id,
        employeeName: 'Daniel Wu',
        department: 'Operations',
        leaveType: 'annual',
        startDate: new Date('2026-12-20'),
        endDate: new Date('2026-12-27'),
        totalDays: 8,
        reason: 'Annual family holiday break.',
        status: 'pending'
      }
    ]);

    // 4. Create Today Attendance
    const todayStr = new Date().toISOString().split('T')[0];
    const clockInAlex = new Date();
    clockInAlex.setHours(9, 15, 0, 0);

    const clockInPriya = new Date();
    clockInPriya.setHours(9, 45, 0, 0); // late

    const clockInMarcus = new Date();
    clockInMarcus.setHours(8, 55, 0, 0);

    await Attendance.create([
      {
        employee: empAlex._id,
        employeeName: 'Alex Rivera',
        department: 'Engineering',
        date: todayStr,
        clockIn: clockInAlex,
        clockOut: null,
        workHours: 0,
        status: 'present',
        workNotes: 'Working on API auth modules.'
      },
      {
        employee: empPriya._id,
        employeeName: 'Priya Sharma',
        department: 'Engineering',
        date: todayStr,
        clockIn: clockInPriya,
        clockOut: null,
        workHours: 0,
        status: 'late',
        workNotes: 'Traffic delay on transit.'
      },
      {
        employee: empMarcus._id,
        employeeName: 'Marcus Sterling',
        department: 'Engineering',
        date: todayStr,
        clockIn: clockInMarcus,
        clockOut: null,
        workHours: 0,
        status: 'present',
        workNotes: 'Sprint planning and 1-on-1 reviews.'
      }
    ]);

    // 5. Create Announcements
    await Announcement.create([
      {
        title: 'Q4 Performance Review Timeline and Guidelines',
        content: 'All self-evaluations must be submitted through the portal by November 15. Managers are requested to conduct one-on-one sessions prior to December 1.',
        category: 'Policy',
        targetRole: 'all',
        priority: 'high',
        createdBy: hrUser._id,
        authorName: 'Eleanor Vance',
        authorRole: 'HR'
      },
      {
        title: 'Engineering Architecture Sync scheduled for Thursday',
        content: 'We will be discussing database scaling and migration best practices. Please prepare any backlog questions.',
        category: 'Event',
        targetRole: 'employee',
        priority: 'normal',
        createdBy: managerUser._id,
        authorName: 'Marcus Sterling',
        authorRole: 'MANAGER'
      },
      {
        title: 'Office Holiday Schedule: Thanksgiving Observance',
        content: 'Offices will remain closed on November 26 and 27. Emergency on-call rotations have been published in the ops repository.',
        category: 'Holiday',
        targetRole: 'all',
        priority: 'normal',
        createdBy: hrUser._id,
        authorName: 'Eleanor Vance',
        authorRole: 'HR'
      }
    ]);

    // 6. Create Training Programs
    await TrainingProgram.create([
      {
        title: 'Production System Reliability and Incident Management',
        description: 'Comprehensive walkthrough of on-call protocols, alerting thresholds, and zero-downtime deployment pipelines.',
        department: 'Engineering',
        instructor: 'Marcus Sterling',
        startDate: new Date('2026-11-10'),
        endDate: new Date('2026-11-20'),
        status: 'scheduled',
        assignedEmployees: [empAlex._id, empPriya._id, empDaniel._id],
        createdBy: managerUser._id,
        creatorName: 'Marcus Sterling'
      },
      {
        title: 'Information Security & Data Protection Compliance 2026',
        description: 'Mandatory annual regulatory compliance session covering employee data safety, credential management, and privacy requirements.',
        department: 'General',
        instructor: 'Eleanor Vance',
        startDate: new Date('2026-10-25'),
        endDate: new Date('2026-10-28'),
        status: 'in-progress',
        assignedEmployees: [empAlex._id, empMarcus._id, empPriya._id],
        createdBy: hrUser._id,
        creatorName: 'Eleanor Vance'
      }
    ]);

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
