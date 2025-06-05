import React from 'react'
 
const AdminMenu = (props) => {
    
  return (
    <div>
      <div className="content flex flex-wrap   mt-8 md:mt-12 p-2 md:p-4 pb-8 md:pb-13 justify-center">
        <div
          onClick={() => {
            props.setActiveComponent('TeacherRegister');
            props.setIsOpen(true);
          }}
          className="bg-sky-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-2 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-registered-fill text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Register Teacher</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent('UpdateTeacher');
            props.setIsOpen(true);
            }}
            className="bg-indigo-200 rounded-lg p-4 h-55 w-70 sm:h-44 sm:w-44 md:h-60 md:w-60 text-center m-2 sm:m-4 md:m-8 flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
          >
            <i className="ri-presentation-line text-4xl sm:text-5xl md:text-7xl"></i>
            <h1 className="text-base sm:text-lg md:text-xl font-semibold">Update Teacher</h1>
          </div>
          <div
            onClick={() => {
            props.setActiveComponent('SeeALLTeachers');
            props.setIsOpen(true);
          }}
          className="bg-purple-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-2 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-presentation-fill text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">See ALL Teachers</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent('ChangeYear');
            props.setIsOpen(true);
          }}
          className="bg-teal-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-2 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-arrow-up-down-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Change Year</h1>
        </div>
      </div>
      <div className="content flex flex-wrap  mt-6 md:mt-8 p-2 md:p-4 pb-8 md:pb-18 justify-center">
        <div
          onClick={() => {
            props.setActiveComponent('AddSubjects');
            props.setIsOpen(true);
          }}
          className="bg-orange-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-apps-2-add-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Add Subjects</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent('SeeALLStudents');
            props.setIsOpen(true);
          }}
          className="bg-yellow-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-graduation-cap-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">See ALL Student</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent('CreateSection');
            props.setIsOpen(true);
          }}
          className="bg-green-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-book-shelf-fill text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Create A Section</h1>
        </div>
        <div
          onClick={() => {
            props.setActiveComponent('Dashboard');
            props.setIsOpen(true);
          }}
          className="bg-rose-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-stack-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Mark Attendance</h1>
        </div>
      </div>
    </div>
  );
}

export default AdminMenu