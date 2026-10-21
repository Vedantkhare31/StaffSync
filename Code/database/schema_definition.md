# StaffSync Database Architecture (MongoDB Schemas)

Database Name: `staffsync`  
Default Port: `27017`  
ODM: Mongoose

---

## Collections Specification

### 1. `users` Collection
Stores authentication credentials and high-level role mapping.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique Primary Key |
| `name` | String | Yes | Full User Display Name |
| `email` | String | Yes (Unique) | Corporate email login identifier |
| `password` | String | Yes | Bcrypt-hashed password string |
| `role` | String | Yes | Enum: `'hr'`, `'manager'`, `'employee'` |
| `department` | String | No | Functional unit (e.g. `'Engineering'`) |
| `employeeRef` | ObjectId | No | References `employees._id` |
| `status` | String | Yes | Enum: `'active'`, `'inactive'` |
| `createdAt` / `updatedAt` | Date | Auto | Timestamps |

---

### 2. `employees` Collection
Stores employee records, employment details, and compensation.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique Primary Key |
| `employeeId` | String | Yes (Unique) | Formatted ID (e.g. `EMP-1001`) |
| `firstName` | String | Yes | Employee Given Name |
| `lastName` | String | Yes | Employee Family Name |
| `email` | String | Yes (Unique) | Official work email |
| `phone` | String | No | Contact phone number |
| `department` | String | Yes | Enum: `Engineering`, `Human Resources`, `Sales`, `Marketing`, `Finance`, `Operations` |
| `position` | String | Yes | Designation (e.g. `Senior Software Engineer`) |
| `joiningDate` | Date | Yes | Date joined organization |
| `salary` | Number | No | Annual base compensation |
| `managerName` | String | No | Reporting supervisor |
| `status` | String | Yes | Enum: `'active'`, `'on-leave'`, `'inactive'`, `'terminated'` |
| `address` | Object | No | Sub-fields: `street`, `city`, `state`, `zip` |
| `leaveBalance` | Object | Yes | Quota counters: `casual`, `sick`, `annual` |
| `userId` | ObjectId | No | References `users._id` |

---

### 3. `leaverequests` Collection
Tracks lifecycle of leave submissions and reviews.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique Primary Key |
| `employee` | ObjectId | Yes | References `employees._id` |
| `employeeName` | String | Yes | Cached employee name |
| `department` | String | Yes | Cached department name |
| `leaveType` | String | Yes | Enum: `'casual'`, `'sick'`, `'annual'`, `'unpaid'` |
| `startDate` | Date | Yes | Leave beginning date |
| `endDate` | Date | Yes | Leave completion date |
| `totalDays` | Number | Yes | Calculated calendar duration |
| `reason` | String | Yes | Purpose of leave request |
| `status` | String | Yes | Enum: `'pending'`, `'approved'`, `'rejected'` |
| `reviewedBy` | ObjectId | No | References `users._id` (HR or Manager reviewer) |
| `reviewerName` | String | No | Reviewer display name |
| `reviewNotes` | String | No | Comments or rationale provided by reviewer |
| `reviewedAt` | Date | No | Review timestamp |

---

### 4. `attendances` Collection
Records daily shift check-ins, check-outs, and hours.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique Primary Key |
| `employee` | ObjectId | Yes | References `employees._id` |
| `employeeName` | String | Yes | Cached employee name |
| `department` | String | Yes | Cached department name |
| `date` | String | Yes | Date string (Format: `YYYY-MM-DD`) |
| `clockIn` | Date | No | Timestamp of check-in punch |
| `clockOut` | Date | No | Timestamp of check-out punch |
| `workHours` | Number | No | Computed total active hours |
| `status` | String | Yes | Enum: `'present'`, `'absent'`, `'half-day'`, `'late'` |
| `workNotes` | String | No | End-of-shift summary notes |

*Index: `{ employee: 1, date: 1 }` (Unique compound index).*

---

### 5. `announcements` Collection
Stores organization and team bulletins.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique Primary Key |
| `title` | String | Yes | Subject headline |
| `content` | String | Yes | Body text |
| `category` | String | Yes | Enum: `'General'`, `'Policy'`, `'Urgent'`, `'Event'`, `'Holiday'` |
| `targetRole` | String | Yes | Enum: `'all'`, `'employee'`, `'manager'`, `'hr'` |
| `priority` | String | Yes | Enum: `'low'`, `'normal'`, `'high'` |
| `createdBy` | ObjectId | Yes | References `users._id` |
| `authorName` | String | Yes | Author display name |
| `authorRole` | String | Yes | Author role tag (`HR`, `MANAGER`) |

---

### 6. `trainingprograms` Collection
Curriculum tracks and skill development modules.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique Primary Key |
| `title` | String | Yes | Program title |
| `description` | String | Yes | Syllabus and goals |
| `department` | String | Yes | Department scope |
| `instructor` | String | No | Lead trainer |
| `startDate` | Date | Yes | Program start date |
| `endDate` | Date | Yes | Program finish date |
| `status` | String | Yes | Enum: `'scheduled'`, `'in-progress'`, `'completed'`, `'cancelled'` |
| `assignedEmployees` | Array [ObjectId] | No | Array referencing `employees._id` |
| `createdBy` | ObjectId | Yes | References `users._id` |
| `creatorName` | String | Yes | Manager or HR creator name |
