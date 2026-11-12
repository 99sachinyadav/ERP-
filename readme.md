# ERP@ - College ERP System

A full-stack college ERP system for managing students, teachers, staff, sections, subjects, attendance, marks, email alerts, and leave approvals.

The project contains three main applications:

- `backend`: Node.js/Express REST API with MongoDB.
- `Admin`: React admin/teacher/staff/director/dean web app.
- `frontend`: React student web app.

---

## Table Of Contents

1. Project Overview
2. Features
3. Tech Stack
4. Repository Structure
5. Environment Variables
6. Getting Started
7. Authentication
8. API Reference
9. Leave Management
10. Data Models
11. Operational Notes
12. Architecture Updates & Recent Implementations

---

## Project Overview

ERP@ supports daily academic administration for a college environment. The backend exposes REST APIs for authentication, student registration, teacher and staff management, sections, subjects, attendance, marks, low-attendance emails, and leave management.

The Admin app is used by Admin, Dean, Director, Teachers, HODs, and Staff depending on login role. The Student app is used by students for registration, login, profile, and attendance views.

---

## Features

### Admin

- Admin login.
- Register teachers and staff.
- View and manage teachers, staff, and students.
- Update teacher and student passwords.
- Create sections with year, batch, semester, and teacher assignment.
- Change section, year, semester, and student section assignments.
- Assign subjects to sections.
- Manage HOD assignment.
- Manage leave semesters and administrator-routed leave requests.

### Dean

- Dean login.
- Monitor attendance.
- Monitor marks.
- Monitor subject-wise faculty allocation.

### Director

- Director login.
- Monitor attendance, marks, and subject-wise faculty allocation.
- Review and approve/reject forwarded leave requests.
- Assign leave quotas for teachers and staff.
- Assign quotas to all users or to a specific email.
- Manage semester quota, yearly quota, and individual special leave allocation.

### Teacher

- Teacher login.
- View assigned sections and subjects.
- Maintain syllabus completion progress (`CourseProgress.jsx`) with chapters, required lectures, and target dates. Progress and subjects are isolated per class `(year, batch, section)` container.
- Mark attendance.
- Monitor students and attendance.
- Upload and update marks for `ST1`, `ST2`, and `PUT`.
- Send low-attendance email alerts.
- Apply for leave and comp-off credit.
- View leave balances, pending leave count, approved leave count, and request history.
- Request rollback for approved leave.

### HOD

- HOD can be assigned from either Teacher or Staff.
- Department-level leave review access (`/hodPanel`).
- View department leave requests.
- Inspect teacher and staff leave balances and request history.
- Forward valid requests to Director.
- Reject requests with remarks.
- **Teacher HOD Track Course Progress:** Teacher HODs have access to "Track course_progress" (`/trackCourseProgress`) to monitor full syllabus progress and generate reports across all subjects and faculty for any class/batch (Staff HODs do not have this academic course tracking option).

### Staff

- Staff login uses the teacher/staff login flow.
- Apply for leave (including LWP - Leave Without Pay) and comp-off credit.
- View personal leave balances, request history, and Monthly Approved LWP Tracker.
- If assigned as HOD, retains the Staff Portal UI (Leave Balances & Staff Actions) with an added "Manage Dept Leaves" quick action, without exposing Teacher-specific modules.

### Student

- Student registration with photo upload.
- Student email verification flow.
- Student login.
- View profile.
- View attendance by date.

### Email

- Sends student verification emails.
- Sends low-attendance warning emails to students below attendance criteria.

---

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Nodemailer
- Resend support is present in config

### Frontend

- React 19
- Vite 6
- Tailwind CSS v4
- React Router v7
- Axios
- Recharts
- React Hot Toast
- Remix Icon
- Radix UI Dialog

---

## Repository Structure

```text
ERP@ - Copy/
  Admin/                  Admin, Teacher, Staff, Dean, and Director app
    src/
      Components/
      pages/
      lib/
      assets/
  backend/                Express API
    config/
    controller/
    middelware/
    model/
    routes/
  frontend/               Student app
    src/
      Components/
      pages/
      assets/
  readme.md
```

---

## Environment Variables

Create `.env` files locally. Do not commit real secrets.

### `backend/.env`

```env
PORT=4000
MONGOURI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password

DEAN_EMAIL=dean@example.com
DEAN_PASSWORD=dean_password

DIRECTOR_EMAIL=director@example.com
DIRECTOR_PASSWORD=director_password

GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password

RESEND_API_KEY=optional_resend_key
BACKEND_URL=http://localhost:4000
```

### `Admin/.env`

```env
VITE_BACKEND_URL=http://localhost:4000
```

### `frontend/.env`

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## Getting Started

### 1. Install Dependencies

Backend:

```bash
cd backend
npm install
```

Admin app:

```bash
cd Admin
npm install
```

Student app:

```bash
cd frontend
npm install
```

### 2. Run Locally

Backend:

```bash
cd backend
npm run server
```

Admin app:

```bash
cd Admin
npm run dev
```

Student app:

```bash
cd frontend
npm run dev
```

### 3. Build Frontend Apps

Admin app:

```bash
cd Admin
npm run build
```

Student app:

```bash
cd frontend
npm run build
```

---

## Authentication

The backend uses JWT tokens passed through role-specific headers.

| Role | Header |
| --- | --- |
| Admin | `admintoken` |
| Teacher, HOD, Staff | `teachertoken` |
| Student | `token` |
| Dean | `deanToken` in frontend storage |
| Director | `directorToken` in frontend storage |

Some monitoring endpoints accept elevated admin/dean/director access through middleware.

---

## API Reference

Base path:

```text
/api
```

### Admin And Leadership

- `POST /loginAdmin`
- `POST /loginDean`
- `POST /loginDirector`
- `GET /getAllTeacher`
- `PUT /updateTeacherPassword`
- `PUT /updateStudentPassword`
- `PUT /updateSectionorSemester`
- `PUT /changeStudentSection`
- `POST /changeYear`

### Teacher And Staff

- `POST /registerTeacher`
- `POST /registerStaff`
- `POST /loginTeacher`
- `PUT /updateTeacher`
- `GET /getTeacherAssignments`
- `POST /markAttendance`
- `GET /getattandanceStudent`
- `GET /gelStudentBySection`
- `POST /addSubjects`
- `POST /uploadMarks`
- `POST /send-email`

### Student

- `POST /requestStudentVerification`
- `POST /registerStudent`
- `POST /registerStudentWithCode`
- `POST /loginStudent`
- `GET /getProfile`
- `GET /getStudent`
- `GET /getStudentAttendance`
- `POST /createSection`

### Leave

- `POST /leaves/apply`
- `POST /leaves/apply-staff`
- `POST /leaves/apply-compoff-credit`
- `POST /leaves/apply-staff-compoff-credit`
- `GET /leaves/my-requests`
- `GET /leaves/my-balance`
- `PUT /leaves/:id/rollback-request`
- `GET /leaves/hod/pending`
- `PUT /leaves/hod/:id/forward`
- `PUT /leaves/hod/:id/reject`
- `GET /leaves/admin/pending`
- `POST /leaves/admin/semester`
- `GET /leaves/admin/semesters`
- `PUT /leaves/admin/:id/forward`
- `PUT /leaves/admin/:id/reject`
- `POST /leaves/admin/close-semester`
- `GET /leaves/director/pending`
- `PUT /leaves/director/:id/approve`
- `PUT /leaves/director/:id/reject`
- `POST /leaves/director/assign/teachers`
- `POST /leaves/director/assign/teacher/email`
- `POST /leaves/director/assign/staff`
- `POST /leaves/director/assign/staff/email`
- `GET /leaves/records`
- `GET /leaves/department/:department`
- `GET /leaves/teacher/:teacherId`
- `GET /leaves/summary`

---

## Leave Management

The leave system manages balances and requests for teachers and staff. Requests move through HOD/Admin review and final Director approval.

### Supported Leave Types

| Code | Name | Allocation Type |
| --- | --- | --- |
| `EL` | Earned Leave | Semester quota |
| `CL` | Casual Leave | Semester quota |
| `ML` | Medical Leave | Yearly quota |
| `OD` | On-Duty Leave | Yearly quota |
| `WINTER_LEAVE` | Winter Leave | Yearly quota |
| `SUMMER_LEAVE` | Summer Leave | Yearly quota |
| `COMPOFF` | Compensatory Off | Balance/credit based |
| `MATERNITY_LEAVE` | Maternity Leave | Individual special allocation |
| `STUDY_LEAVE` | Study Leave | Individual special allocation |
| `SPECIAL_DISABILITY_LEAVE` | Special Disability Leave | Individual special allocation |
| `LWP` | Leave Without Pay | Count-based / Unrestricted (starts at 0, increments on Director approval, resets per semester) |

### Request Types

- `LEAVE_USAGE`: Normal leave request that consumes balance after approval.
- `COMPOFF_CREDIT`: Credit request that adds comp-off balance after approval.

### Status Values

- `PENDING_HOD`
- `PENDING_ADMIN`
- `FORWARDED_TO_DIRECTOR`
- `APPROVED`
- `REJECTED_BY_HOD`
- `REJECTED_BY_ADMIN`
- `REJECTED_BY_DIRECTOR`
- `ROLLBACK_REQUESTED`
- `ROLLED_BACK`
- `ROLLBACK_REJECTED`
- `CANCELLED`

### Approval Flow

1. Teacher or staff submits a leave request.
2. Backend validates department, leave type, date range, requested days, attachment, and balance.
3. Department requests go to HOD as `PENDING_HOD`.
4. Administrator department requests go directly to Director or Admin flow depending on route/status handling.
5. HOD/Admin forwards valid requests to Director.
6. Director approves or rejects the request.
7. Approved leave increments the matching used balance.
8. Approved comp-off credit increments comp-off total.
9. Approved rollback credits used leave back.

### Leave Quota Assignment

Director can assign quotas to:

- all teachers
- one teacher by email
- all staff
- one staff member by email

Quota groups:

- Semester quota: `EL`, `CL`
- Yearly quota: `ML`, `OD`, `WINTER_LEAVE`, `SUMMER_LEAVE`
- Individual special quota: `MATERNITY_LEAVE`, `STUDY_LEAVE`, `SPECIAL_DISABILITY_LEAVE`

### Leave UI Coverage

- Teacher/Staff Leave Desk (`/applyLeave`) shows balances, LWP (Current Sem) card, pending count, approved count, request form, current requests, history, attachments, rollback action, and a dedicated **Monthly Approved LWP Tracker** with month and year filters.
- HOD panel (`/hodPanel`) shows department requests, teacher leave details, and supports LWP review.
- Admin Manage Leaves screen supports semester creation, semester close, filtering by leave types including LWP, summaries, and request forwarding/rejection.
- Director dashboard (`/director/approveLeaves`) supports final approval and date-wise filtering for all leaves including LWP, as well as quota assignment.

---

## Data Models

### Student

- Stores profile, contact, roll number, email, password hash, and image.
- Stores attendance by subject/date.
- Stores marks by subject, semester, and exam.
- Subjects are derived from assigned section subjects.

### Teacher

- Stores name, email, password hash, department, role, assigned sections, and subjects.
- `role` may be Faculty or HOD.
- Department enum values are `AIML/CSE/IT`, `ECE/EN`, `APPLIED/STAFF`, `ADMINISTRATOR`, `LIBRARY`, and `REGISTRAR`.

### Staff

- Stores staff profile, login details, department, and role.
- Supports both standard `"STAFF"` role and `"HOD"` role when assigned by Admin.
- When assigned as HOD, access to department leave reviews is enabled while preserving the Staff Portal layout.

### Section

- Stores section name, year, batch, semester, subjects, assigned teacher, and students.
- Subject keys include semester information.

### LeaveRequest

- References either `teacher` or `staff`.
- Stores department, semester, academic year, leave type (including `LWP`), request kind, date range, days, reason, optional attachment, status, approval remarks, and rollback details.

### LeaveBalance

- References either `teacher` or `staff`.
- Unique per user, semester, and academic year.
- Tracks total and used values for all leave types, including `lwpTotal` and `lwpUsed`.
- `lwpUsed` tracks approved Leave Without Pay count for the current semester and resets to 0 upon semester close. Historical approved LWPs remain queryable from `LeaveRequest`.

---

## Operational Notes

- Keep department values consistent across backend enums and frontend dropdowns.
- Current department values are `AIML/CSE/IT`, `ECE/EN`, `APPLIED/STAFF`, and `ADMINISTRATOR`.
- Student image uploads are stored as base64 in MongoDB, which can increase document size.
- Student registration with verification uses multipart form data plus a verification code.
- Attendance and subject logic depends on consistent section, semester, batch, and subject key naming.
- Marks are currently handled for `ST1`, `ST2`, and `PUT`.
- Admin, Teacher/Staff, Student, Dean, and Director tokens are role-specific.
- Leave balances should be created/assigned before users apply for leave.
- Closing a semester carries forward eligible EL and preserves yearly leave values within the same academic year.
- Rotate secrets before sharing or deploying publicly.

---

## Verification

Useful checks:

```bash
cd backend
node --check controller/leavecontroller.js
node --check model/leavebalancemodel.js
node --check model/leaverequestmodel.js
node --check model/staffmodel.js
node --check model/teachermodel.js
```

```bash
cd Admin
npm run build
```

```bash
cd frontend
npm run build
```

---

## 12. Architecture Updates & Recent Implementations

This section documents the latest major feature implementations and architectural updates added to the ERP system:

### 12.1. Leave Without Pay (LWP) Module
* **Business Need:** Enable faculty and staff to take unpaid leaves when their standard quota is exhausted or for personal reasons, without being blocked by quota limitations.
* **Database Models:**
  - `backend/model/leavebalancemodel.js`: Added `lwpTotal: { type: Number, default: 0 }` and `lwpUsed: { type: Number, default: 0 }`.
  - `backend/model/leaverequestmodel.js`: Extended `leaveType` enum with `"LWP"` (`["Casual", "Medical", "Duty", "Special", "CompOff", "LWP"]`).
* **Backend Processing (`backend/controller/leavecontroller.js`):**
  - **Quota Bypass:** When `leaveType === "LWP"`, balance verification is bypassed so teachers/staff can apply for LWP even with zero remaining leave balance.
  - **Usage Tracking:** Upon Director approval, `lwpUsed` is incremented by the approved duration.
  - **Semester Rollover:** During semester reset / rollover (`closeSemester`), `lwpUsed` resets to 0 alongside other seasonal counters.
  - **Status & Summaries:** LWP is aggregated into leave status reports, user balances, and department leave lists.
* **Frontend Panels:**
  - `Admin/src/pages/Leave.jsx`:
    - Added "LWP (Unpaid)" metric card showing total days used.
    - Added "Leave Without Pay (LWP)" option in the application dropdown.
    - Integrated **Monthly Approved LWP Tracker** with month and year selectors to inspect exact approved LWP dates.
  - `Admin/src/pages/Approveleaves.jsx`, `HODLeavePanel.jsx`, `ManageLeaves.jsx`:
    - Added "LWP" filter option and distinct badge rendering in Director, HOD, and Admin review tables.

---

### 12.2. Staff HOD Assignment & Role Preservation
* **Business Need:** Allow non-teaching Staff members to be assigned as Department HODs, giving them departmental leave approval authority while preserving their Staff Portal UI.
* **Backend Controller (`backend/controller/admincontroller.js`):**
  - Upgraded `assignHOD` to search and support both `Teacher` and `Staff` collections.
  - Safely unsets any existing HOD of the targeted department (Teacher or Staff) to ensure strict one-HOD-per-department rule.
  - Updates the targeted staff member's profile with `isHOD: true` and `department: req.body.department`.
* **Leave Routing (`backend/controller/leavecontroller.js`):**
  - When routing departmental leave requests (`PENDING_HOD`), the backend checks both `Teacher` and `Staff` models to find the active HOD for that department.
* **Frontend Portal Distinction (`TeacherDashboard.jsx` & `TeacherLogin.jsx`):**
  - `TeacherLogin.jsx` stores `isStaff: "true" | "false"` in `localStorage`.
  - When a Staff HOD logs in, they remain in the **Staff Portal** view (showing personal leave balances and staff actions). Academic teacher modules (attendance, marks, syllabus) remain hidden.
  - Staff HOD receives an extra action: **"Manage Dept Leaves"** (`/hodPanel`) to review, forward, or reject leave requests from their department.

---

### 12.3. Course Progress & Syllabus Tracking (Class Isolation & Uniqueness)
* **Business Need:** Allow identical subject names and codes (e.g., `DBMS` / `CS-301`) across different sections or years without conflict, while strictly preventing duplicate subjects within the same section.
* **Class Container Model (`backend/model/courseprogressmodel.js`):**
  - Each `(year, batch, section)` is an independent document partitioned by `{ section: 1, year: 1, batch: 1 }` (`unique: true`).
* **Backend In-Section Validation (`backend/controller/teacherconroller.js`):**
  - `saveCourseProgressSubject`: Validates that no *other* subject in that specific section uses the same code or name, while allowing seamless updates to the existing subject.
  - `saveCourseProgress`: Validates that the submitted list of subjects contains no duplicate codes or names within the section.
* **Frontend Scoped Drafts (`Admin/src/pages/CourseProgress.jsx`):**
  - Local drafts are strictly partitioned per class and semester: `course-progress-${token}-${year}-${batch}-${section}-${semester}`.
  - Switching `year`, `batch`, `section`, or `semester` clears or loads only that specific class draft, preventing cross-section data contamination.
  - On 404 (no record found for that section/semester), subjects are reset to `[]` for a clean slate.

---

### 12.4. Teacher Panel Visibility vs Director Whole-Section Tracking
* **Business Need:** When a teacher searches a class in Course Progress, they should only see the subjects they personally added/teach, without seeing other faculty's progress. Meanwhile, the Director panel must remain capable of monitoring all faculty.
* **Backend Filtering (`backend/controller/teacherconroller.js`):**
  - In `getCourseProgress`:
    - When requested with `teachertoken`, the backend resolves `teacherId` and filters `subjects` to ONLY include subjects where `sub.teacher` matches the teacher ID or `sub.teacherName` matches the teacher name.
    - If no subjects belong to this teacher in that section, returns 404 (`"No subjects added by you found..."`), presenting a clean workspace.
  - Subject Overwrite Protection: In `saveCourseProgressSubject`, if a subject exists and belongs to another faculty, modification is blocked with `403 Forbidden`.
* **Director & Dean Monitoring (`TrackCourseProgress.jsx`):**
  - Requests sent with `admintoken` bypass the single-teacher filter.
  - Director, Dean, and Admin continue to see all subjects across all faculty with complete progress bars, chapter tables, and report printing.

---

### 12.5. Teacher HOD Track Course Progress ("Track course_progress") vs Staff HOD Exclusion
* **Business Need:** Empower Teacher HODs to monitor syllabus completion across their department/section just like the Director, while explicitly excluding Staff HODs.
* **Routing & Navigation (`Admin/src/App.jsx`):**
  - Added protected route `/trackCourseProgress` wrapped with `<TeacherProTect>`.
* **Dashboard Action (`Admin/src/pages/TeacherDashboard.jsx`):**
  - **Teacher HOD (`isHOD === true` AND `!isStaff`):** Granted the quick action card **"Track course_progress"** navigating to `/trackCourseProgress`.
  - **Staff HOD (`isStaff === true`):** The "Track course_progress" card is **completely excluded/hidden**. Staff HODs only see "Manage Dept Leaves".
  - **Normal Teachers:** Cannot see this tracking action.
* **Top Navigation Bar (`Admin/src/Components/TeacherActionButtons.jsx`):**
  - Dynamically adds "Track course_progress" to the navigation bar when the logged-in user is a Teacher HOD.
* **Monitoring Page (`Admin/src/pages/TrackCourseProgress.jsx`):**
  - Recognizes `isTeacherHOD` role.
  - Sets header label to `"HOD Monitor"`.
  - Configures "Back to Dashboard" button to return to `/teacherdashboard`.
  - Sends `mode: "track"` parameter along with `teachertoken`.
* **Backend HOD Tracking Authorization (`backend/controller/teacherconroller.js`):**
  - In `getCourseProgress`, when `mode === "track"`:
    - Verifies the user is a Teacher HOD (`role === "HOD"` in `Teacher` collection).
    - If verified, returns all subjects and full section progress without single-teacher filtering.
    - If non-HOD or staff attempts `mode=track`, access is rejected with `403 Forbidden`.

---

### 12.6. Monitor Attendance Compact Print Option
* **Business Need:** Provide faculty and administrators with an instant, compact tabular attendance summary report of an entire class containing student names, roll numbers, father's names, total lectures, lectures attended, aggregate attendance percentage, and eligibility status without printing multiple pages of individual subject breakdowns.
* **Component Implementation (`Admin/src/Components/MonitorAttendence.jsx`):**
  - **Dual Print Controls:** Added a dedicated **"Compact Print"** button alongside the existing **"Print"** button (subject-wise detailed attendance report), keeping the existing detailed print functionality completely intact and unchanged.
  - **Compact Print Layout:** Opens an optimized printable window displaying:
    - Institute/Class Header: Section, Year, Batch, Semester, Filtered Date Range, and Generation Timestamp.
    - Summary Statistic Badges: Total Students, Eligible ($\ge 75\%$), Shortage ($< 75\%$), and Class Aggregate Percentage.
    - Consolidated Table: Serial Number, Roll Number, Student Name, Father's Name, Total Lectures, Attended Lectures, Aggregate %, and Eligibility Status Badge.
    - Print Optimization: Compact typography, color-coded shortage/eligible highlights, signature footer block, and automatic print dialog invocation with `@media print` styles.

---

### 12.7. Summary of Modified Files

| File Path | Description of Changes |
| :--- | :--- |
| `backend/model/leavebalancemodel.js` | Added `lwpTotal` and `lwpUsed` fields to track Leave Without Pay usage. |
| `backend/model/leaverequestmodel.js` | Added `"LWP"` to `leaveType` enum. |
| `backend/controller/leavecontroller.js` | LWP quota bypass, usage increment on approval, semester reset, and Staff HOD routing lookup. |
| `backend/controller/admincontroller.js` | Updated `assignHOD` to support assigning Staff as HOD with automatic previous HOD reset. |
| `backend/controller/teacherconroller.js` | In-section subject uniqueness validation, teacher-only subject filtering for `/courseProgress`, and Teacher HOD `mode=track` authorization. |
| `backend/middelware/teacherAuth.js` | Populates `req.teacherId` and `req.adminID` defensively for both GET and POST endpoints. |
| `Admin/src/App.jsx` | Added protected route `/trackCourseProgress`. |
| `Admin/src/pages/Leave.jsx` | Added "LWP (Unpaid)" card, dropdown option, and Monthly Approved LWP Tracker with month/year filter. |
| `Admin/src/pages/Approveleaves.jsx` | Added LWP to filter list and table badges. |
| `Admin/src/Components/HODLeavePanel.jsx` | Added LWP to leave type filters. |
| `Admin/src/Components/ManageLeaves.jsx` | Added LWP to leave type filters. |
| `Admin/src/Components/AssignHOD.jsx` | Supported assigning staff emails as HOD. |
| `Admin/src/pages/TeacherLogin.jsx` | Saved `isStaff` state in localStorage. |
| `Admin/src/pages/TeacherDashboard.jsx` | Staff HOD portal preservation ("Manage Dept Leaves") and Teacher HOD "Track course_progress" card. |
| `Admin/src/pages/CourseProgress.jsx` | LocalStorage scoping by `(year, batch, section, semester)`, 404 subject reset, and semester query parameter. |
| `Admin/src/pages/TrackCourseProgress.jsx` | Added Teacher HOD support (`mode=track`), "HOD Monitor" badge, and back navigation to `/teacherdashboard`. |
| `Admin/src/Components/TeacherActionButtons.jsx` | Added "Track course_progress" shortcut button for Teacher HODs. |
| `Admin/src/Components/MonitorAttendence.jsx` | Added "Compact Print" button and aggregate attendance tabular print template while preserving existing detailed subject print. |
| `readme.md` | Comprehensive system documentation and architecture update. |

---

## License

This project appears to be intended for internal college ERP usage. Add a formal license before public distribution.
