import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { backendUrl } from '@/App'
const ChangeSemesterOrSection = () => {

  // currentSection,currentYear,currentBatch,newSemester,newSection
  const [currentSection, setcurrentSection] = useState("")
  const [currentYear, setcurrentYear] = useState("")
  const [currentBatch, setcurrentBatch] = useState("")
  const [newSemester, setnewSemester] = useState("")
  const [newSection, setnewSection] = useState("")
  

  const handleSubmit = async(e) => {
    e.preventDefault();
     
     try {
       const responce = await axios.put(backendUrl + '/api/updateSectionorSemester',{
         currentSection,
         currentYear,
         currentBatch,
         newSemester,
         newSection
       },{
         headers: {
            adminToken: localStorage.getItem('adminToken') ? localStorage.getItem('adminToken') : null
         }
       })
       console.log("hello")
       console.log(responce.data)
       if(responce.data.success === true){
         toast.success(responce.data.message)
       }
       else{
         toast.error(responce.data.message)
       }
     } catch (error) {
       console.log(error)
       toast.error(error.response?.data?.message || "An error occurred while updating section/semester.")
     }
  }

  return (
     <div className='flex  justify-center items-center h-screen bg-gray-200 relative'>
        <div className="flex flex-col   pb-20 sm:pb-20 items-center gap-5  bg-gray-200 ">
         <h1 className=" text-2xl sm:text-4xl    flex justify-center sm:mt-10 font-bold  text-blue-900   text-wrap ">
           Change  <span className="text-red-500 ml-3">Section/Semester </span>
          </h1> 
       
        <form  className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">CurrentSection</label>
          <input value={currentSection} onChange={(e) => setcurrentSection(e.target.value)} placeholder='Enter Your Section'   type="section" id="section" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="year">Year</label>
          <select value={currentYear} onChange={(e) => setcurrentYear(e.target.value)} className=' border border-gray-300 rounded-md p-1' >      
          <option value="Ist">1st Year</option>
          <option value="IInd">2nd Year</option>    
          <option value="IIIrd">3rd Year</option>
          <option value="IVth">4th Year</option>
          </select>

          <label className="text-gray-700 font-semibold" htmlFor="Batch">Batch</label>
          <input  value={currentBatch} onChange={(e) => setcurrentBatch(e.target.value)}  placeholder='Enter a Your Starting Year'   type="batch" id="password1" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="Year">Select New Year</label>
            <select  value={newSemester} onChange={(e) => setnewSemester(e.target.value)}  placeholder="Select New Semester" className=' border border-gray-300 rounded-md p-1' >      
          <option value="Ist">Ist Semester</option>
          <option value="IInd">IInd Semester</option>    
          <option value="IIIrd">IIIrd Semester</option>
          <option value="IVth">IV Semester</option>
          <option value="Vth">V Semester</option>
          <option value="VIth">VI Semester</option>
          <option value="VIIth">VII Semester</option>
          <option value="VIIIth">VIII Semester</option>
          </select>
                    <label className="text-gray-700 font-semibold" htmlFor="Batch">New Section</label>
          <input  value={newSection} onChange={(e) => setnewSection(e.target.value)}  placeholder='Enter New Section'   type="batch" id="password" className="border border-gray-300 rounded-md p-1" required />

          <button  onClick={handleSubmit} type="submit" className="bg-blue-500 text-white font-semibold py-1 rounded-md hover:bg-blue-600">Update section/semester</button>

        </form>

      </div>
  </div>
  )
}

export default ChangeSemesterOrSection