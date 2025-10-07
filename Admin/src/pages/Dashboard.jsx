import {  useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios'
import toast from "react-hot-toast";
import { backendUrl } from "@/App";

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [student, setstudent] = useState([])
   const [batch, setbatch] = useState('')
    const [year, setyear] = useState('')
  const [section, setsection] = useState('')
 const [subjects, setsubjects] = useState([])
 const [singleSubject, setsingleSubject] = useState("")
 const [rollno, setrollno] = useState("")
const [teacher, setteacher] = useState("")
const [totalnoLec, settotalLecture] = useState({})
const [noofLecAttended, setlectureAttended] = useState({})
const [semester, setsemester] = useState('')
    
  
function formatDate(date) {
  return date.toLocaleDateString('en-CA');
}


 const showStudents = async ()=>{
    try {
     
        // console.log(localStorage.getItem('teacherToken'), localStorage.getItem('adminToken'));
        const responce = await axios.get(backendUrl + '/api/gelStudentBySection', {
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
            //  console.log(responce.data)
       // console.log(responce.data.findSection.students);
        if(responce.data.sucess === false){
            toast.error(responce.data.message)
            // console.log(responce.data.message)
        }
        else{
            // console.log(localStorage.getItem('teacherName'))
           setstudent(responce.data.findSection.students)
           setsubjects(responce.data.findSection.subjects)
           setsingleSubject(responce.data.findSection.subjects[0])
           setsemester(responce.data.findSection.semester)
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
        const response = await axios.post(backendUrl + '/api/markAttendance', {
            rollno: rollno,
            date: formatDate(selectedDate),
            subject: singleSubject,
            totalnoLec: totalnoLec[rollno],
            noofLecAttended: noofLecAttended[rollno],   
            batch,
            year,
            section,
            semester
        }, {
            headers: {
                teachertoken: localStorage.getItem('teacherToken'),
                adminToken: localStorage.getItem('adminToken'),
            },
        });
        // console.log(response.data);
        toast.success(response.data.message);
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "An error occurred while marking attendance.");
    }
 }

//    console.log(totalnoLec)
//  console.log(formatDate(selectedDate), totalnoLec, noofLecAttended, rollno);
 // console.log(sectonstudent);
return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col gap-6 p-4 sm:p-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
                <h1 className="text-2xl font-bold text-blue-700 mb-4">Subject Attendance</h1>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 mb-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-500">Faculty Name</span>
                        <span className="text-base font-semibold text-gray-700">{localStorage.getItem('teachername') || "Unknown Teacher"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-500">Subject</span>
                        <select
                            value={singleSubject}
                            onChange={(e) => setsingleSubject(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            {subjects && subjects.map((item, index) => (
                             
                                <option key={index}   value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-500">Year</span>
                        <select
                            value={year}
                            onChange={(e) => setyear(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="Ist">Ist</option>
                            <option value="IInd">IInd</option>
                            <option value="IIIrd">IIIrd</option>
                            <option value="IVth">IVth</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 mb-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-500">Section</span>
                        <input
                            type="text"
                            value={section}
                            onChange={(e) => setsection(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter Section"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-500">Batch</span>
                        <input
                            placeholder="Enter Starting Year"
                            value={batch}
                            onChange={(e) => setbatch(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <button
                        onClick={showStudents}
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        Find Students
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 overflow-x-auto">
                <div className="hidden sm:grid grid-cols-5 gap-4 pb-2 border-b">
                    <span className="text-sm font-semibold text-gray-600">Student ID</span>
                    <span className="text-sm font-semibold text-gray-600">Name</span>
                    <span className="text-sm font-semibold text-gray-600">Total Lecture</span>
                    <span className="text-sm font-semibold text-gray-600">Lecture Attended</span>
                    <span className="text-sm font-semibold text-gray-600">Action</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    {student && student.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 items-center border-b last:border-b-0 py-2"
                        >
                            <span className="text-sm text-gray-500">{item?.rollno}</span>
                            <span className="text-sm text-gray-500">{item?.name}</span>
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
                                className="border rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                                className="border rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                onClick={() => markAttendance(item?.rollno)}
                                className="bg-blue-500 text-white font-semibold rounded-lg px-4 py-1 hover:bg-blue-600 transition"
                            >
                                Mark
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-xl shadow-lg p-4 sm:p-8 flex flex-col items-center gap-6 mt-4 lg:mt-0">
            <h1 className="text-base font-semibold text-gray-700 mb-2">Select Date</h1>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                className="text-base font-semibold rounded-lg bg-gray-50 border-2"
            />
            <h2 className="mt-2 text-base font-semibold text-blue-700">
                Selected Date: {selectedDate.toDateString()}
            </h2>
            <div className="w-full bg-yellow-100 p-4 rounded-lg shadow flex flex-col items-center mt-4">
                <h1 className="text-2xl font-bold text-yellow-700">{student ? student.length : "00"}</h1>
                <p className="text-sm font-semibold text-gray-600">Total Students</p>
            </div>
            <div className="w-full bg-red-100 p-4 rounded-lg shadow flex flex-col items-center mt-4">
                <h1 className="text-2xl font-bold text-red-700">{subjects ? subjects.length : "00"}</h1>
                <p className="text-sm font-semibold text-gray-600">Total Subjects</p>
            </div>
            <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white font-semibold w-full mt-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Refresh Page
            </button>
        </div>
    </div>
);
}

export default Dashboard;