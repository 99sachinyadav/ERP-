import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";


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
    const responce = await axios.post('http://localhost:4000/api/registerStudent', {
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
    <div className="w-full  sm:h-screen  mb-10  sm:mb-0 flex items-center justify-center flex-1 bg-gray-100 ">
      <div className="  top-10 w-full h-full">
        <div className="w-[100%] h-full flex flex-col items-center gap-8">
          <h1 className=" text-3xl sm:text-7xl ml-10   flex justify-center mt-20 sm:mt-10 font-bold  text-blue-900   text-wrap ">
            Registration <span className="text-red-500 ml-3"> Form</span>
          </h1>
          <form onSubmit={handleSubmit} className=" w-[340px]   sm:w-[900px] rounded-4xl    shadow-2xl bg-white">
            <div className=" w-full  flex flex-col ">
              <div className="  flex flex-col-reverse items-center sm:flex-row  w-full   mt-8">
                <div className="flex  w-[60%] flex-col gap-4 ml-[-110px] sm:ml-10 mt-5 flex-1">
                  <div className="flex gap-6   items-center">
                    <h1 className=" hidden sm:block text-2xl  font-semibold whitespace-nowrap">
                      Student Name :
                    </h1>
                    <input
                      className="px-11 py-2 text-xl border-2 w-[320px] sm:w-[250px]"
                      type="text"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      placeholder="Enter Your Name "
                    />
                  </div>
                  <div className="flex sm:gap-25 items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Roll No :
                    </h1>
                    <input
                      className="px-11 py-2 text-xl border-2 w-[320px] sm:w-[250px]"
                      type="text"
                      value={rollno}  
                      onChange={(e) => setrollno(e.target.value)}
                      placeholder="Enter Your Roll No "
                    />
                  </div>
                  <div className="flex  sm:gap-6 items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Father's Name :
                    </h1>
                    <input
                      className="px-11 py-2 text-xl border-2 w-[320px] sm:w-[250px]"
                      type="text"
                      value={fathername}  
                      onChange={(e) => setfathername(e.target.value)}
                      placeholder="Enter Your Father's Name "
                    />
                  </div>
                  <div className="flex  sm:gap-21 items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Semester:
                    </h1>
                    
          <select  value={semester} onChange={(e)=>setsemester(e.target.value)} className="px-11 py-2 text-xl border-2 w-[320px] sm:w-[250px]" >      
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

                </div>
                <div className="w-[40%]  flex justify-center items-center">
                  <label
                    className="w-[150px] h-[150px] mt-6  bg-white opacity-100  border-2 "
                    htmlFor="image1"
                  >
                    <input
                      id="image1"
                      hidden
                      className="opacity-100"
                      type="file"
                      onChange={(e) => setimage(e.target.files[0])}
                    />
                    {image && (
                      <img
                        className="w-[150px] h-[150px]  bg-white opacity-100 "
                        src={URL.createObjectURL(image)}
                        alt="Uploaded Preview"
                      />
                    )}
                  </label>
                </div>
              </div>
              <div className="flex  flex-col mt-[-20px] sm:mt- gap-4  items-center p-10">
                <div className=" flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-10    sm:ml-0 items-center">
                    <h1 className="text-2xl hidden sm:block  font-semibold whitespace-nowrap">
                      Date of Birth :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl w-[320px] sm:w-[250px] border-2"
                      type="date"
                      value={dob}
                      onChange={(e) => setdob(e.target.value)}
                      placeholder="Enter date here"
                    />
                  </div>
                  <div className="flex gap-7   sm:ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block  font-semibold whitespace-nowrap">
                      Batch :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="text"
                      value={batch}
                      onChange={(e) => setbatch(e.target.value)}  
                      placeholder="Enter Your starting year "
                    />
                  </div>
                </div>
                <div className="flex flex-col ml-[-10px] sm:flex-row gap-4">
                  <div className="flex gap-33  sm: ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Year :
                    </h1>
                    <select
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="text"
                      value={year}
                      onChange={(e) => setyear(e.target.value)}
                      placeholder="Enter Your Email "
                      name=""
                      id=""
                    >
                      <option id="year-1" value="Ist">Ist</option>
                      <option id="year-2" value="IInd">IInd</option>
                      <option id="year-3" value="IIIrd">IIIrd</option>
                      <option id="year-4" value="IVth">IVth</option>
                    </select>
                  </div>
                  <div className="flex gap-2   ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Section :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="text"
                      value={section}
                      onChange={(e) => setsection(e.target.value)}
                      placeholder="Enter Your Section "
                    />
                  </div>
                </div>
                <div className="flex flex-col ml-[-10px] sm:flex-row gap-4">
                  <div className="flex gap-31  sm: ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Email:
                    </h1>
                    <input
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="email"
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      placeholder="Enter Your Email "
                      name=""
                      id=""
                    >
                      
                    </input>
                  </div>
                  <div className="flex  gap-3  sm:ml-[-5px] items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Password:
                    </h1>
                    <input
                      className="px-4 py-2 text-xl ml-3 sm:ml-0 w-[320px] sm:w-[250px] border-2"
                      type="password"
                      value={password}  
                      onChange={(e) => setpassword(e.target.value)}
                      placeholder="Enter Your Password "
                    />
                  </div>
                </div>
                <div className="flex flex-col ml-[-10px] sm:flex-row gap-4">
                  <div className="flex gap-22 sm: ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Address :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="address"
                      value={address} 
                      onChange={(e) => setaddress(e.target.value)}
                      placeholder="Enter Your Address "
                      name=""
                      id=""
                    >
                      
                    </input>
                  </div>
                  <div className="flex gap-3   ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Mobile :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="text"
                      value={mobile}
                      onChange={(e) => setmobile(e.target.value)}
                      placeholder="Enter Your Mobile Number "
                    />
                  </div>
                </div>
                


                <button type="submit" className="flex w-[250px] text-center mt-8 justify-center text-lg items-center bg-blue-500 border-4 text-white py-3 rounded-lg">
                  Register
                </button>
                <p onClick={handlelogin} className="text-md sm:text-lg font-s text-center  text-blue-700">
                  Login here...
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Studentsignup;
