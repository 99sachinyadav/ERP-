

import React from 'react'
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TeacherRegister = (props) => {
    const [name, setname] = React.useState(""); 
    const [email, setemail] = React.useState("");
    const [password, setpassword] = React.useState("");
    
      const navigate = useNavigate();
  
    const handleSubmit = async (e)=>{
            e.preventDefault();

        try {
                // console.log(name,email,password , localStorage.getItem('adminToken'))
            const responce = await axios.post('http://localhost:4000/api/registerTeacher', 
              {
                name: name,
                email: email,
                password: password,
              },
              {
                headers: {
                  adminToken: localStorage.getItem('adminToken'),
                }
              }
            )
            console.log(responce.data);
            if(responce.data.success){
              localStorage.setItem('teacherToken',responce.data.teacherToken)
              setname('');
              setemail('');
              setpassword('');
              toast.success(responce.data.message)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)
        }
    }


  return (
   
  <div className='flex  justify-center items-center h-screen bg-gray-100 relative'>
        <div className="flex flex-col   pb-20 sm:pb-50 items-center  bg-gray-100">
         <h1 className=" text-3xl sm:text-5xl   flex justify-center sm:mt-10  font-bold  text-blue-900   text-wrap ">
             Teacher <span className="text-red-500 ml-3"> Register</span>
          </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">Name</label>
          <input  value={name} onChange={(e)=>setname(e.target.value)}  type="name" id="name" className="border border-gray-300 rounded-md p-2" required />
          <label className="text-gray-700 font-semibold" htmlFor="email">Email</label>
          <input  value={email} onChange={(e)=>setemail(e.target.value)} type="email" id="email" className="border border-gray-300 rounded-md p-2" required />

          <label className="text-gray-700 font-semibold" htmlFor="password">Password</label>
          <input  value={password} onChange={(e)=>setpassword(e.target.value)} type="password" id="password" className="border border-gray-300 rounded-md p-2" required />

          <button type="submit" className="bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600">Register</button>

          <p onClick={()=>navigate('/teacherlogin')}  className='text-center mt-2 text-lg text-blue-900'>Login here...</p>
        </form>

      </div>
  </div>
  )
}

export default TeacherRegister