import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const SeeALLTeachers = () => {
   const [teachers, setteachers] = useState([])
//   const teachers = [
//   { name: "John Doe", email: "john.doe@example.com", section: "A", year: "2023" },
//   { name: "Jane Smith", email: "jane.smith@example.com", section: "B", year: "2022" },
//   { name: "Alice Johnson", email: "alice.johnson@example.com", section: "C", year: "2024" },
// ];

 const getAllTeacher = async ()=>{
        
       try {

        const responce = await axios.get('http://localhost:4000/api/getAllTeacher',
          {
            headers:{
              adminToken : localStorage.getItem('adminToken')
            }
          }
        )
        // console.log(responce.data)
         if(responce.data.sucess){
          setteachers(responce.data.findAllTeacher)
          toast.success(responce.data.message)
         }
        
       } catch (error) {
         console.log(error)
         toast.error(error.response.data.message)
       }
    
 }

 useEffect(()=>{
    getAllTeacher()
 },[])
//  console.log(teachers)
  return (
 <table className="w-full border-collapse mt-5">
    <thead>
      <tr>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Name</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Email</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Section</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Batch Assigned</th>
      </tr>
    </thead>
    <tbody>
      {teachers && teachers.map((teacher, idx) => (
        <tr key={idx} className="even:bg-gray-50">
          <td className="border border-gray-300 text-sm  sm:text-lg    sm:px-4 py-2">{teacher?.name}</td>
          <td className="border border-gray-300 text-sm  sm:text-lg    sm:px-4 py-2">{teacher?.email}</td>
          <td className="border border-gray-300 text-sm  sm:text-lg  text-center   sm:px-4 py-2">
               <div className='flex flex-col'>
                {teacher?.section.map((sec,idx)=>(
                <h3 key={idx}> {sec.name.split("_")[0]}</h3>
            ))}
           </div>
          </td>
          <td className="border border-gray-300 text-sm  sm:text-lg  text-center  sm:px-4 py-2">    <div className='flex flex-col'>
                {teacher?.section.map((sec,idx)=>(
                <h3 key={idx}> {sec.name.split("_")[1]}</h3>
            ))}
           </div>
           </td>
        </tr>
      ))}
    </tbody>
  </table>
  )
}
 

 
 

 
export default SeeALLTeachers