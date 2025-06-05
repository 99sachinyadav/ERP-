import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {welcome} from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
 

function Home() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  

  const logout =()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('studentname');
    navigate('/login');
  }


  return ( 
    <div className="flex w-full flex-col gap-20  sm:flex-row mt-10 mb-10 p-6  ">
      <div className="flex flex-col      w-full sm:w-1/2 p-4">
            <h1 className="sm:text-6xl text-3xl sm:mt-10 sm:ml-30 font-bold text-blue-800">Hii ! {localStorage.getItem('studentname')}</h1>
            <h1 className="sm:text-5xl text-3xl sm:mt-8 sm:ml-30 font-bold text-blue-800">Welcome to Attendance Portal</h1>
            <p className="mt-4 text-xl sm:text-2xl   sm:ml-30">Your one-stop solution for all Monitoring Attendance.</p>
            
             
        

            <div className="flex flex-col items-center sm:flex-row sm:mt-15 sm:ml-30 gap-4 sm:gap-10 mt-8">
              
              <div
                className="cursor-pointer bg-teal-500 flex  flex-col items-center justify-center text-xl text-white rounded-lg sm:w-60 sm:h-50 h-50 w-76 shadow hover:bg-blue-600 transition-transform hover:scale-105"
                onClick={() => navigate("/attendance")}
              >
                <i className="ri-database-2-fill text-5xl  sm:text-7xl"></i>
                View Attendance
              </div>
              <div
                className="cursor-pointer bg-yellow-500 flex flex-col items-center justify-center text-xl text-white sm:w-60 sm:h-50 rounded-lg  shadow hover:bg-green-600 h-50 w-76  transition-transform hover:scale-105"
                onClick={() => navigate("/profile")}
              >
                <i className="ri-profile-line text-5xl  sm:text-7xl"></i>
                Go to Profile
              </div>
            </div>
             <button className="bg-blue-500 ml-15 sm:ml-30 text-white py-2 px-4 rounded w-40 mt-10" onClick={() =>{ navigate("/"),logout()}}>Log Out</button>
        </div>
          <img className="h-80 sm:h-[600px]" src={welcome} alt="Welcome" />
        
    </div>
  )
}

export default Home