# ERP System Backend & Frontend

This project is a full-stack **ERP (Enterprise Resource Planning)** system designed to manage students, teachers, sections, and attendance.  
The backend is built using **Node.js**, **Express.js**, and **MongoDB** with **Mongoose** for database interactions.  
The frontend is built using **React**, **Vite**, and **Tailwind CSS**.

---

## Features

### **1. Authentication**
- **Admin Login**: Admins can log in using environment-provided credentials.
- **Teacher Login**: Teachers can log in using their email and password.
- **Student Login**: Students can log in using their email and password.
- **JWT Authentication**: Secure token-based authentication for all users.

### **2. User Management**
- **Register Students**: Add new students to the system and assign them to sections.
- **Register Teachers**: Add new teachers and assign them to sections.
- **Fetch Profiles**: Retrieve profiles for students and teachers.
- **Get All Users**: Fetch all registered students or teachers.

### **3. Section Management**
- **Create Sections**: Create sections for specific years and batches.
- **Assign Teachers**: Assign or update teachers for specific sections.
- **Update Section Year**: Change the year of a section and update all associated students.

### **4. Attendance Management**
- **Mark Attendance**: Teachers can mark attendance for students in their assigned sections.
- **Fetch Attendance**: Retrieve attendance records for all students in a specific section.

---

## Frontend Features

- **Admin Panel**: Register, update, and manage teachers, sections, and subjects. Monitor and mark attendance. View all students and teachers.
- **Teacher Panel**: Mark and update student attendance, add subjects, view assigned sections and students.
- **Student Panel**: Register, login, view attendance by date and subject, view profile and section details.
- **Responsive UI**: Built with React, Vite, and Tailwind CSS for a modern and responsive experience.
- **Notifications**: Real-time feedback using React Hot Toast.
- **Calendar View**: Visualize attendance with calendar components.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Remix Icon, React Calendar, React Hot Toast
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Token)

---

## Folder Structure

```
ERP@
├── Admin
│   └── Admin
│       ├── src
│       │   ├── Components
│       │   ├── pages
│       │   ├── App.jsx
│       │   ├── index.css
│       │   └── main.jsx
│       └── README.md
├── backend
│   ├── controller
│   │   ├── admincontroller.js
│   │   ├── sectioncontroller.js
│   │   ├── studentcontroller.js
│   │   └── teacherconroller.js
│   └── model
│       ├── sectionmodel.js
│       ├── studentmodel.js
│       ├── teachermodel.js
│       └── usermodel.js
├── frontend
│   └── src
│       ├── Components
│       ├── pages
│       ├── assets
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
```

---

## Installation

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd <repository-folder>
```

### **2. Install Dependencies**

**Backend:**
```bash
cd backend
npm install
```

**Admin Frontend:**
```bash
cd ../Admin/Admin
npm install
```

**Student Frontend:**
```bash
cd ../../frontend
npm install
```

### **3. Set Up Environment Variables**

Create a `.env` file in the backend root with the following:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### **4. Start the Applications**

**Backend:**
```bash
cd backend
npm start
```

**Admin Frontend:**
```bash
cd ../Admin/Admin
npm run dev
```

**Student Frontend:**
```bash
cd ../../frontend
npm run dev
```

---

## API Overview

- **Admin APIs:** `/api/admin/...`
- **Teacher APIs:** `/api/teacher/...`
- **Student APIs:** `/api/student/...`
- **Section APIs:** `/api/section/...`

See the controller files in `backend/controller/` for detailed endpoints.

---

## License

This project is for my college attendance managment

---