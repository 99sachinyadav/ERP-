import {  useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios'
import toast from "react-hot-toast";

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [student, setstudent] = useState([])
   const [batch, setbatch] = useState('')
    const [year, setyear] = useState('')
  const [section, setsection] = useState('')
 const [subjects, setsubjects] = useState([])
 const [singleSubject, setsingleSubject] = useState('')
 const [rollno, setrollno] = useState("")
const [teacher, setteacher] = useState("")
const [totalnoLec, settotalLecture] = useState({})
const [noofLecAttended, setlectureAttended] = useState({})
    
  
function formatDate(date) {
  return date.toLocaleDateString('en-CA');
}


 const showStudents = async ()=>{
    try {
     
        // console.log(localStorage.getItem('teacherToken'), localStorage.getItem('adminToken'));
        const responce = await axios.get('http://localhost:4000/api/gelStudentBySection', {
            headers: {
                teachertoken: localStorage.getItem('teacherToken')? localStorage.getItem('teacherToken') : null,
                // adminToken: localStorage.getItem('adminToken')? localStorage.getItem('adminToken') : null,
            },
            params: {
                year: year,
                batch: batch,
                section: section,
            },
        });
             console.log(responce.data)
       // console.log(responce.data.findSection.students);
        if(responce.data.sucess === false){
            toast.error(responce.data.message)
            console.log(responce.data.message)
        }
        else{
           setstudent(responce.data.findSection.students)
           setsubjects(responce.data.findSection.subjects)
           setteacher(responce.data.findSection.teacher?.name || "Unknown Teacher")
           toast.success(responce.data.message)
        }
        

    } catch (error) {
          // Check if the error has a response and a message
        // console.error(error);
        toast.error(error.response?.data?.message || "An error occurred while fetching students.");
    }
 }

 const markAttendance = async (rollno) => {
    try {
        // console.log(localStorage.getItem('teacherToken'), localStorage.getItem('adminToken'));
        const response = await axios.post('http://localhost:4000/api/markAttendance', {
            rollno: rollno,
            date: formatDate(selectedDate),
            subject: singleSubject,
            totalnoLec: totalnoLec[rollno],
            noofLecAttended: noofLecAttended[rollno],   
        }, {
            headers: {
                teachertoken: localStorage.getItem('teacherToken'),
                adminToken: localStorage.getItem('adminToken'),
            },
        });
        console.log(response.data);
        toast.success(response.data.message);
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "An error occurred while marking attendance.");
    }
 }

//  console.log(formatDate(selectedDate), totalnoLec, noofLecAttended, rollno);
 // console.log(sectonstudent);
 return (
    <div className="bg-gray-100 flex flex-col lg:flex-row min-h-screen">
        <div className="left flex flex-col m-2 sm:m-4 md:m-6 lg:m-8 gap-4 w-full lg:w-[65%]">
            <div className="rounded-md bg-white p-3 sm:p-4 md:p-6 lg:p-8">
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">Subject Attendance</h1>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 md:gap-16 lg:gap-20 m-2 sm:m-4">
                    <div className="flex flex-col gap-1 sm:gap-2">
                        <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">Faculty Name</h1>
                        <h1 className="text-xs sm:text-sm md:text-base font-semibold">{teacher || "Unknown Teacher"}</h1>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2">
                        <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">Subject</h1>
                        <select value={singleSubject} onChange={(e) => setsingleSubject(e.target.value)} className="text-xs sm:text-sm md:text-base font-semibold border-2 w-full sm:w-24 md:w-28">
                            {subjects && subjects.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2">
                        <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">Year</h1>
                        <select value={year} onChange={(e) => setyear(e.target.value)} className="text-xs sm:text-sm md:text-base font-semibold border-2 w-full sm:w-24 md:w-28">
                            <option id="first_year" value="Ist">Ist</option>
                            <option id="second_year" value="IInd">IInd</option>
                            <option id="third_year" value="IIIrd">IIIrd</option>
                            <option id="fourth_year" value="IVth">IVth</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 md:gap-16 lg:gap-20 m-2 sm:m-4">
                    <div className="flex flex-col gap-1 sm:gap-2">
                        <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">Section</h1>
                        <input type="text" value={section} onChange={(e) => setsection(e.target.value)} className="text-xs sm:text-sm md:text-base pl-2 border-2 px-2 font-semibold w-full sm:w-24 md:w-28 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Section" />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2">
                        <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">Batch</h1>
                        <input placeholder="Enter Starting Year" value={batch} onChange={(e) => setbatch(e.target.value)} className="text-xs sm:text-sm md:text-base border-2 px-2 w-full sm:w-24 md:w-28 font-semibold bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={() => showStudents()} className="bg-blue-500 text-white font-semibold w-full sm:w-32 md:w-40 h-10 md:h-11 lg:h-12 mt-2 sm:mt-4 px-2 rounded-md hover:bg-blue-600 transition">
                        Find Students
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-2 bg-white rounded-md p-3 sm:p-4 ">
                <div className="hidden sm:flex flex-wrap gap-8 md:gap-22  p-2 md:p-3">
                    <h1 className="text-xs sm:text-sm md:text-base font-semibold w-24">Student ID</h1>
                    <h1 className="text-xs sm:text-sm md:text-base font-semibold w-32 sm:text-left text-center">Name</h1>
                    <h1 className="text-xs sm:text-sm md:text-base font-semibold w-32 sm:text-left text-center">Total Lecture</h1>
                    <h1 className="text-xs sm:text-sm md:text-base font-semibold w-32  sm:text-left text-center">Lecture Attended</h1>
                </div>
                {student &&
                    student.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row flex-wrap justify-between items-center p-2 gap-2 sm:gap-4 border-b last:border-b-0">
                            <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400 w-full sm:w-24">{item?.rollno}</h1>
                            <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-400 w-full sm:w-32">{item?.name}</h1>
                            <input
                                type="number"
                                onClick={() => setrollno(item?.rollno)}
                                value={totalnoLec[item?.rollno] || ""}
                                onChange={(e) =>
                                    settotalLecture((prev) => ({
                                        ...prev,
                                        [item?.rollno]: e.target.value,
                                    }))
                                }
                                placeholder="Total lectures"
                                className="text-xs sm:text-sm md:text-base font-semibold rounded-md px-2 bg-gray-100 w-full sm:w-32  border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                onClick={() => setrollno(item?.rollno)}
                                value={noofLecAttended[item?.rollno] || ""}
                                onChange={(e) =>
                                    setlectureAttended((prev) => ({
                                        ...prev,
                                        [item?.rollno]: e.target.value,
                                    }))
                                }
                                placeholder="Attended"
                                className="text-xs sm:text-sm md:text-base font-semibold rounded-md px-2 bg-gray-100 w-full sm:w-32  border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={() => markAttendance(item?.rollno)} className="w-full sm:w-24 bg-blue-500 text-white font-semibold rounded-md mt-2 sm:mt-0">Mark</button>
                        </div>
                    ))}
            </div>
        </div>
        <div className="right flex flex-col items-center m-2 sm:m-4 md:m-6 lg:m-8 p-3 sm:p-4 md:p-6 lg:p-8 w-full lg:w-[25%] bg-white rounded-lg shadow-md">
            <h1 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-4">Select Date</h1>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                className="text-xs sm:text-sm md:text-base font-semibold rounded-md px-2 bg-gray-100 border-2"
            />
            <h2 className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-base font-semibold">
                Selected Date: {selectedDate.toDateString()}
            </h2>
            <div className="mt-4 sm:mt-8 w-full bg-yellow-200 p-3 sm:p-4 rounded-lg shadow-md flex flex-col items-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-700">{student ? student.length : "00"}</h1>
                <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-600">Total Students</p>
            </div>
            <div className="mt-4 sm:mt-8 w-full bg-red-200 p-3 sm:p-4 rounded-lg shadow-md flex flex-col items-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-700">{subjects ? subjects.length : "00"}</h1>
                <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-600">Total Subjects</p>
            </div>
           <button
  onClick={() => window.location.reload()}
  className="bg-blue-500 text-white font-semibold w-full mt-4 sm:mt-10 h-10 md:h-11 lg:h-12 rounded-md hover:bg-blue-600 transition"
>
  Refresh Page
</button>
        </div>
    </div>
);
}

export default Dashboard;