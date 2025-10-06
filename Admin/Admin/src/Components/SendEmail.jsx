import React from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { backendUrl } from '@/App';
const SendEmail = () => {
    const [section, setsection] = useState("")
    const [year, setyear] = useState("")
    const [batch, setbatch] = useState("")


     const sendMail = async (e)=>{
        e.preventDefault();
        try {
            const responce = await axios.post(backendUrl + '/api/send-email',{
              section,
              year,
              batch
            },{
                headers:{
                    teacherToken:localStorage.getItem('teachertoken')
                }
            });
            toast.success(responce.data.message);
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)
        }
     }
    
  return (
    <div className='flex  justify-center items-center h-screen bg-gray-200 relative'>
        <div className="flex flex-col   pb-20 sm:pb-30 items-center gap-5  bg-gray-200 ">
         <h1 className=" text-3xl sm:text-4xl    flex justify-center sm:mt-10 font-bold  text-blue-900   text-wrap ">
           Send Email <span className="text-red-500 ml-3">To Students  </span>
          </h1> 
       
        <form  className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">Section</label>
          <input value={section} onChange={(e)=>setsection(e.target.value)} placeholder='Enter Your Section'   type="section" id="section" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="year">Year</label>
          <select value={year} onChange={(e)=>setyear(e.target.value)} className=' border border-gray-300 rounded-md p-1' >      
          <option value="Ist">1st Year</option>
          <option value="IInd">2nd Year</option>    
          <option value="IIIrd">3rd Year</option>
          <option value="IVth">4th Year</option>
          </select>

          <label className="text-gray-700 font-semibold" htmlFor="Batch">Batch</label>
          <input   value={batch} onChange={(e)=>setbatch(e.target.value)} placeholder='Enter a Your Starting Year'   type="batch" id="password" className="border border-gray-300 rounded-md p-1" required />
          

          <button onClick={sendMail}  type="submit" className="bg-blue-500 text-white font-semibold py-1 rounded-md hover:bg-blue-600">Send Email</button>
 
        </form>

      </div>
  </div>
  )
}

export default SendEmail