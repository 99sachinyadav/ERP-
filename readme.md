# ERP System Backend

This is the backend for an **ERP (Enterprise Resource Planning)** system designed to manage students, teachers, sections, and attendance. The backend is built using **Node.js**, **Express.js**, and **MongoDB** with **Mongoose** for database interactions.

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

## Installation

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd <repository-folder>