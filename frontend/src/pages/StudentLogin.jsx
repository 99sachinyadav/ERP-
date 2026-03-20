 import {useNavigate} from 'react-router-dom'
 import {useState} from 'react'
import toast from 'react-hot-toast';
import axios from 'axios';
import { backendUrl } from '@/App';

function StudentLogin() {

   const navigate = useNavigate();
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [resetPassword, setResetPassword] = useState("");
    const [resetStep, setResetStep] = useState("request");
    const [isResetLoading, setIsResetLoading] = useState(false);
    const handleSubmit = async (e)=>{
      e.preventDefault();
      setIsLoading(true);

      try {

        const responce  = await axios.post(backendUrl + '/api/loginStudent',{
           email,password
        })
        // console.log(responce.data);
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
          // console.log(`Window resized to: ${window.innerWidth}x${window.innerHeight}`);
        });
      } catch (error) {
         console.log(error.message);
         toast.error(error.message);
      } finally {
         setIsLoading(false);
      }
    }

    const handleOpenReset = () => {
      setShowReset((prev) => !prev);
      setResetEmail(email || "");
      setResetStep("request");
      setResetCode("");
      setResetPassword("");
    };

    const handleSendCode = async () => {
      if (!resetEmail) {
        toast.error("Please enter your email");
        return;
      }
      setIsResetLoading(true);
      try {
        const response = await axios.post(backendUrl + '/api/requestStudentPasswordReset', {
          email: resetEmail
        });
        if (response.data.sucess) {
          toast.success(response.data.message);
          setResetStep("verify");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setIsResetLoading(false);
      }
    };

    const handleResetPassword = async () => {
      if (!resetEmail || !resetCode || !resetPassword) {
        toast.error("Please fill all fields");
        return;
      }
      if (resetPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      setIsResetLoading(true);
      try {
        const response = await axios.post(backendUrl + '/api/resetStudentPassword', {
          email: resetEmail,
          code: resetCode,
          newPassword: resetPassword
        });
        if (response.data.sucess) {
          toast.success(response.data.message);
          setShowReset(false);
          setResetStep("request");
          setResetCode("");
          setResetPassword("");
          setpassword("");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setIsResetLoading(false);
      }
    };
  return (
      <div className="flex flex-col pb-20 sm:pb-50 items-center bg-gradient-to-b from-blue-50 via-white to-gray-100">
         <h1 className=" text-3xl sm:text-7xl flex justify-center sm:mt-10 mt-8 font-bold text-blue-900 text-wrap ">
             Login <span className="text-red-500 ml-3"> Here</span>
          </h1>
        <form  onSubmit={handleSubmit} className="flex flex-col gap-5 w-84 sm:w-[450px] mt-10 bg-white p-5 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <label className="text-gray-700 font-semibold" htmlFor="email">Email</label>
          <input value={email} onChange={(e) => setemail(e.target.value)}  type="email" id="email" className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200" required />

          <label className="text-gray-700 font-semibold" htmlFor="password">Password</label>
          <input value={password} onChange={(e) => setpassword(e.target.value)} type="password" id="password" className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200" required />

          <button
            type="button"
            onClick={handleOpenReset}
            className="text-sm text-blue-700 hover:underline text-left"
          >
            Forgot password?
          </button>
         
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {showReset && (
            <div className="mt-2 border border-blue-100 bg-blue-50/40 rounded-lg p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-blue-900">Reset your password</p>
              <label className="text-gray-700 text-sm font-semibold" htmlFor="resetEmail">Email</label>
              <input
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                type="email"
                id="resetEmail"
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your email"
              />

              {resetStep === "verify" && (
                <>
                  <label className="text-gray-700 text-sm font-semibold" htmlFor="resetCode">Code</label>
                  <input
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    type="text"
                    id="resetCode"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter 6-digit code"
                  />

                  <label className="text-gray-700 text-sm font-semibold" htmlFor="resetPassword">New Password</label>
                  <input
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    type="password"
                    id="resetPassword"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter new password"
                  />
                </>
              )}

              {resetStep === "request" ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isResetLoading}
                  className="bg-white border border-blue-200 text-blue-800 font-semibold py-2 rounded-md hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isResetLoading ? "Sending code..." : "Send code"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResetLoading}
                  className="bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isResetLoading ? "Updating..." : "Update password"}
                </button>
              )}
            </div>
          )}
            <p onClick={()=>navigate('/')} className="text-md sm:text-lg font-s text-center  text-blue-700">
                  <span className='text-red-500'>Don't have an account?</span> signup here...
                </p>
        </form>

      </div>
  )
}

export default StudentLogin
