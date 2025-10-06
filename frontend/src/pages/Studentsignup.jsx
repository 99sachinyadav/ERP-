import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "@/App";

const Studentsignup = () => {
  const [image, setimage] = useState(null);
  const [name, setname] = useState('');
  const [email, setemail] = useState('');   
  const [password, setpassword] = useState('');
  const [address, setaddress] = useState('');
  const [mobile, setmobile] = useState('');
  const [section, setsection] = useState('');
  const [rollno, setrollno] = useState('');
  const [dob, setdob] = useState('');
  const [batch, setbatch] = useState('');
  const [year, setyear] = useState('');
  const [fathername, setfathername] = useState('');
  const [semester, setsemester] = useState('');
  
  const navigate = useNavigate();
 


  const handleSubmit = async(e) => {
    e.preventDefault();
   
    // formData.append('image', image);
 
  
    try {

     // Retrieve token from localStorage or other storage
    const responce = await axios.post(backendUrl + '/api/registerStudent', {
        name,
        email,
        password,
        section,
        rollno,
        dob,
        batch,
        year,
        semester,
        father_name: fathername,
        contactinfo: {
          address: address,
          phoneNO:  mobile,
        }
       
      })
      
   console.log(responce);
      if (responce.data.sucess) {
         localStorage.setItem('token', responce.data.studentToken);
         localStorage.setItem('studentname',responce.data.name );
         
         navigate('/home');
   toast.success(responce.data.message)
      }  
      else {
        toast.error(responce.data.message)
      }
      
    } catch (error) {
       console.log(error);
       toast.error(error.response.data.message);
    }
    setname('');
    setaddress('');
    setbatch('');
    setdob('');
    setemail('');
    setfathername('');
    setimage(null);
    setmobile('');
   
    setpassword('');
    setrollno('');
    setsection('');
    setyear('');
    // Reset the form fields after submission
    
         // Handle the form submission logic here (e.g., send the data to the server)
  }

  const handlelogin = () => {
    navigate('/login');
  } 


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 py-8 px-2">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 sm:p-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-900 text-center mb-8">
          Registration <span className="text-red-500">Form</span>
        </h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Left Side */}
          <div className="flex flex-col gap-6">
            <div className="mb-[20px] text-center">
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Profile Image
              </label>
              <div className="flex items-center  justify-center gap-4">
                <label
                  htmlFor="image1"
                  className="cursor-pointer w-32 h-32 flex items-center justify-center border-2 border-blue-300 rounded-lg bg-gray-50 hover:bg-blue-50 transition"
                >
                  <input
                    id="image1"
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => setimage(e.target.files[0])}
                  />
                  {image ? (
                    <img
                      className="w-32 h-32 object-cover rounded-lg"
                      src={URL.createObjectURL(image)}
                      alt="Uploaded Preview"
                    />
                  ) : (
                    <span className="text-blue-400 text-2xl">+</span>
                  )}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Student Name
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={name}
                onChange={(e) => setname(e.target.value)}
                placeholder="Enter Your Name"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Roll No
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={rollno}
                onChange={(e) => setrollno(e.target.value)}
                placeholder="Enter Your Roll No"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Father's Name
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={fathername}
                onChange={(e) => setfathername(e.target.value)}
                placeholder="Enter Father's Name"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setsemester(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                required
              >
                <option value="">Select Semester</option>
                <option value="Ist">1st sem</option>
                <option value="IInd">2nd sem</option>
                <option value="IIIrd">3rd sem</option>
                <option value="IVth">4th sem</option>
                <option value="Vth">5th sem</option>
                <option value="VIth">6th sem</option>
                <option value="VIIth">7th sem</option>
                <option value="VIIIth">8th sem</option>
              </select>
            </div>

             <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Mobile
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={mobile}
                onChange={(e) => setmobile(e.target.value)}
                placeholder="Enter Mobile Number"
                required
              />
            </div>
            
          </div>
          {/* Right Side */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Date of Birth
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="date"
                value={dob}
                onChange={(e) => setdob(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Batch
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={batch}
                onChange={(e) => setbatch(e.target.value)}
                placeholder="Enter Starting Year"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Year
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                value={year}
                onChange={(e) => setyear(e.target.value)}
                required
              >
                <option value="">Select Year</option>
                <option value="Ist">Ist</option>
                <option value="IInd">IInd</option>
                <option value="IIIrd">IIIrd</option>
                <option value="IVth">IVth</option>
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Section
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={section}
                onChange={(e) => setsection(e.target.value)}
                placeholder="Enter Section"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Email
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                placeholder="Enter Email"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Password
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">
                Address
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={address}
                onChange={(e) => setaddress(e.target.value)}
                placeholder="Enter Address"
                required
              />
            </div>
           
          </div>
          {/* Submit Button */}
          <div className="md:col-span-2 flex flex-col items-center mt-4">
            <button
              type="submit"
              className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition text-lg shadow-lg"
            >
              Register
            </button>
            <p
              onClick={handlelogin}
              className="mt-4 text-blue-700 hover:underline cursor-pointer text-md"
            >
              Already have an account? Login here...
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Studentsignup;
