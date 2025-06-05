import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
 

const AdminLogin = () => {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const navigate = useNavigate();
    const handelSubmit = async(e) => {
        e.preventDefault()
        try {
         const responce =  await axios.post('http://localhost:4000/api/loginAdmin',{
            email,
            password
         })

        //  console.log(responce)
         
         if(responce.data.sucess){
            localStorage.setItem("adminToken",responce.data.adminToken)  
            toast.success(responce.data.message)
            setemail('')
            setpassword('')
            navigate('/admindashboard')
         } 

        } catch (error) {
            console.log(error.message)
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message); // Show the error message from the server
            } else {
                toast.error(error.message || "An unexpected error occurred"); // Fallback to a generic error message
            }
              
            
        }
    }
return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handelSubmit} className="flex flex-col w-full m-4 max-w-md p-6 shadow-lg rounded-lg bg-white">
                    <h2 className="text-center text-2xl font-semibold mb-6">Admin Login</h2>
                    <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-700">
                            Email:
                    </label>
                    <input
                            type="email"
                            value={email}
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            className="p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            onChange={(e)=>setemail(e.target.value)}

                    />
                    <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-700">
                            Password:
                    </label>
                    <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Enter your password"
                            className="p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            onChange={(e)=>setpassword(e.target.value)}
                    />
                    <button
                        //  onClick={()=>navigate('/admindashboard')}
                            type="submit"
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                            Login
                    </button>
                    <p  onClick={() => navigate('/teacherLogin')} className="mt-4 text-sm text-center text-blue-500">
                                Login as Faculty.....  
                    </p>
            </form>
    </div>
)
}

export default AdminLogin