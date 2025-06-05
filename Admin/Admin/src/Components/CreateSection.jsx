import React from 'react'
import toast from 'react-hot-toast';
import  { useState } from 'react'
import axios from 'axios'
const CreateSection = () => {
      
  const [section, setsection] = useState("")
  const [year, setyear] = useState("")
  const [batch, setbatch] = useState("")
   const [teacheremail, setteacheremail] = useState("")
  const createSection = async (e)=>{
    e.preventDefault();
     try {
        const responce =  await axios.post('http://localhost:4000/api/createSection',{
          section,
          year,
          batch,
          teacheremail
        },
        {
          headers:{
            adminToken:localStorage.getItem('adminToken')
          }
        }
        )
        //  console.log(responce)
        if(responce.data.sucess){
          toast.success(responce.data.message)
          setsection("")
          setyear("")
          setbatch("")
          setteacheremail("")
        }
      } catch (error) {
        console.log(error)
        toast.error(error.response.data.message)
      }
  }
  return (
      <div className='flex  justify-center items-center h-screen bg-gray-100 relative'>
        <div className="flex flex-col   pb-20 sm:pb-50 items-center   bg-gray-100 ">
         <h1 className=" text-3xl sm:text-5xl    flex justify-center sm:mt-10  font-bold  text-blue-900   text-wrap ">
           Create New <span className="text-red-500 ml-3"> Section</span>
          </h1> 
         
        <form  className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">Section</label>
          <input   value={section}  onChange={(e) => setsection(e.target.value)} placeholder='Enter Your Section'   type="section" id="section" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="year">Year</label>
          <select value={year} onChange={(e)=>setyear(e.target.value)} className=' border border-gray-300 rounded-md p-1' >      
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>    
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
          </select>

          <label className="text-gray-700 font-semibold" htmlFor="Batch">Batch</label>
          <input   value={batch}  onChange={(e) => setbatch(e.target.value)} placeholder='Enter a Your Starting Year'   type="text" id="text" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="Email">Class Counsellor Email</label>
          <input   value={teacheremail}  onChange={(e) => setteacheremail(e.target.value)} placeholder='Enter Class Counsellor Email here'   type="email" id="Email" className="border border-gray-300 rounded-md p-1" required />

          <button onClick={createSection} type="submit" className="bg-blue-500 text-white font-semibold py-1 rounded-md hover:bg-blue-600">Create</button>
 
        </form>

      </div>
  </div>
  )
}

export default CreateSection