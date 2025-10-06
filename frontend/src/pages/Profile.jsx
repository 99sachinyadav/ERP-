import axios from "axios";
import {   User } from "../assets/assets";
import { backendUrl } from "@/App";

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
      const response = await axios.get(backendUrl + "/api/getProfile", {
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
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-blue-50">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 p-4 lg:p-12 w-full max-w-7xl mx-auto">
        {/* Profile Card */}
        <div className="flex flex-col w-full lg:w-1/3 rounded-xl border shadow-lg bg-white p-6">
          <h1 className="text-2xl lg:text-4xl text-center font-bold text-blue-900 mb-6">
            Student <span className="text-red-500">Profile</span>
          </h1>
          <div className="flex flex-col items-center gap-4">
            <img
              src={User}
              className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-blue-200 shadow"
              alt="User"
            />
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-semibold">{response?.name}</h2>
              <p className="text-md lg:text-lg text-gray-700">{response?.rollno}</p>
              <p className="text-sm lg:text-md text-gray-500">{response?.email}</p>
            </div>
          </div>
          <table className="w-full mt-6 text-center">
            <tbody>
              <tr>
                <td className="text-lg font-bold py-2">Section</td>
                <td className="text-lg font-semibold py-2">{response?.section}</td>
              </tr>
              <tr>
                <td className="text-lg font-bold py-2">Semester</td>
                <td className="text-lg font-semibold py-2">{response?.semester}</td>
              </tr>
              <tr>
                <td className="text-lg font-bold py-2">Year</td>
                <td className="text-lg font-semibold py-2">{response?.year}</td>
              </tr>
            </tbody>
          </table>
          <button
            onClick={() => setisOpen(!isOpen)}
            className="bg-blue-600 hover:bg-blue-700 transition w-full mt-6 text-white py-2 rounded-lg font-semibold shadow"
          >
            {isOpen ? "Hide Attendance" : "View Attendance"}
          </button>
        </div>
        {/* Details & Attendance */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white border shadow rounded-lg p-4">
            <h1 className="text-xl lg:text-2xl font-semibold text-blue-800">Profile Details</h1>
            <button className="text-blue-600 hidden sm:block hover:underline font-medium mt-2 sm:mt-0">Edit Details</button>
          </div>
          <table className="w-full bg-white rounded-lg shadow border">
            <tbody>
              <tr className="border-b">
                <td className="text-lg font-semibold py-3 pl-5 w-1/2">Admission Batch</td>
                <td className="text-md font-medium py-3 pl-5">: {response?.batch}</td>
              </tr>
              <tr className="border-b">
                <td className="text-lg font-semibold py-3 pl-5">Date of Birth</td>
                <td className="text-md font-medium py-3 pl-5">: {response?.dob}</td>
              </tr>
              <tr className="border-b">
                <td className="text-lg font-semibold py-3 pl-5">Mobile No</td>
                <td className="text-md font-medium py-3 pl-5">: {response?.contactinfo?.phoneNo}</td>
              </tr>
              <tr className="border-b">
                <td className="text-lg font-semibold py-3 pl-5">Father's Name</td>
                <td className="text-md font-medium py-3 pl-5">: {response?.father_name}</td>
              </tr>
              <tr>
                <td className="text-lg font-semibold py-3 pl-5">Address</td>
                <td className="text-md font-medium py-3 pl-5">: {response?.contactinfo?.address}</td>
              </tr>
            </tbody>
          </table>
          {/* Attendance Table */}
          <div className={`w-full bg-white rounded-xl shadow-2xl transition-all duration-300 ${!isOpen ? "max-h-0 overflow-hidden opacity-0" : "max-h-[1000px] opacity-100 py-6"}`}>
            <h1 className="text-center text-2xl lg:text-3xl mb-4 text-red-500 font-semibold">
              <span className="text-blue-600">Total</span> Attendance
            </h1>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left text-md lg:text-xl font-semibold">Subject</th>
                    <th className="py-3 px-4 text-center text-md lg:text-xl font-semibold">Total Lectures</th>
                    <th className="py-3 px-4 text-center text-md lg:text-xl font-semibold">Lectures Attended</th>
                  </tr>
                </thead>
                <tbody>
                  {Attendance?.map((item, idx) => {
                    let totalnooflec = 0;
                    let noofattend = 0;
                    item?.subject?.forEach(element => {
                      if (element.name.includes(semester)) {
                        totalnooflec += element.totalnoLec || 0;
                        noofattend += element.noofLecAttended || 0;
                      }
                    });
                    return (totalnooflec !== 0 && noofattend !== 0 ? (
                      <tr key={idx} className={`border-t ${(noofattend / totalnooflec) * 100 < 75 ? "bg-red-100" : "bg-white"} hover:bg-blue-50`}>
                        <td className="py-2 px-4 text-md lg:text-lg font-medium">{item?.subject?.[0]?.name}</td>
                        <td className="py-2 px-4 text-md lg:text-lg text-center">{totalnooflec}</td>
                        <td className="py-2 px-4 text-md lg:text-lg text-center">{noofattend}</td>
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
