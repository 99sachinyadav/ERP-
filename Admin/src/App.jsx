import { Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import { Toaster } from "react-hot-toast";

import TeacherRegister from "./pages/TeacherRegister";
import Dashboard from "./pages/Dashboard";
import MarksDashboard from "./pages/MarksDashboard";
import TeacherLogin from "./pages/TeacherLogin";
import Home from "./pages/Home";
import AdminProtect from "./Components/AdminProtect";
import TeacherProTect from "./Components/TeacherProTect";
import RoleProtect from "./Components/RoleProtect";
import TeacherDashboard from "./pages/TeacherDashboard";
import AddSubjects from "./Components/AddSubjects";
import SeeAllStudent from "./Components/SeeAllStudent";
import MonitorAttendence from "./Components/MonitorAttendence";
import MonitorMarks from "./Components/MonitorMarks";
import MonitorSubjectFaculty from "./Components/MonitorSubjectFaculty";
import ContactForm from "./pages/ContactForm";
import SendEmail from "./Components/SendEmail";
import DeanLogin from "./pages/DeanLogin";
import DirectorLogin from "./pages/DirectorLogin";
import DeanDashboard from "./pages/DeanDashboard";
import DirectorDashboard from "./pages/DirectorDashboard";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

function App() {
  return (
    <div className=" w-full  ">
      <Toaster />
      <Routes>
        <Route
          path="/admindashboard"
          element={
            <AdminProtect>
              <Home />
            </AdminProtect>
          }
        />
        <Route path="/" element={<AdminLogin />} />
        <Route path="/deanlogin" element={<DeanLogin />} />
        <Route path="/directorlogin" element={<DirectorLogin />} />
        <Route
          path="/teacherRegister"
          element={
            <AdminProtect>
              <TeacherRegister />
            </AdminProtect>
          }
        />
        <Route path="/email" element={<ContactForm />} />
        <Route
          path="/teacherdashboard"
          element={
            <TeacherProTect>
              <TeacherDashboard />
            </TeacherProTect>
          }
        />
        <Route
          path="/addSubjects"
          element={
            <TeacherProTect>
              <AddSubjects />
            </TeacherProTect>
          }
        />
        <Route
          path="/monitorStudents"
          element={
            <TeacherProTect>
              <MonitorAttendence />
            </TeacherProTect>
          }
        />
        <Route
          path="/monitorMarks"
          element={
            <TeacherProTect>
              <MonitorMarks />
            </TeacherProTect>
          }
        />
        <Route
          path="/dean"
          element={
            <RoleProtect tokenKey="deanToken" redirectTo="/deanlogin">
              <DeanDashboard />
            </RoleProtect>
          }
        />
        <Route
          path="/dean/attendance"
          element={
            <RoleProtect tokenKey="deanToken" redirectTo="/deanlogin">
              <MonitorAttendence />
            </RoleProtect>
          }
        />
        <Route
          path="/dean/marks"
          element={
            <RoleProtect tokenKey="deanToken" redirectTo="/deanlogin">
              <MonitorMarks />
            </RoleProtect>
          }
        />
        <Route
          path="/dean/subject-faculty"
          element={
            <RoleProtect tokenKey="deanToken" redirectTo="/deanlogin">
              <MonitorSubjectFaculty />
            </RoleProtect>
          }
        />
        <Route
          path="/director"
          element={
            <RoleProtect tokenKey="directorToken" redirectTo="/directorlogin">
              <DirectorDashboard />
            </RoleProtect>
          }
        />
        <Route
          path="/director/attendance"
          element={
            <RoleProtect tokenKey="directorToken" redirectTo="/directorlogin">
              <MonitorAttendence />
            </RoleProtect>
          }
        />
        <Route
          path="/director/marks"
          element={
            <RoleProtect tokenKey="directorToken" redirectTo="/directorlogin">
              <MonitorMarks />
            </RoleProtect>
          }
        />
        <Route
          path="/director/subject-faculty"
          element={
            <RoleProtect tokenKey="directorToken" redirectTo="/directorlogin">
              <MonitorSubjectFaculty />
            </RoleProtect>
          }
        />
        <Route
          path="/sendEmail"
          element={
            <TeacherProTect>
              <SendEmail />
            </TeacherProTect>
          }
        />
        <Route
          path="/seeStudent"
          element={
            <TeacherProTect>
              <SeeAllStudent />
            </TeacherProTect>
          }
        />
        <Route
          path="/dashboard"
          element={
            <TeacherProTect>
              <Dashboard />
            </TeacherProTect>
          }
        />
        <Route
          path="/marks"
          element={
            <TeacherProTect>
              <MarksDashboard />
            </TeacherProTect>
          }
        />
        <Route path="/teacherlogin" element={<TeacherLogin />} />
      </Routes>
    </div>
  );
}

export default App;
