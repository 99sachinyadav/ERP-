import React, { useState } from "react";
import TeacherRegister from "./TeacherRegister";

import "remixicon/fonts/remixicon.css";
import AdminMenu from "../Components/AdminMenu";
import SeeALLTeachers from "../Components/SeeALLTeachers";
import SeeAllStudent from "../Components/SeeAllStudent";
import UpdateTeacher from "../Components/UpdateTeacher";
import CreateSection from "../Components/CreateSection";
import ChangeYear from "../Components/ChangeYear";
import AddSubjects from "../Components/AddSubjects";
import MonitorAttendence from "../Components/MonitorAttendence";
import ChangeTeacherpassword from "../Components/ChangeTeacherpassword";
import ChangeStudentpassword from "../Components/ChangeStudentpassword";
import { useNavigate } from "react-router-dom";
import ChangeSemesterOrSection from "../Components/ChangeSemesterOrSection";
import ChangeStudentSection from "../Components/ChangeStudentSection";
const Home = () => {
  const [activeComponent, setActiveComponent] = useState("AdminMenu");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { key: "TeacherRegister", icon: "ri-user-add-line", label: "Register Teacher" },
    { key: "UpdateTeacher", icon: "ri-user-settings-line", label: "Update Teacher" },
    { key: "SeeALLTeachers", icon: "ri-team-line", label: "All Teachers" },
    { key: "SeeALLStudents", icon: "ri-graduation-cap-line", label: "All Students" },
    { key: "CreateSection", icon: "ri-layout-grid-line", label: "Create Section" },
    { key: "ChangeYear", icon: "ri-calendar-event-line", label: "Change Year" },
    { key: "AddSubjects", icon: "ri-book-open-line", label: "Add Subjects" },
    { key: "ChangeSemesterOrSection", icon: "ri-exchange-2-line", label: "Semester / Section" },
    { key: "ChangeStudentSection", icon: "ri-git-branch-line", label: "Student Section" },
    { key: "ChangeTeacherpassword", icon: "ri-lock-password-line", label: "Teacher Password" },
    { key: "ChangeStudentpassword", icon: "ri-shield-user-line", label: "Student Password" },
    { key: "MonitorAttendence", icon: "ri-bar-chart-box-line", label: "Monitor Attendance" },
  ];

  const handleSelect = (componentName) => {
    setActiveComponent(componentName);
    setIsOpen(componentName !== "AdminMenu");
  };

  const logout = () => {
    localStorage.removeItem("adminToken");

    navigate("/");
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="hidden min-h-screen w-72 flex-col border-r border-white/40 bg-slate-950/95 p-5 text-slate-100 shadow-2xl lg:flex">
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <i className="ri-shield-user-line text-2xl text-blue-300"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">Admin Panel</h1>
              <p className="text-xs text-slate-400">Control Center</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeComponent === item.key
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={logout}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            <i className="ri-logout-box-r-line"></i>
            Logout
          </button>
        </aside>

        <main className="w-full lg:w-[calc(100%-18rem)]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 py-4 backdrop-blur sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 sm:text-2xl">Dashboard</h2>
              <p className="text-xs text-slate-500 sm:text-sm">Manage teachers, students, and academic settings</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleSelect("AdminMenu")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold sm:px-5 sm:text-sm ${
                  isOpen ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-500"
                }`}
              >
                <i className="ri-arrow-left-line"></i>
                Back
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 sm:px-5 sm:text-sm lg:hidden"
              >
                <i className="ri-logout-box-r-line"></i>
                Logout
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeComponent === "AdminMenu" && (
              <AdminMenu
                setActiveComponent={setActiveComponent}
                setIsOpen={setIsOpen}
                isOpen={isOpen}
              />
            )}
            {activeComponent === "TeacherRegister" && <TeacherRegister />}
            {activeComponent === "UpdateTeacher" && <UpdateTeacher />}
            {activeComponent === "SeeALLTeachers" && <SeeALLTeachers />}
            {activeComponent === "SeeALLStudents" && <SeeAllStudent />}
            {activeComponent === "CreateSection" && <CreateSection />}
            {activeComponent === "ChangeYear" && <ChangeYear />}
            {activeComponent === "AddSubjects" && <AddSubjects />}
            {activeComponent === "ChangeStudentSection" && <ChangeStudentSection />}
            {activeComponent === "ChangeTeacherpassword" && <ChangeTeacherpassword />}
            {activeComponent === "ChangeStudentpassword" && <ChangeStudentpassword />}
            {activeComponent === "ChangeSemesterOrSection" && <ChangeSemesterOrSection />}
            {activeComponent === "MonitorAttendence" && <MonitorAttendence />}
          </div>
        </main>
      </div>
    </div>
  );
};

// To pass props to a component, add them as attributes when using the component.
// For example, to pass a prop called "title" to AdminMenu:

// <AdminMenu title="Welcome Admin" />

// Then, in the AdminMenu component, access it via props:
// const AdminMenu = ({ title }) => { ... }

export default Home;
