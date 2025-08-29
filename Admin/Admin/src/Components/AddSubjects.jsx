import React from 'react'
import toast from 'react-hot-toast';
import axios from 'axios';
const AddSubjects = () => {

    const [section, setSection] = React.useState("");
    const [year, setYear] = React.useState("");
    const [batch, setBatch] = React.useState("");
    const [subject, setSubject] = React.useState("");
    // console.log(section,year,batch,subject)
     const addSubject = async (e)=>{
      e.preventDefault();
      try {
          const responce = await axios.post('http://localhost:4000/api/addSubjects',{
            section,
            year, 
            batch,
            subject
          },{
            headers:{
              teachertoken: localStorage.getItem('teacherToken')? localStorage.getItem('teacherToken') : null,
              admintoken: localStorage.getItem('adminToken')? localStorage.getItem('adminToken') : null
            }
          })
          console.log(responce.data);
          if(responce.data.sucess){
            toast.success(responce.data.message)
            setSection("");
            setYear("");
            setBatch("");
            setSubject("");
          }
             
          else{
            toast.error(responce.data.message)
          }

      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message)
      }
     }
  return (
     <div className='flex  justify-center items-center h-screen bg-gray-100 relative'>
        <div className="flex flex-col   pb-20 sm:pb-50 items-center gap-5  bg-gray-100 ">
         <h1 className=" text-3xl sm:text-4xl    flex justify-center sm:mt-10  font-bold  text-blue-900   text-wrap ">
           Add  <span className="text-red-500 ml-3">Subjects</span>
          </h1> 
        
        <form  className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">Section</label>
          <input value={section} onChange={(e) => setSection(e.target.value)} placeholder='Enter Your Section'   type="section" id="section" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="year">Year</label>
          <select className=' border border-gray-300 rounded-md p-1' onChange={(e) => setYear(e.target.value)} value={year}>
          <option value="Ist">Ist Year</option>
          <option value="IInd">IInd Year</option>    
          <option value="IIIrd">IIIrd Year</option>
          <option value="IVth">IV Year</option>
          </select>

          <label className="text-gray-700 font-semibold" htmlFor="Batch">Batch</label>
          <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder='Enter a Your Starting Year'   type="batch" id="password" className="border border-gray-300 rounded-md p-1" required />
          <label className="text-gray-700 font-semibold" htmlFor="Subject">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder='Enter Subject Name'   type="subject" id="subject" className="border border-gray-300 rounded-md p-1" required />

          <button onClick={addSubject} type="submit" className="bg-blue-500 text-white font-semibold py-1 rounded-md hover:bg-blue-600">ADD NEW ONE</button>
 
        </form>

      </div>
  </div>
  )
}

export default AddSubjects