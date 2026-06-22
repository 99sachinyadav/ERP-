import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { backendUrl } from '@/App';
import ModuleState from './ui/module-state';
const SeeALLTeachers = () => {
   const [teachers, setteachers] = useState([])
   const [loading, setLoading] = useState(true);
   const [errorMessage, setErrorMessage] = useState("");
   const getCurrentSemesterSubjects = (sec) => {
     const semesterPrefix = `${sec?.semester || ""}_`;
     return (sec?.subjects || [])
       .filter((subj) => String(subj || "").startsWith(semesterPrefix))
       .map((subj) => String(subj || "").replace(semesterPrefix, ""));
   };
//   const teachers = [
//   { name: "John Doe", email: "john.doe@example.com", section: "A", year: "2023" },
//   { name: "Jane Smith", email: "jane.smith@example.com", section: "B", year: "2022" },
//   { name: "Alice Johnson", email: "alice.johnson@example.com", section: "C", year: "2024" },
// ];

 const getAllTeacher = async ()=>{
       setLoading(true);
       setErrorMessage("");
       try {

        const responce = await axios.get(backendUrl + '/api/getAllTeacher',
          {
            headers:{
              adminToken : localStorage.getItem('adminToken')
            }
          }
        )
        // console.log(responce.data)
         if(responce.data.sucess){
          setteachers(responce.data.findAllTeacher)
        } else {
          setteachers([]);
          setErrorMessage(responce.data.message || "Unable to load teachers.");
         }
        
       } catch (error) {
         console.log(error)
         const msg = error.response?.data?.message || "Unable to load teachers.";
         setErrorMessage(msg);
         toast.error(msg);
       } finally {
         setLoading(false);
       }
    
 }

 useEffect(()=>{
    getAllTeacher()
 },[])
//  console.log(teachers)
  if (loading) {
    return <div className="mt-5"><ModuleState type="loading" title="Loading teachers" /></div>;
  }

  if (errorMessage) {
    return (
      <div className="mt-5">
        <ModuleState
          type="error"
          title="Unable to fetch teacher list"
          message={errorMessage}
          actionLabel="Retry"
          onAction={getAllTeacher}
        />
      </div>
    );
  }

  if (!teachers?.length) {
    return (
      <div className="mt-5">
        <ModuleState
          type="empty"
          title="No teachers available"
          message="Teacher records will appear here once added."
        />
      </div>
    );
  }

  return (
 <table className="w-full border-collapse mt-5">
    <thead>
      <tr>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Name</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Email</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Section</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Batch Assigned</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Semester</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Subjects</th>
      </tr>
    </thead>
    <tbody>
      {teachers && teachers.map((teacher, idx) => (
        <tr key={idx} className="even:bg-gray-50">
          <td className="border border-gray-300 text-sm  sm:text-lg    sm:px-4 py-2">{teacher?.name}</td>
          <td className="border border-gray-300 text-sm  sm:text-lg    sm:px-4 py-2">{teacher?.email}</td>
          <td className="border border-gray-300 text-sm  sm:text-lg  text-center   sm:px-4 py-2">
               <div className='flex flex-col'>
                {teacher?.section?.map((sec,idx)=>(
                <h3 key={idx}> {sec.name.split("_")[0]}</h3>
            ))}
           </div>
          </td>
          <td className="border border-gray-300 text-sm  sm:text-lg  text-center  sm:px-4 py-2">    <div className='flex flex-col'>
                {teacher?.section?.map((sec,idx)=>(
                <h3 key={idx}> {sec.name.split("_")[1]}</h3>
            ))}
           </div>
           </td>
          <td className="border border-gray-300 text-sm  sm:text-lg  text-center  sm:px-4 py-2">
            <div className='flex flex-col'>
              {teacher?.section?.map((sec,idx)=>(
                <h3 key={idx}> {sec?.semester || "-"}</h3>
              ))}
            </div>
          </td>
          <td className="border border-gray-300 text-sm sm:text-lg text-center sm:px-4 py-2">
            <div className="flex flex-col gap-3">
              {teacher?.section?.map((sec, idx) => {
                const currentSubjects = getCurrentSemesterSubjects(sec);
                return (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Section {sec?.name?.split("_")[0]} | Batch {sec?.name?.split("_")[1]}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {currentSubjects.length ? (
                      currentSubjects.map((subj) => (
                        <span
                          key={`${sec?.name}-${subj}`}
                          className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                        >
                          {subj}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No subjects assigned</span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  )
}
 

 
 

 
export default SeeALLTeachers
