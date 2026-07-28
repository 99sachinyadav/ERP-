import React from 'react'
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '@/App';

const StaffRegister = (props) => {
    const [name, setname] = React.useState(""); 
    const [email, setemail] = React.useState("");
    const [password, setpassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    
    const navigate = useNavigate();
  
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setIsLoading(true);

        try {
            const responce = await axios.post(backendUrl + '/api/registerStaff', 
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
            if(responce.data.success){
              setname('');
              setemail('');
              setpassword('');
              toast.success(responce.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Registration failed")
        } finally {
            setIsLoading(false);
        }
    }

  return (
   <div className='flex justify-center items-center h-screen bg-gray-200 relative'>
        <div className="flex flex-col pb-20 sm:pb-30 items-center bg-gray-200">
         <h1 className="text-3xl sm:text-5xl flex justify-center sm:mt-10 font-bold text-blue-900 text-wrap">
             Staff <span className="text-red-500 ml-3"> Register</span>
          </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="name">Name</label>
          <input value={name} onChange={(e)=>setname(e.target.value)} type="text" id="name" className="border border-gray-300 rounded-md p-2" required />
          
          <label className="text-gray-700 font-semibold" htmlFor="email">Email</label>
          <input value={email} onChange={(e)=>setemail(e.target.value)} type="email" id="email" className="border border-gray-300 rounded-md p-2" required />

          <label className="text-gray-700 font-semibold" htmlFor="password">Password</label>
          <input value={password} onChange={(e)=>setpassword(e.target.value)} type="password" id="password" className="border border-gray-300 rounded-md p-2" required />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          <p onClick={()=>navigate('/teacherlogin')} className='text-center mt-2 text-lg text-blue-900 cursor-pointer'>Login here...</p>
        </form>
      </div>
   </div>
  )
}

export default StaffRegister;
