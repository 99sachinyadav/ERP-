import React, { useState } from 'react';
import TeacherRegister from './TeacherRegister';
 
import 'remixicon/fonts/remixicon.css'
import AdminMenu from '../Components/AdminMenu';
import SeeALLTeachers from '../Components/SeeALLTeachers';
import SeeAllStudent from '../Components/SeeAllStudent';
import UpdateTeacher from '../Components/UpdateTeacher';
import CreateSection from '../Components/CreateSection';
import ChangeYear from '../Components/ChangeYear';
import AddSubjects from '../Components/AddSubjects';
import MonitorAttendence from '../Components/MonitorAttendence';
import Dashboard from './Dashboard';
import ChangeTeacherpassword from '../Components/ChangeTeacherpassword';
import ChangeStudentpassword from '../Components/ChangeStudentpassword';
 import { useNavigate } from 'react-router-dom';
const Home = () => {
   
  const [activeComponent, setActiveComponent] = useState('AdminMenu');
  const [isOpen, setIsOpen] = useState(false); 
 const navigate = useNavigate();
    const logout =()=>{
    localStorage.removeItem('adminToken');
   
    navigate('/');
  }

  
  return (
    <div className="flex ">
      {/* Left Sidebar */}
      <div className="left hidden pt-5 w-[25%] border-2 sm:flex flex-col gap-10 bg-gradient-to-br from-zinc-900 via-neutral-800 to-slate-900 text-white p-8 rounded-lg">
        
       <div className="p-2 flex items-center">
           <div className='flex justify-center bg-white rounded-full w-20 h-20 items-center ml-3'> 
           <i className="ri-admin-line text-black   text-5xl text-center "></i>
           
        </div>
        <h1 className='text-2xl ml-10 font-semibold'>Admin Pannel</h1>
       </div>
        
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
           onClick={()=>{setActiveComponent("TeacherRegister"),setIsOpen(true)}}
        >
           Register Teacher
        </button>
        <button
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          onClick={()=>{setActiveComponent("UpdateTeacher"),setIsOpen(true)}}
        >
          Update Teacher
        </button>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          onClick={()=>{setActiveComponent("SeeALLTeachers"),setIsOpen(true)}}
        >
         See ALL Teachers
        </button>
        <button
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => {setActiveComponent("ChangeYear"),setIsOpen(true)}}
        >
          Change Year
        </button>
        <button
          className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-green-600"
          onClick={() => {setActiveComponent("AddSubjects"),setIsOpen(true)}}
        >
          Add Subjects
        </button>
        <button
          className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-red-600"
          onClick={() => {setActiveComponent("SeeALLStudents"),setIsOpen(true)}}
        >
          See ALL Student
        </button>
        <button
          className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-green-600"
          onClick={() => {setActiveComponent("CreateSection"),setIsOpen(true)}}
        >
          Create A Section
        </button>
        <button
          className="bg-rose-500 text-white py-2 px-4 rounded hover:bg-red-600"
          onClick={() => {setActiveComponent('Dashboard'),setIsOpen(true)}}
        >
          Mark Attendance
        </button>
        <button
          className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-600"
          onClick={()=>{logout()}}
        >
          LOGOUT
        </button>
      </div>

      {/* Right Content */}
      <div className="right w-full sm:w-[75%] border-2  flex flex-col bg-gray-100">
       <div className="nav w-full h-20 flex items-center rounded-lg  justify-between  bg-white">
           <h1 className='text-lg sm:text-2xl  ml-4 sm:ml-10 font-semibold'>Dashboard</h1>
              <div  onClick={() => setActiveComponent("AdminMenu")} className={`${isOpen ? "flex" : "hidden"} items-center justify-center mr-2 sm:mr-10 p-2 px-6 rounded-4xl cursor-pointer bg-blue-500  text-white  left-8 top-6 hover:bg-blue-600`} >
            <i className="ri-arrow-left-line text-xl sm:text-3xl"></i><span className='ml-2 text-md sm:text-xl'>Back</span>
        </div>
       </div>

  {activeComponent === 'AdminMenu' && <AdminMenu setActiveComponent={setActiveComponent}  setIsOpen={setIsOpen} isOpen={isOpen} />}
   {activeComponent === 'TeacherRegister' && <TeacherRegister   />}
   {activeComponent === 'UpdateTeacher' && <UpdateTeacher   />}
   {activeComponent === 'SeeALLTeachers'  && <SeeALLTeachers/>}
   {activeComponent === 'SeeALLStudents'  && <SeeAllStudent />}
   {activeComponent === 'CreateSection'  && <CreateSection    />}
   {activeComponent === 'ChangeYear'  && <ChangeYear     />}
   {activeComponent === 'AddSubjects'  && <AddSubjects   />}
   {activeComponent=== 'ChangeTeacherpassword'  && <ChangeTeacherpassword />}            
   {activeComponent=== 'ChangeStudentpassword'  && <ChangeStudentpassword />}           
   {activeComponent === 'Dashboard'  && <Dashboard/>}
   {activeComponent === 'MonitorAttendence'  && <MonitorAttendence/>}

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