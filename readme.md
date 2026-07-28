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
- Mark attendance.
- Monitor students and attendance.
- Upload and update marks for `ST1`, `ST2`, and `PUT`.
- Send low-attendance email alerts.
- Apply for leave and comp-off credit.
- View leave balances, pending leave count, approved leave count, and request history.
- Request rollback for approved leave.

### HOD

- HOD is a teacher role with department-level leave review access.
- View department leave requests.
- Inspect teacher leave balances and request history.
- Forward valid requests to Director.
- Reject requests with remarks.

### Staff

- Staff login uses the teacher/staff login flow.
- Apply for leave and comp-off credit.
- View personal leave balances and request history.

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

- Teacher/Staff Leave Desk shows balances, pending count, approved count, request form, current requests, history, attachments, and rollback action.
- HOD panel shows department requests and teacher leave details.
- Admin Manage Leaves screen supports semester creation, semester close, filtering, summaries, and request forwarding/rejection.
- Director dashboard supports final approval and leave quota assignment.

---

## Data Models

### Student

- Stores profile, contact, roll number, email, password hash, and image.
- Stores attendance by subject/date.
- Stores marks by subject, semester, and exam.
- Subjects are derived from assigned section subjects.

### Teacher

- Stores name, email, password hash, department, role, assigned sections, and subjects.
- `role` may be teacher/HOD style depending on assignment.
- Department enum values are `AIML/CSE/IT`, `ECE/EN`, `APPLIED/STAFF`, and `ADMINISTRATOR`.

### Staff

- Stores staff profile, login details, department, and role.
- Staff role defaults to staff behavior in the teacher/staff login flow.

### Section

- Stores section name, year, batch, semester, subjects, assigned teacher, and students.
- Subject keys include semester information.

### LeaveRequest

- References either `teacher` or `staff`.
- Stores department, semester, academic year, leave type, request kind, date range, days, reason, optional attachment, status, approval remarks, and rollback details.

### LeaveBalance

- References either `teacher` or `staff`.
- Unique per user, semester, and academic year.
- Tracks total and used values for all leave types.
- Includes semester, yearly, comp-off, and special leave balances.

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

## License

This project appears to be intended for internal college ERP usage. Add a formal license before public distribution.
