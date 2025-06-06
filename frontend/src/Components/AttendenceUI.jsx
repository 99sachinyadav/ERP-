import  { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
const attendanceData = {
  "2025-05-01": "leave",
  "2025-05-02": "today",
  "2025-05-03": "today",
  "2025-05-05": "today",
  "2025-05-06": "today",
  "2025-05-07": "leave",
  "2025-05-08": "leave",
  // ...add more dates and statuses
};

const statusColors = {
  today: "bg-green-600",
  leave: "bg-yellow-400",
  absent: "bg-red-500",
  holiday: "bg-purple-400",
};





const AttendanceUI = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
    const [response, setresponce] = useState([]); // State to store fetched data
  // const [isOpen, setisOpen] = useState(false);

function formatDate(date) {
  return date.toLocaleDateString('en-CA');
}

  const getProfile = async (dateStr) => {
   
    try {
      //  console.log(localStorage.getItem("token"));
      const responce = await axios.get("http://localhost:4000/api/getStudentAttendance", {
        params: {
          date: dateStr,
        },
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      
      // console.log(responce.data);

      if(responce.data.sucess) {
        setresponce(responce.data.attendance);
        toast.success(responce.data.message);
      }
    
    } catch (error) {
      console.log(error); 
      toast.error(error.responce.data.message) 
    }
  };
 
   
  useEffect(() => {
    if (selectedDate) {
      const dateStr = formatDate(selectedDate);
        getProfile(dateStr)
    }
  }, [selectedDate]);
 

 
  // console.log(response);
  return (
 <div className="flex flex-col   sm:flex-row sm:justify-center gap-10   p-3 bg-gray-100">
       <div className={`w-full  bg-white rounded-xl shadow-2xl `}>
            <h1 className="text-center text-2xl sm:text-3xl mt-4 text-red-500 font-semibold">
              ATTENDANCE
            </h1>
            <div className="overflow-x-auto p-4">
              <table className="min-w-full border border-gray-200 rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left text-md sm:text-xl font-semibold">Subject</th>
                    <th className="py-3 px-4 text-left text-md sm:text-center sm:text-xl font-semibold">TOTAL LECTURE</th>
                    <th className="py-3 px-4 text-left text-md sm:text-center sm:text-xl font-semibold">LECTURE ATTENDED</th>
                  </tr>
                </thead>
                <tbody>
                  {response && response?.map((item) => (
                    <tr key={item.subject} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4 text-md sm:text-lg font-medium">{item.subject}</td>
                      <td className="py-2 px-4 text-md sm:text-lg text-center">{item.totalLecture}</td>
                      <td className="py-2 px-4 text-md sm:text-lg text-center">{item.lectureAttended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
       <div className="flex justify-center items-center">
           <div className="w-[370px] sm:w-[450px] gap-5 flex flex-col m-3  items-center bg-teal-400 rounded-lg shadow p-4">
      <h2 className="text-2xl sm:text-3xl text-blue-900 font-bold mb-2">Select Date</h2>
      <Calendar
      className='sm:w-[400px] h-[400px] rounded-lg  bg-blue-600'
        onChange={date => setSelectedDate(new Date(date))}
        value={selectedDate}
        tileContent={({ date}) => {
          const key = formatDate(date);
          const status = attendanceData[key];
          
          return status ? (
            <div className={`mx-auto mt-1 w-2 h-2 rounded-full ${statusColors[status]}`}></div>
          ) : null;
        }}
        tileClassName={({ date}) => {
          const key = formatDate(date);
          const status = attendanceData[key];
          if (status === "today") return "font-bold text-green-700";
          if (status === "leave") return "text-yellow-700";
          if (status === "absent") return "text-red-700";
          if (status === "holiday") return "text-purple-700";
          return "";
        }}
      />
    
      <div className="mt-4 text-gray-700 font-semibold">
        {selectedDate ? `Selected Date: ${formatDate(selectedDate)}` : "Please select a date"}
      </div>
    </div>
       </div>
 </div>
  );
};

export default AttendanceUI;