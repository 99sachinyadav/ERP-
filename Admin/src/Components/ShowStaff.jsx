import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { backendUrl } from '@/App';
import ModuleState from './ui/module-state';    
import { useEffect } from 'react';

export const ShowStaff = () => {

    
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
     

const getStaff = async()=>{
         try{
            setLoading(true);
         const responce = await  axios.get(backendUrl + '/api/getStaff',{
            headers:{
                teachertoken:localStorage.getItem('teacherToken')? localStorage.getItem('teacherToken') : null,}} )
            console.log(responce.data)
            if(responce.data.success){
                setStaff(responce.data.staffMembers);
                setLoading(false);
                
                toast.success(responce.data.message)
            }
            console.log(staff)
         }
catch(error){
    console.log(error)
    const msg = error.response?.data?.message || "Unable to fetch staff.";
    setErrorMessage(msg);
    toast.error(msg);
   }
    }
    useEffect(()=>{
        getStaff();
    },[])
      
  return (
    <div className="mt-5">
        {loading ? (
          <ModuleState type="loading" title="Fetching staff" />
        ) : errorMessage ? (
          <ModuleState
            type="error"
            title="Unable to fetch staff"
            message={errorMessage}
            actionLabel="Retry"
            onAction={getStaff}
          />
        ) : 
          (
      <table className="w-full border-collapse mt-5">
    <thead>
      <tr>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Name</th>
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">Email</th>
 
        <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">Role</th>
      </tr>
    </thead>
    <tbody>
      {staff && staff.map((member, idx) => (
        <tr key={idx} className="even:bg-gray-50">
          <td className="border border-gray-300 text-xs  sm:text-lg    sm:px-4 py-2">{member?.name}</td>
          <td className="border border-gray-300 text-xs  sm:text-lg    sm:px-4 py-2">{member?.email}</td>
 
          <td className="border border-gray-300 text-xs  sm:text-lg    sm:px-4 py-2">{member?.role}</td>
        </tr>
      ))}
    </tbody>
  </table>
        )}
      </div> 
 
  )
}
