 import {useNavigate} from 'react-router-dom'
 import {useState} from 'react'
import toast from 'react-hot-toast';
import axios from 'axios';

function StudentLogin() {

   const navigate = useNavigate();
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const handleSubmit = async (e)=>{
      e.preventDefault();

      try {

        const responce  = await axios.post('http://localhost:4000/api/loginStudent',{
           email,password
        })
        console.log(responce.data);
        if(responce.data.sucess){
          localStorage.setItem('token',responce.data.refreshToken )
          localStorage.setItem('studentname',responce.data.name )
          toast.success(responce.data.message);
      
          navigate('/home')
        }
        else{
          toast.error(responce.data.message)
        }
        window.addEventListener('resize', () => {
          console.log(`Window resized to: ${window.innerWidth}x${window.innerHeight}`);
        });
      } catch (error) {
         console.log(error.message);
         toast.error(error.message);
      }
    }
  return (
      <div className="flex flex-col  pb-20 sm:pb-50 items-center  bg-gray-100">
         <h1 className=" text-3xl sm:text-7xl   flex justify-center sm:mt-10 mt-8 font-bold  text-blue-900   text-wrap ">
             Login <span className="text-red-500 ml-3"> Here</span>
          </h1>
        <form  onSubmit={handleSubmit} className="flex flex-col gap-5 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-lg shadow-md">
          <label className="text-gray-700 font-semibold" htmlFor="email">Email</label>
          <input value={email} onChange={(e) => setemail(e.target.value)}  type="email" id="email" className="border border-gray-300 rounded-md p-2" required />

          <label className="text-gray-700 font-semibold" htmlFor="password">Password</label>
          <input value={password} onChange={(e) => setpassword(e.target.value)} type="password" id="password" className="border border-gray-300 rounded-md p-2" required />

         
          <button type="submit" className="bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600">Login</button>
            <p onClick={()=>navigate('/')} className="text-md sm:text-lg font-s text-center  text-blue-700">
                  <span className='text-red-500'>Don't have an account?</span> signup here...
                </p>
        </form>

      </div>
  )
}

export default StudentLogin