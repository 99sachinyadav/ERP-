import React from 'react'
 
 import { Teacher } from '../assets/assetes'
import { useNavigate } from 'react-router-dom'
const TeacherDashboard = () => {
    const navigate  = useNavigate();
    const logout = () => {
        localStorage.removeItem('teacherToken');
        navigate('/teacherlogin');
    }
  return (
    <div className='relative' >
          <div className="text-2xl text-center pt-8  border-t">
             <div onClick={()=>{logout()}}  className={` flex items-center w-30 sm:w-40 absolute py-2  sm:right-6 right-2 justify-center    p-2 px-4 rounded-4xl cursor-pointer bg-blue-500  text-white   m-1 top-6 hover:bg-blue-600`} >
            <i className="ri-arrow-left-line text-xl sm:text-3xl"></i><span className='ml-2 font-semibold text-xs sm:text-md'>LOG OUT</span>
        </div>
             <h1 className=" text-3xl sm:text-7xl   flex justify-center sm:mt-10 mt-18 font-bold  text-blue-900   text-wrap ">
                 Teacher <span className="text-red-500 ml-3"> Pannel</span>
              </h1>
          </div>
           <div className="flex  my-8 sm:ml-30 sm:gap-30 flex-col md:flex-row gap-30">
             <img src={Teacher} className="w-full md:max-w-[650px]  " alt="" />
             <div className="flex   flex-col  justify-center   gap-6  md:w-2/4  text-gray-600">
             <div className='flex gap-0 md:gap-1 '>
                 <div
          onClick={() => {
            navigate('/addSubjects')
          }}
          className="bg-orange-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-apps-2-add-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">Add Subjects</h1>
                </div>

         <div
          onClick={() => {
            navigate('/seeStudent')}}
          className="bg-yellow-200 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <i className="ri-graduation-cap-line text-5xl md:text-7xl"></i>
          <h1 className="text-lg md:text-xl font-semibold">See ALL Student</h1>
        </div>

             </div>
              <button className='bg-green-400 rounded-lg p-4 text-lg font-semibold md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105' onClick={() => navigate('/dashboard')}>MARK ATTENDANCE</button>
              </div>
             
           </div>
            <div className="text-2xl py-4">
                <h1 className=" text-3xl sm:text-3xl   flex justify-center sm:mt-10 mt-8 font-bold  text-blue-900   text-wrap ">
                 ACTIVITES <span className="text-red-500 ml-3">TO MONITOR </span>
              </h1>
            </div>
    
            <div className="flex flex-col md:flex-row text-sm mb-20">
                 <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                  <b>STUDENT MONITOR</b>
                  <p className="text-gray-600">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi</p>
                 </div>
                 <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                  <b>MARK ATTENDENCE:</b>
                  <p className="text-gray-600">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi</p>
                 </div>
                 <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                  <b>ADD SUBJECT :</b>
                  <p className="text-gray-600">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi</p>
                 </div>
            </div>
            
        </div>
  )
}

export default TeacherDashboard