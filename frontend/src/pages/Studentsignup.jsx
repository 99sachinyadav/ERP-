import { useState } from "react";

const Studentsignup = () => {
  const [image, setimage] = useState(null);

  return (
    <div className="w-full  h-[650px] flex flex-1  ">
      {/* <img className='w-full h-[600px] sm:h-[750px] shrink-0  bg-black relative' src={back} alt="" /> */}
      {/* <div className='w-full h-[600px] sm:h-[750px] bg-black absolute top-28 opacity-50'></div> */}
      <div className="absolute top-10 w-full h-full">
        <div className="w-[100%] h-full flex flex-col items-center gap-8">
          <h1 className=" text-3xl sm:text-7xl ml-10   flex justify-center mt-20 sm:mt-30 font-bold  text-blue-900   text-wrap ">
            Registration <span className="text-red-500 ml-3"> Form</span>
          </h1>
          <div className=" w-[340px] sm:h-[590px] sm:w-[900px] rounded-4xl    shadow-2xl bg-white">
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
                      placeholder="Enter Your Roll No "
                    />
                  </div>
                  <div className="flex  sm:gap-19 items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Library Id :
                    </h1>
                    <input
                      className="px-11 py-2 text-xl border-2 w-[320px] sm:w-[250px]"
                      type="text"
                      placeholder="Enter Your Library Id "
                    />
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
                    {/* <img src={  URL.createObjectURL(image)} alt="" /> */}
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
              <div className="flex  flex-col mt-[-20px] sm:mt-7 gap-4  items-center p-10">
                <div className=" flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-9    sm:ml-0 items-center">
                    <h1 className="text-2xl hidden sm:block  font-semibold whitespace-nowrap">
                      Date of Birth :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl w-[320px] sm:w-[250px] border-2"
                      type="date"
                      placeholder="Enter date here"
                    />
                  </div>
                  <div className="flex gap-5   sm:ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block  font-semibold whitespace-nowrap">
                      Email :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="email"
                      placeholder="Enter Your Email "
                    />
                  </div>
                </div>
                <div className="flex flex-col ml-[-10px] sm:flex-row gap-4">
                  <div className="flex gap-10  sm: ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Department :
                    </h1>
                    <select
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="text"
                      placeholder="Enter Your Email "
                      name=""
                      id=""
                    >
                      <option value="">CSE</option>
                      <option value="">IT</option>
                      <option value="">ECE</option>
                    </select>
                  </div>
                  <div className="flex gap-0   ml-3  items-center">
                    <h1 className="text-2xl hidden sm:block font-semibold whitespace-nowrap">
                      Mobile :
                    </h1>
                    <input
                      className="px-4 py-2 text-xl  w-[320px] sm:w-[250px] border-2"
                      type="email"
                      placeholder="Enter Your Mobile Number "
                    />
                  </div>
                </div>

                <button className="flex w-[250px] text-center mt-8 justify-center text-lg items-center bg-black border-4 text-white py-3 rounded-lg">
                  Register
                </button>
                <p className="text-xl font-semibold text-center  text-blue-700">
                  Login here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studentsignup;
