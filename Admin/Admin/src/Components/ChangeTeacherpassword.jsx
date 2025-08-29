import React from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
const ChangeTeacherpassword = () => {
   const [teacheremail, setemail] = useState('');
     const [newPassword, setpassword] = useState('')
  const handleSubmit = async (e) => {
    
     e.preventDefault();

     try {
       const responce = await axios.put('http://localhost:4000/api/updateTeacherPassword',{
       teacheremail,
       newPassword
       },{
        headers:{
          adminToken:localStorage.getItem('adminToken')
        }
       })
      //  console.log(responce)
          if(responce.data.sucess){
        toast.success(responce.data.message)
        setemail("");
        setpassword("");
       }
     } catch (error) {
        console.log(error)
             toast.error(error.response.data.message)
     }
  }
return (
  <div className='flex  justify-center items-center h-screen bg-gray-100 relative'>
        <div className="flex flex-col   pb-20 sm:pb-50 items-center gap-5  bg-gray-100 ">
         <h1 className=" text-2xl sm:text-4xl    flex justify-center sm:mt-10  font-bold  text-blue-900   text-wrap ">
          Change Teacher <span className="text-red-500 ml-3">Password</span>
          </h1> 
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">Email</label>
          <input value={teacheremail} onChange={(e)=>setemail(e.target.value)} placeholder='Enter Your Email' type="email" id="section" className="border border-gray-300 rounded-md p-1 py-2" required />

          <label className="text-gray-700 font-semibold" htmlFor="Batch"> New Password</label>
          <input value={newPassword} onChange={(e)=>setpassword(e.target.value)} placeholder='Enter a New Password'   type="password" id="password" className="border border-gray-300 rounded-md p-1 py-2" required />

          <button  type="submit" className="bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600">Change</button>
 
        </form>

      </div>
  </div>
)
}
export default ChangeTeacherpassword