import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const TeacherLogin = () => {
   
    const [email,setemail] = useState('')
    const [password,setpassword]= useState('')
    let section = "";
  
    const navigate = useNavigate();

    const submithandle = async (e)=>{
      e.preventDefault()
      try {

        const responce = await axios.post('http://localhost:4000/api/loginTeacher',{
          email:email,
          password:password,
        })

        console.log(responce.data)
        if(responce.data.success){
           localStorage.setItem('teacherToken',responce.data.refeshTeacherToken)
           localStorage.setItem('teachername',responce.data.findTeacher.name)
           responce.data.findTeacher?.section?.forEach((elem)=>{
              section=section+','+elem.name+" ";
           })
           localStorage.setItem('teachersection',section)
            navigate('/teacherdashboard')
           toast.success(responce.data.message)
        }
        
      } catch (error) {
        console.log(error)
        toast.error(error.response.data.message) 
      }
    }

  return (
   <div className='flex  justify-center items-center h-screen bg-gray-100'>
        <div className="flex flex-col   pb-20 sm:pb-50 items-center  bg-gray-100">
         <h1 className=" text-3xl sm:text-7xl   flex justify-center sm:mt-10 mt-8 font-bold  text-blue-900   text-wrap ">
             Login <span className="text-red-500 ml-3"> Here</span>
          </h1>
        <form  onSubmit={submithandle} className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          
          <label className="text-gray-700 font-semibold" htmlFor="email">Email</label>
          <input  value={email} onChange={(e)=>setemail(e.target.value)} type="email" id="email" className="border border-gray-300 rounded-md p-2" required />

          <label className="text-gray-700 font-semibold" htmlFor="password">Password</label>
          <input  value={password} onChange={(e)=>setpassword(e.target.value)} type="password" id="password" className="border border-gray-300 rounded-md p-2" required />

          <button type="submit" className="bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600">Login</button>

          {/* <p onClick={()=>navigate('/teacherRegister')}  className='text-center mt-2 text-lg text-blue-900'>Sign Up...</p> */}
        </form>

      </div>
  </div>
  )
}

export default TeacherLogin