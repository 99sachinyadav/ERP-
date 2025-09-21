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
    <div className="flex flex-col sm:flex-row-reverse bg-gradient-to-br from-amber-50 to-blue-50 items-center justify-between w-full gap-10 sm:gap-20 pt-8 pb-8 px-4 sm:px-10">
      {/* Image section */}
      <div className="flex justify-center items-center w-full sm:w-1/2 order-1 sm:order-none mb-6 sm:mb-0">
        <img
          className="h-90 sm:h-[500px] w-auto object-contain rounded-xl shadow-lg transition-all duration-300"
          src={welcome}
          alt="Welcome"
        />
      </div>
      {/* Text section */}
      <div className="flex flex-col w-full sm:w-1/2 p-4 order-2 sm:order-none">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-800 mb-2 transition-all duration-300">
          Hi, <span className="text-[#1a237e]   px-2 py-1 rounded font-semibold">{localStorage.getItem('studentname')}</span>!
        </h1>
        <h2 className="text-2xl sm:text-4xl font-bold text-blue-700 mb-4">
          Welcome to Attendance Portal
        </h2>
        <p className="text-base sm:text-xl text-gray-700 mb-6">
          Your one-stop solution for monitoring attendance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-8">
          <div
            className="cursor-pointer bg-gradient-to-r from-teal-400 to-blue-500 flex flex-col items-center justify-center text-lg sm:text-xl text-white rounded-xl w-full sm:w-48 h-32 shadow-lg hover:from-blue-500 hover:to-teal-400 transition-all duration-200 hover:scale-105"
            onClick={() => navigate("/attendance")}
          >
            <i className="ri-database-2-fill text-4xl sm:text-5xl mb-2"></i>
            <span>View Attendance</span>
          </div>
          <div
            className="cursor-pointer bg-gradient-to-r from-yellow-400 to-orange-500 flex flex-col items-center justify-center text-lg sm:text-xl text-white rounded-xl w-full sm:w-48 h-32 shadow-lg hover:from-green-500 hover:to-yellow-400 transition-all duration-200 hover:scale-105"
            onClick={() => navigate("/profile")}
          >
            <i className="ri-profile-line text-4xl sm:text-5xl mb-2"></i>
            <span>Go to Profile</span>
          </div>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg w-full sm:w-40 font-semibold shadow transition-all duration-200"
          onClick={logout}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Home