# StaffSync: Modern Human Resource Management Solution

StaffSync is an enterprise-grade, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** platform designed to streamline and automate organizational workforce operations. It provides distinct, segregated operational gateways and interfaces for **HR Personnel, Department Managers, and Employees**.

---

## 🗂️ Repository Directory Structure

```text
StaffSync/
├── 📁 Code/                     # Full-Stack Application Source Code
│   ├── frontend/               # React.js (Vite) Client Application
│   │   ├── public/             # Brand logos & static assets
│   │   ├── src/                # UI Components, Role Dashboards, Context
│   │   └── package.json
│   ├── backend/                # Node.js + Express (Strict MVC Pattern)
│   │   ├── controllers/        # Auth, Employee, Attendance, Leave, Announcements, Training
│   │   ├── middleware/         # JWT Verification & RBAC Guards
│   │   ├── models/             # Mongoose Schemas (User, Employee, Attendance, etc.)
│   │   ├── routes/             # RESTful API Endpoints
│   │   ├── server.js           # Server Entry Point
│   │   └── .env.example        # Environment Config Template
│   ├── database/               # Database Schemas & Seeding Scripts
│   │   ├── schema_definition.md# Schema Specifications & ER Diagrams
│   │   └── seed.js             # Initial Account & Roster Seeder
│   ├── package.json            # Single-command runner (`npm run dev`)
│   └── README.md               # Codebase setup & API guide
│
├── 📁 Documentation/            # Complete Software Engineering Project Documentation
│   ├── Ideation Phase-(1)/     # Brainstorming, Problem Statements & Empathy Map Canvas
│   ├── Project Planning Phase(2)/ # Product Backlog, Sprints, Velocity & Story Points
│   ├── Requirement Analysis(3)/# Functional/Non-Functional Specs, Tech Stack & DFDs
│   ├── Project Design Phase(4)/# Problem-Solution Fit, Proposed Solution & Architecture
│   ├── Performance Testing/    # User Acceptance Testing (UAT) & Bug Tracking
│   └── README.md               # Documentation Index & Phase Guide
│
└── README.md                   # Main Project Overview
```

---

## 🚀 Quick Navigation

* 💻 **[Explore the Source Code](./Code)** — Access the React Vite frontend, Express backend, and MongoDB schemas.
* 📚 **[Explore the Documentation](./Documentation)** — Access all software engineering phases, docx templates, and architectural diagrams.

---

## 🔑 Operational Roles & Portals

| Portal | Dedicated Login Route | Default Test Account | Password | Scope of Access |
|---|---|---|---|---|
| **HR Administration** | `/login/hr` | `hr@staffsync.com` | `password123` | Full workforce CRUD directory, organization-wide attendance ledger, leave review, corporate announcements |
| **Manager Operations** | `/login/manager` | `manager@staffsync.com` | `password123` | Department team directory, team leave review & approvals, training program assignment |
| **Employee Self-Service** | `/login/employee` | `employee@staffsync.com` | `password123` | Digital clock-in/out shift punch terminal, personal leave applications, custom avatar, assigned training |

---

## 🛠️ Quick Start Guide

### Prerequisites
* **Node.js**: v16+ (tested on Node v20/v24)
* **MongoDB**: Running locally at `mongodb://localhost:27017` or MongoDB Atlas URI

### Single-Command Start (From `Code/`)
```bash
cd Code
npm run dev
```
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`
