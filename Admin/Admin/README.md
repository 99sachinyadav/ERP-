# ERP@ - College ERP System

This project is a full-stack **College ERP (Enterprise Resource Planning) System** built with **React**, **Vite**, **Node.js**, **Express**, and **MongoDB**.

It provides a complete solution for managing students, teachers, attendance, sections, and subjects in a college environment, with a dedicated **Admin Panel** for advanced management.

---

## Features

### Admin Features
- Register, update, and manage teachers
- Create and manage sections and subjects
- Monitor and manage student attendance
- Change academic year for sections
- View all students and teachers
- Mark attendance for any student
- Secure admin authentication

### Teacher Features
- Mark and update student attendance
- Add subjects to sections
- View and monitor students in assigned sections

### Student Features
- Register and login
- View attendance by date and subject
- View profile and section details

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Token)
- **UI Libraries:** Remix Icon, React Calendar, React Hot Toast

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

## Getting Started

### 1. **Clone the repository**

```sh
git clone <your-repo-url>
cd ERP@
```

### 2. **Install dependencies**

**Backend:**
```sh
cd backend
npm install
```

**Admin Frontend:**
```sh
cd ../Admin/Admin
npm install
```

**Student Frontend:**
```sh
cd ../../frontend
npm install
```

### 3. **Set up environment variables**

- Create a `.env` file in the backend and frontend directories as needed.
- Example for backend:
  ```
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ADMIN_EMAIL=admin@example.com
  ADMIN_PASSWORD=your_admin_password
  ```

### 4. **Run the applications**

**Backend:**
```sh
cd backend
npm start
```

**Admin Frontend:**
```sh
cd ../Admin/Admin
npm run dev
```

**Student Frontend:**
```sh
cd ../../frontend
npm run dev
```

---

## API Structure

- **Admin APIs:** `/api/admin/...`
- **Teacher APIs:** `/api/teacher/...`
- **Student APIs:** `/api/student/...`
- **Section APIs:** `/api/section/...`

See the controller files in `backend/controller/` for detailed endpoints.

---

## Customization

- Update UI in the `Components` and `pages` folders for both admin and student panels.
- Add or modify models in `backend/model/` as per your requirements.
- Update authentication logic in controllers as needed.

---

## License

This project is for educational purposes.  
Feel free to use and modify as per your needs.

---