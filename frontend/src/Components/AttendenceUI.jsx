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
    const [semester, setSemester] = useState("");
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
      
      console.log(responce.data);

      if(responce.data.sucess) {
        setresponce(responce.data.attendance);
        setSemester(responce.data.semester)
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
 

 
  console.log(semester);
return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-purple-100 py-8 px-2">
    <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-8 md:gap-12 items-center justify-center">
      {/* Attendance Table */}
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-center text-3xl md:text-4xl font-bold text-teal-700 mb-6 tracking-wide">
          Attendance
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-teal-50">
                <th className="py-3 px-4 text-left text-lg md:text-xl font-semibold text-teal-800">Subject</th>
                <th className="py-3 px-4 text-center text-lg md:text-xl font-semibold text-teal-800">Total Lecture</th>
                <th className="py-3 px-4 text-center text-lg md:text-xl font-semibold text-teal-800">Lecture Attended</th>
              </tr>
            </thead>
            <tbody>
              {response && response.map(item => (
                item.subject.includes(semester) && (
                  <tr key={item.subject} className="border-t hover:bg-teal-50 transition">
                    <td className="py-2 px-4 text-md md:text-lg font-medium">{item.subject}</td>
                    <td className="py-2 px-4 text-md md:text-lg text-center">{item.totalLecture}</td>
                    <td className="py-2 px-4 text-md md:text-lg text-center">{item.lectureAttended}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Calendar Section */}
      <div className="w-full md:w-1/3 flex flex-col items-center bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl text-teal-700 font-bold mb-4">Select Date</h2>
        <Calendar
          className="w-full max-w-xs md:max-w-sm rounded-lg bg-blue-50 shadow"
          onChange={date => setSelectedDate(new Date(date))}
          value={selectedDate}
          tileContent={({ date }) => {
            const key = formatDate(date);
            const status = attendanceData[key];
            return status ? (
              <div className={`mx-auto mt-1 w-2 h-2 rounded-full ${statusColors[status]}`}></div>
            ) : null;
          }}
          tileClassName={({ date }) => {
            const key = formatDate(date);
            const status = attendanceData[key];
            if (status === "today") return "font-bold text-green-700";
            if (status === "leave") return "text-yellow-700";
            if (status === "absent") return "text-red-700";
            if (status === "holiday") return "text-purple-700";
            return "";
          }}
        />
        <div className="mt-6 text-gray-700 font-semibold text-center text-lg">
          {selectedDate ? `Selected Date: ${formatDate(selectedDate)}` : "Please select a date"}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="flex items-center gap-1 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span> Present
          </span>
          <span className="flex items-center gap-1 text-sm">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span> Leave
          </span>
          <span className="flex items-center gap-1 text-sm">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Absent
          </span>
          <span className="flex items-center gap-1 text-sm">
            <span className="w-3 h-3 rounded-full bg-purple-400 inline-block"></span> Holiday
          </span>
        </div>
      </div>
    </div>
  </div>
);
};

export default AttendanceUI;