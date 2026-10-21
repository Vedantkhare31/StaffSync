# StaffSync: Enterprise Human Resource Management Solution

StaffSync is an operational, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** platform designed for organizational workforce operations. It provides strict role segregation with three distinct operational gateways and interfaces for **HR Personnel, Department Managers, and Employees**.

---

## 1. Directory Structure

The project is structured into three dedicated folders:

```text
D:\staffsync\Code
├── frontend/                   # React.js User Interface (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, ProtectedRoute, Modal
│   │   ├── context/            # AuthContext (JWT session state & axios interceptor)
│   │   ├── pages/
│   │   │   ├── PortalSelector.jsx     # Access Gateway Selector
│   │   │   ├── RoleLoginPage.jsx      # Dedicated Login for HR / Manager / Employee
│   │   │   ├── hr/                    # HR Administration Pages (6 modules)
│   │   │   ├── manager/               # Manager Operations Pages (5 modules)
│   │   │   └── employee/              # Employee Self-Service Pages (6 modules)
│   │   ├── App.jsx                    # Segregated role routes
│   │   └── index.css                  # Clean enterprise stylesheet
│   └── vite.config.js                 # Proxy to API on port 5000
│
├── backend/                    # Node.js + Express (Strict MVC Architecture)
│   ├── config/db.js            # MongoDB Mongoose connection
│   ├── controllers/            # Auth, Employee, Leave, Attendance, Announcement, Training
│   ├── middleware/             # verifyToken & requireRole authorization
│   ├── models/                 # User, Employee, LeaveRequest, Attendance, Announcement, TrainingProgram
│   ├── routes/                 # Express REST endpoints
│   ├── seed.js                 # Database seeder runner
│   ├── server.js               # Express application entry point
│   └── .env                    # PORT=5000, MONGO_URI, JWT_SECRET
│
├── database/                   # Database Schemas & Seeding Utilities
│   ├── schema_definition.md    # Complete MongoDB Schemas, Relationships, and Field Types
│   └── seed.js                 # Database seeder with pre-configured accounts
│
├── package.json                # Single-command runner for frontend + backend
└── README.md                   # Full documentation and API reference
```

---

## 2. Segregated Role Portals and Logins

StaffSync separates access so each role accesses a tailored interface with strict server-side credential verification:

| Portal | Dedicated Login Route | Default Test Account | Password | Role-Specific Scope |
|---|---|---|---|---|
| **HR Administration** | `/login/hr` | `hr@staffsync.com` | `password123` | Employee CRUD directory, organization-wide leave review, attendance ledger, company bulletins |
| **Manager Operations** | `/login/manager` | `manager@staffsync.com` | `password123` | Department team directory, team leave review, training program creation & assignments |
| **Employee Self-Service** | `/login/employee` | `employee@staffsync.com` | `password123` | Daily clock in/out shift punch terminal, personal leave applications, profile maintenance, assigned training |

> **Security Note:** If an employee attempts to log in via the HR Portal (`/login/hr`), the authentication service will block the attempt with a `403 Forbidden` message: *"Access denied. This account has the role EMPLOYEE and cannot log in through the HR Portal."*

---

## 3. Quick Start Guide

### Prerequisites
* **Node.js**: v16+ (tested on Node v24)
* **MongoDB**: Running locally at `mongodb://localhost:27017`

### Single-Command Start (Root)
From the root folder `D:\staffsync\Code`:

```bash
# Start both Backend (Port 5000) and Frontend (Port 3000) concurrently
npm run dev
```

Open your browser at: **`http://localhost:3000`**

---

### Starting Manually in Separate Terminals

#### Terminal 1: Backend Server
```bash
cd D:\staffsync\Code\backend
npm run dev
```
* Backend runs at: `http://localhost:5000`
* Database seeder: `npm run seed`

#### Terminal 2: Frontend Client
```bash
cd D:\staffsync\Code\frontend
npm run dev
```
* Frontend runs at: `http://localhost:3000`

#### Seeding Database from `database/`
```bash
cd D:\staffsync\Code
node database/seed.js
```
