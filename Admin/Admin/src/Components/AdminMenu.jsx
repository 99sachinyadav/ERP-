import React from "react";
 

const AdminMenu = (props) => {

  
  return (
    <div className =" "  >
      <div
        className="content flex flex-wrap mt-8 md:mt-2 p-2 md:p-0 pb-8 md:pb-1 justify-center">
        <div
          onClick={() => {
            props.setActiveComponent("TeacherRegister");
            props.setIsOpen(true);
          }}
          className="bg-sky-200 rounded-lg p-4 sm:p-0 h-55 w-70 md:h-60 md:w-60 text-center m-2 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-registered-fill text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Register Teacher</h1>
        </div>

        <div
          onClick={() => {
            props.setActiveComponent("UpdateTeacher");
            props.setIsOpen(true);
          }}
          className="bg-indigo-200 rounded-lg p-4 sm:p-0 h-55 w-70 sm:h-44 sm:w-44 md:h-60 md:w-60 text-center m-2 sm:m-4 md:m-8 flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-presentation-line text-4xl sm:text-5xl md:text-7xl"></i>
          <h1 className="text-base sm:text-lg md:text-xl font-semibold">
            Update Teacher
          </h1>
        </div>

        <div
          onClick={() => {
            props.setActiveComponent("SeeALLTeachers");
            props.setIsOpen(true);
          }}
          className="bg-purple-200 rounded-lg p-4 sm:p-0 h-55 w-70 md:h-60 md:w-60 text-center m-2 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-presentation-fill text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">See ALL Teachers</h1>
        </div>

        <div
          onClick={() => {
            props.setActiveComponent("ChangeYear");
            props.setIsOpen(true);
          }}
          className="bg-teal-200 rounded-lg p-4 sm:p-0 h-55 w-70 md:h-60 md:w-60 text-center m-2 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-arrow-up-down-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Change Year</h1>
        </div>
      </div>

      <div className="content flex flex-wrap   md:mt-0 p-2 md:p-2 pb-8 md:pb-0 justify-center">
        <div
          onClick={() => {
            props.setActiveComponent("AddSubjects");
            props.setIsOpen(true);
          }}
          className="bg-orange-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-apps-2-add-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Add Subjects</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent("SeeALLStudents");
            props.setIsOpen(true);
          }}
          className="bg-yellow-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-graduation-cap-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">See ALL Student</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent("CreateSection");
            props.setIsOpen(true);
          }}
          className="bg-green-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-book-shelf-fill text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Create A Section</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent("Dashboard");
            props.setIsOpen(true);
          }}
          className="bg-rose-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-stack-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Mark Attendance</h1>
        </div>
      </div>

      <div className=" content sm:ml-27 w-full flex flex-wrap gap-0 sm:gap-17 sm:flex-row  mt-0 md:mt-2 p-2 md:p-4 pb-8 md:pb-1  flex-col  items-center">
        <div    onClick={
          ()=>{props.setActiveComponent("MonitorAttendence")
          props.setIsOpen(true)}
        } className="flex flex-col gap-0 h-55 w-70 md:h-60 md:w-60">
          <div className="bg-[#3b5998] rounded-t-lg rounded-b-none p-4 flex flex-col items-center">
            <i className="ri-stack-line text-white text-4xl mb-2"></i>
          </div>
          <div className="bg-[#e0e7ff] h-20 rounded-b-lg rounded-t-none p-4 flex flex-col items-center">
            <h1 className="text-md font-semibold">Monitor Attendance</h1>
          </div>
        </div>

           <div  onClick={()=>{props.setActiveComponent("ChangeTeacherpassword"), props.setIsOpen(true)}} className="flex flex-col gap-0 h-55 w-70 md:h-60 md:w-60">
            <div className="bg-[#ed8f42] rounded-t-lg rounded-b-none p-4 flex flex-col items-center">
              <i className="ri-lock-unlock-line text-white text-4xl mb-2"></i>
            </div>
            <div className="bg-[#e0e7ff] h-20 rounded-b-lg rounded-t-none p-4 flex flex-col items-center">
              <h1 className="text-md font-semibold">Change Teacher Password</h1>
            </div>


          </div>

           <div  onClick={()=>{props.setActiveComponent("ChangeStudentpassword"), props.setIsOpen(true)}} className="flex flex-col gap-0 h-55 w-70 md:h-60 md:w-60">
            <div className="bg-[#0fe4f3] rounded-t-lg rounded-b-none p-4 flex flex-col items-center">
              <i className="ri-lock-unlock-line text-white text-4xl mb-2"></i>
            </div>
            <div className="bg-[#e0e7ff] h-20 rounded-b-lg rounded-t-none p-4 flex flex-col items-center">
              <h1 className="text-md font-semibold">Change Student Password</h1>
            </div>
          </div>


      </div>
    </div>
  );
};

export default AdminMenu;
