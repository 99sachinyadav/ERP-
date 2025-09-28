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
import Dashboard from "./Dashboard";
import ChangeTeacherpassword from "../Components/ChangeTeacherpassword";
import ChangeStudentpassword from "../Components/ChangeStudentpassword";
import { useNavigate } from "react-router-dom";
import ChangeSemesterOrSection from "../Components/ChangeSemesterOrSection";
import ChangeStudentSection from "../Components/ChangeStudentSection";
const Home = () => {
  const [activeComponent, setActiveComponent] = useState("AdminMenu");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("adminToken");

    navigate("/");
  };



  return (
    <div>
      <div className="flex ">
        {/* Left Sidebar */}
        <div className="left hidden pt-5 sm:hidden md:w-[25%] border-2 md:flex flex-col gap-5 bg-gradient-to-br from-zinc-900 via-neutral-800 to-slate-900 text-white p-8 rounded-lg">
          <div className="p-2 flex items-center">
            <div className="flex justify-center bg-white rounded-full w-15 h-15 items-center ml-3">
              <i className="ri-admin-line text-black   text-3xl text-center "></i>
            </div>
            <h1 className="text-2xl ml-10 font-semibold">Admin Pannel</h1>
          </div>
          <div
            onClick={() => {
              setActiveComponent("TeacherRegister");
              setIsOpen(true);
            }}
            className="flex gap-4 mt-10 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded"
          >
            <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
              <i className="ri-user-add-line text-gray-300 text-2xl"></i>
            </div>
            <button className=" text-lg">Register Teacher</button>
          </div>
          <div 
          onClick={() => {
                setActiveComponent("UpdateTeacher");
                setIsOpen(true);
              }} className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded">
            <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
              <i className="ri-presentation-line text-gray-300 text-2xl"></i>
            </div>
            <button
              className="text-lg"
              
            >
              Update Teacher
            </button>
          </div>

          
       <div  onClick={() => {
              setActiveComponent("SeeALLTeachers");
                setIsOpen(true);
              }} className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded">
              <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
                <i className="ri-user-search-line text-gray-300 text-2xl"></i>
              </div>
              <button
                className="text-lg"
              >
                See ALL Teachers
              </button>
              </div>
              <div
              onClick={() => {
                setActiveComponent("ChangeYear");
                setIsOpen(true);
              }}
              className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded"
              >
              <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
                <i className="ri-calendar-event-line text-gray-300 text-2xl"></i>
              </div>
              <button className="text-lg">
                Change Year
              </button>
              </div>
              <div
              onClick={() => {
                setActiveComponent("AddSubjects");
                setIsOpen(true);
              }}
              className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded"
              >
              <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
                <i className="ri-book-line text-gray-300 text-2xl"></i>
              </div>
              <button className="text-lg">
                Add Subjects
              </button>
              </div>
              <div
              onClick={() => {
                setActiveComponent("SeeALLStudents");
                setIsOpen(true);
              }}
              className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded"
              >
              <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
                <i className="ri-user-3-line text-gray-300 text-2xl"></i>
              </div>
              <button className="text-lg">
                See ALL Student
              </button>
              </div>
              <div
              onClick={() => {
                setActiveComponent("CreateSection");
                setIsOpen(true);
              }}
              className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded"
              >
              <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
                <i className="ri-layout-grid-line text-gray-300 text-2xl"></i>
              </div>
              <button className="text-lg">
                Create A Section
              </button>
              </div>
              <div
              onClick={() => {
                setActiveComponent("ChangeSemesterOrSection");
                setIsOpen(true);
              }}
              className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded"
              >
              <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
                <i className="ri-refresh-line text-gray-300 text-2xl"></i>
              </div>
              <button className="text-lg">
                Change Semester/Section
              </button>
              </div>
              <div
              onClick={() => {
                logout();
                }}
                className="flex gap-4 text-gray-300 hover:bg-gray-700 cursor-pointer p-1 rounded"
              >
                <div className="flex justify-center bg-gray-600 rounded-full w-10 h-10 items-center">
                <i className="ri-logout-box-r-line text-gray-300 text-2xl"></i>
                </div>
                <button className="text-lg">
                LOGOUT
                </button>
              </div>
        </div>

        {/* Right Content */}
        <div className="right w-full md:w-[75%] border-1  flex flex-col bg-gray-100">
          <div className="nav w-full h-20 flex items-center rounded-lg  justify-between  bg-white">
            <h1 className="text-lg sm:text-2xl  ml-4 sm:ml-10 font-semibold">
              Dashboard
            </h1>
            <div
              onClick={() =>{ setActiveComponent("AdminMenu"); setIsOpen(false); }}
              className={`${
                isOpen ? "flex" : "hidden"
              } items-center justify-center mr-1 sm:mr-10 p-2 px-6 rounded-4xl cursor-pointer bg-blue-500  text-white  left-8 top-6 hover:bg-blue-600`}
            >
              <i className="ri-arrow-left-line text-xl sm:text-3xl"></i>
              <span className="ml-2 text-md sm:text-xl">Back</span>
            </div>
            <div
              onClick={() =>{  logout(), setIsOpen(false); }}
              className={`${
                isOpen ? "hidden" : "flex"
              } items-center justify-center mr-1 sm:mr-10 p-2 px-6 rounded-4xl cursor-pointer bg-blue-500  text-white  left-8 top-6 hover:bg-blue-600`}
            >
              <i className="ri-arrow-left-line text-xl sm:text-3xl"></i>
              <span className="ml-2 text-md sm:text-xl">Log out</span>
            </div>
          </div>

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
          {activeComponent === "ChangeTeacherpassword" && (
            <ChangeTeacherpassword />
          )}
          {activeComponent === "ChangeStudentpassword" && (
            <ChangeStudentpassword />
          )}
          {activeComponent === "ChangeSemesterOrSection" && (
            <ChangeSemesterOrSection />
          )}
          {activeComponent === "MonitorAttendence" && <MonitorAttendence />}
        </div>
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
