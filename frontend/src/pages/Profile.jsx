import axios from "axios";
import {   User } from "../assets/assets";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
 
function Profile() {
  const [response, setresponce] = useState();
  const [Attendance, setAttendance] = useState([]);
  const [isOpen, setisOpen] = useState(false);
   const [semester, setSemester] = useState("");
  useEffect(() => {
    getProfile(); // Call the function to fetch data
  }, []); // Dependency array to re-fetch data when response changes

  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      const response = await axios.get("http://localhost:4000/api/getProfile", {
        headers: {
          token: token,
        },
      });
      // console.log(response.data);
      // console.log(response.data.success);
      if (response.data.sucess) {
        setresponce(response.data.profile);
        setAttendance(response.data.profile.attendance);
        setSemester(response.data.profile.semester);
      }
    } catch (error) {
      console.log(error); // Set error message
      toast.error(error.response.data.message); // Display error message
    }
  };
  // console.log(Attendance)
  // console.log(response);
  //  console.log(semester)
 
  return (
    <div className="w-full bg-amber-50">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 p-5 sm:p-10 w-full">
        <div className="flex flex-col w-full sm:w-[30%] rounded-lg border-2 shadow-md bg-white">
          <h1 className="text-2xl sm:text-4xl flex justify-center sm:mt-10 mt-8 font-bold text-blue-900 text-wrap">
            Student <span className="text-red-500 ml-3"> Profile</span>
          </h1>
          <div className="flex sm:flex-row">
            <img
              src={User}
              className="w-30 h-35 sm:w-40 sm:h-60 mt-8 ml-6 sm:ml-8 rounded-[50%]"
              alt=""
            />
            <div className="flex flex-col justify-center sm:mt-8">
              <h1 className="text-xl text-wrap sm:text-4xl font-semibold ml-8 mt-4">
                {response?.name}
              </h1>
              <h1 className="sm:text-xl sm:mt-2 ml-8">{response?.rollno}</h1>
              <h1 className="sm:text-lg text-gray-500 font-semibold ml-8">
                {response?.email}
              </h1>
               
            </div>
          </div>
          <table className="w-12/12 mx-auto my-4 text-center border-separate border-spacing-y-2">
            <tbody className="flex sm:flex-col justify-evenly">
              <tr className=" sm:border-b  rounded flex flex-col justify-between sm:pl-10 sm:pr-10  sm:flex-row">
                <td className="text-lg sm:text-2xl font-bold py-2 rounded-l">Section</td>
                <td className="text-lg sm:text-2xl font-semibold py-2 sm:text-left">{response?.section}</td>
              </tr>
              <tr className="  sm:border-b rounded flex flex-col justify-between sm:pl-10 sm:pr-10  sm:flex-row">
                <td className="text-lg sm:text-2xl font-bold py-2 rounded-l">Semester</td>
                <td className="text-lg sm:text-2xl font-semibold py-2 sm:text-left">{response?.semester}</td>
              </tr>
              <tr className=" sm:border-b  rounded flex flex-col justify-between sm:pl-10 sm:pr-10  sm:flex-row">
                <td className="text-lg sm:text-2xl font-bold py-2">Year</td>
                <td className="text-lg sm:text-2xl font-semibold py-2 sm:text-left ">{response?.year}</td>
              </tr>
             
            </tbody>
          </table>
          <button
            onClick={() => setisOpen(!isOpen)}
            className="bg-blue-500 w-50 sm:w-80   mx-auto mb-4 sm:ml-26 sm:m-10 text-white py-2 px-4 rounded"
          >
            View Attendence
          </button>
        </div>
        <div className="right sm:w-[65%] flex flex-col gap-4 p-3 sm:p-6 rounded-lg border-2 shadow-md bg-gray-200">
          <div className="sm:w-full w-full border-2 h-12 flex items-center justify-between p-2 sm:p-4 rounded-md bg-white">
            <h1 className="text-xl sm:text-2xl font-semibold sm:ml-5 ">
              Profile
            </h1>
            <h1 className="text-xl font-semibold ml-5 ">Edit Details</h1>
          </div>
          <table className="w-full bg-white rounded-lg shadow-md my-4">
            <tbody>
              <tr className="border-b">
                <td className="text-xl sm:text-2xl font-semibold py-3 pl-5 w-1/2">Admission Batch</td>
                <td className="text-md sm:text-2xl font-semibold py-3 pl-5">: {response?.batch}</td>
              </tr>
              <tr className="border-b">
                <td className="text-xl sm:text-2xl font-semibold py-3 pl-5">Date of Birth</td>
                <td className="text-md sm:text-2xl font-semibold py-3 pl-5">: {response?.dob}</td>
              </tr>
              <tr className="border-b">
                <td className="text-xl sm:text-2xl font-semibold py-3 pl-5">Mobile No</td>
                <td className="text-md sm:text-2xl font-semibold py-3 pl-5">: {response?.contactinfo.phoneNo}</td>
              </tr>
              <tr className="border-b">
                <td className="text-xl sm:text-2xl font-semibold py-3 pl-5">Father's Name</td>
                <td className="text-md sm:text-2xl font-semibold py-3 pl-5">: {response?.father_name}</td>
              </tr>
              <tr>
                <td className="text-xl sm:text-2xl font-semibold py-3 pl-5">Address</td>
                <td className="text-md sm:text-2xl font-semibold py-3 pl-5">: {response?.contactinfo.address}</td>
              </tr>
            </tbody>
          </table>
          <div className={`w-full bg-white rounded-xl shadow-2xl ${!isOpen ? "hidden" : "block"}`}>
            <h1 className="text-center text-2xl sm:text-3xl mt-4 text-red-500 font-semibold">
            <span className="text-blue-600">TOTAL</span>  ATTENDANCE
            </h1>
            <div className="overflow-x-auto p-4">
              <table className="min-w-full border border-gray-200 rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left  text-md sm:text-xl font-semibold">Subject</th>
                    <th className="py-3 px-4 text-left sm:text-center text-md sm:text-xl font-semibold">TOTAL LECTURE</th>
                    <th className="py-3 px-4 text-left sm:text-center text-md sm:text-xl font-semibold">LECTURE ATTENDED</th>
                  </tr>
                </thead>
                <tbody>
{Attendance?.map((item, idx) => {
  // Calculate totals outside JSX
  let totalnooflec = 0;
  let noofattend = 0;

  item?.subject?.forEach(element => {
    // console.log(element.name,semester)
    if (element.name.includes(semester)) {
      totalnooflec += element.totalnoLec || 0;
      noofattend += element.noofLecAttended || 0;
    }
  });

  return (totalnooflec !== 0 && noofattend !== 0 ? (
    <tr key={idx} className={`border-t ${(noofattend / totalnooflec) * 100 < 75 ? "bg-red-400" : "bg-white"} hover:bg-gray-200`}>
      <td className="py-2 px-4 text-md sm:text-lg font-medium">{item?.subject?.[0]?.name}</td>
      <td className="py-2 px-4 text-md sm:text-lg text-center">{totalnooflec}</td>
      <td className="py-2 px-4 text-md sm:text-lg text-center">{noofattend}</td>
    </tr>
  ) : null);
})}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
