import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { backendUrl } from '@/App';

const SeeAllStudent = () => {
//     const teachers = [
//   { name: "John Doe", email: "john.doe@example.com", section: "A", year: "2023" },
//   { name: "Jane Smith", email: "jane.smith@example.com", section: "B", year: "2022" },
//   { name: "Alice Johnson", email: "alice.johnson@example.com", section: "C", year: "2024" },
// ];

 const [section, setsection] = useState("")
 const [year, setyear] = useState("")
  const [batch, setbatch] = useState("")
  const [students, setstudents] = useState([])
  const [Attendance, setAttendance] = useState([]);
const getStudent = async ()=>{
   try {
    // console.log(localStorage.getItem('teacherToken'))
    const responce = await axios.get(backendUrl + '/api/gelStudentBySection',{
      params:{
        section,
        year,
        batch,
      },
       headers:{
        teachertoken:localStorage.getItem('teacherToken')? localStorage.getItem('teacherToken') : null,
        admintoken:localStorage.getItem('adminToken')? localStorage.getItem('adminToken') : null
      }
    }
     
    )
    // console.log(responce.data)
    if(responce.data.sucess){
      setstudents(responce.data.findSection.students)
         setAttendance(responce.data.attendance);
      toast.success(responce.data.message)
    }
   } catch (error) {
    console.log(error)
    toast.error(error.response.data.message)
   }
}
// console.log(students)
  return (
    <div className='flex flex-col '>
       <div className="grid grid-cols-4 items-center justify-items-center border border-gray-300 gap-4 p-4 bg-white rounded-lg shadow-md">
        <input
        value={section}
        onChange={(e)=>setsection(e.target.value)}
          placeholder='Enter your Section'
          type="text"
          className="border border-gray-300 rounded sm:w-40 px-3 w-20 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <select
        value={year}
        onChange={(e)=>setyear(e.target.value)}
          className="border border-gray-300 rounded sm:w-40 w-20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
           <option value="Ist">1st Year</option>
           <option value="IInd">2nd Year</option>
           <option value="IIIrd">3rd Year</option>
           <option value="IVth">4th Year</option>
        </select>
        <input
        value={batch}
        onChange={(e)=>setbatch(e.target.value)}
          placeholder='Enter Starting year here'
          type="text"
          className="border border-gray-300 rounded sm:w-40 w-20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
         <button onClick={()=>getStudent()} className='px-2 py-2 rounded-lg text-lg font-semibold text-white bg-blue-500 w-20 sm:w-40'>Track</button>
       </div>
      <table className="w-full border-collapse mt-5">
    <thead>
      <tr>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Name</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Email</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Father's Name</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">ROLL NO</th>
      </tr>
    </thead>
    <tbody>
      {students && students.map((student, idx) => (
        <tr key={idx} className="even:bg-gray-50">
          <td className="border border-gray-300 text-xs  sm:text-lg    sm:px-4 py-2">{student?.name}</td>
          <td className="border border-gray-300 text-xs  sm:text-lg    sm:px-4 py-2">{student?.email}</td>
          <td className="border border-gray-300 text-xs text-wrap  sm:text-lg  text-center   sm:px-4 py-2">{student?.father_name}</td>
          <td className="break-all whitespace-normal max-w-[120px] text-xs">{student?.rollno}</td>
        </tr>
      ))}
    </tbody>
  </table>
    </div>
  )
}

export default SeeAllStudent