import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
const UpdateTeacher = () => {
     
  const Navigate = useNavigate()
  const [section, setsection] = useState("")
  const [year, setyear] = useState("")
  const [batch, setbatch] = useState("")
  const [newteacheremail, setnewteacheremail] = useState("")

  const updateTeacher = async (e)=>{
    e.preventDefault();
    // console.log(section,year,batch,newteacheremail)
    try {
       const responce = await axios.put('http://localhost:4000/api/updateTeacher',{
        section,
        year, 
        batch,
        newteacheremail
       },
      {
        headers:{
          adminToken:localStorage.getItem('adminToken')
        }
      })
       console.log(responce);
       if(responce.data.sucess){
        toast.success(responce.data.message)
        setsection("")
        setyear("")
        setbatch("")
        setnewteacheremail("")
       }
      
    } catch (error) {
       console.log(error);
       toast.error(error.response.data.message)
    }
  }


  return (
      
  <div className='flex  justify-center items-center h-screen bg-gray-100 relative'>
        <div className="flex flex-col   pb-20 sm:pb-50 items-center gap-5  bg-gray-100 ">
         <h1 className=" text-3xl sm:text-5xl    flex justify-center sm:mt-10  font-bold  text-blue-900   text-wrap ">
           Update  <span className="text-red-500 ml-3"> Teacher</span>
          </h1> 
       
        <form  className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">Section</label>
          <input value={section} onChange={(e)=>setsection(e.target.value)}  placeholder='Enter Your Section'   type="section" id="section" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="year">Year</label>
          <select value={year} onChange={(e)=>setyear(e.target.value)} className=' border border-gray-300 rounded-md p-1' >      
          <option value="Ist">1st Year</option>
          <option value="IInd">2nd Year</option>    
          <option value="IIIrd">3rd Year</option>
          <option value="IVth">4th Year</option>
          </select>

          <label className="text-gray-700 font-semibold" htmlFor="Batch">Batch</label>
          <input value={batch} onChange={(e)=>setbatch(e.target.value)} placeholder='Enter  Your Starting Year'   type="batch" id="password" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="Email">New Teacher Email</label>
          <input value={newteacheremail} onChange={(e)=>setnewteacheremail(e.target.value)} placeholder='Enter New Teacher Email here'   type="email" id="Email" className="border border-gray-300 rounded-md p-1" required />

          <button onClick={updateTeacher} type="submit" className="bg-blue-500 text-white font-semibold py-1 rounded-md hover:bg-blue-600">Update teacher</button>
 
        </form>

      </div>
  </div>
  )
}

export default UpdateTeacher 