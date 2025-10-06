import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {Dialog,  DialogContent,DialogDescription,  DialogHeader,DialogTitle,DialogTrigger,} from "@/components/ui/dialog"
import { Teacher } from "../assets/assetes";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input"
import {toast} from "react-hot-toast";

import { Button } from "@/Components/ui/button";
import axios from "axios";
import { backendUrl } from "@/App";
 


const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [students, setstudents] = React.useState([]);
  const [attendance, setAttendance] = React.useState([]);
  const [semester, setsemester] = React.useState("");

  const [year, setyear] = React.useState("");
  const [section, setsection] = React.useState("");
  const [batch, setbatch] = React.useState("");
   
  const [mydata,setmydata]= React.useState([]);
  const logout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teachername"); 
    localStorage.removeItem("teachersection");
    navigate("/teacherlogin");
 

  };


  const sendEmailStudents = async() => {
    try {
      const response = await axios.post(backendUrl + "/api/send-email", {
      
        year,
        section,
        batch
      }, {
        headers: { teachertoken: localStorage.getItem("teacherToken") }
      });
          console.log(response );
      if (response.data.success) {
        toast.success(response.data.message || "Emails sent successfully");
      } else {
        toast.error(response.data.message || "Failed to send emails");
      }
    } catch (error) {
      // console.log(error)
      console.log(error.response?.data?.message || error.message);
      toast.error("Error in sending emails");
    }
  }

  useEffect(() => {
  const getAttendanceData = async () => {
    try {
    if(localStorage.getItem("teachersection")){
        const str = localStorage.getItem("teachersection").split(',')[1];
      const underscoreIndex = str.indexOf("_");

      const sectionVal = str[0];
      const batchVal = str.substring(underscoreIndex + 1).trim();
      const yearVal = str.substring(1, underscoreIndex).trim();
      console.log(sectionVal, yearVal, batchVal);
    
 

      const response = await axios.get(backendUrl + "/api/gelStudentBySection", {
        params: { section: sectionVal, year: yearVal, batch: batchVal },
        headers: { teachertoken: localStorage.getItem("teacherToken") }
      });

      if (response.data.sucess) {
        const studentsFromResponse = response.data.findSection.students;
        console.log(studentsFromResponse);
        setstudents(studentsFromResponse);
        setAttendance(response.data.attendance);
        setsemester(response.data.findSection.semester);

        const newData = studentsFromResponse.map(student => {
          let totalLec = 0;
          let totalAttend = 0;
          if (student.attendance) {
            student.attendance.forEach(attend => {
              if (Array.isArray(attend.subject)) {
                attend.subject.forEach(att => {
                  if (att.name.includes(response.data.findSection.semester)) {
                    totalAttend += att.noofLecAttended || 0;
                    totalLec += att.totalnoLec || 0;
                  }
                });
              }
            });
          }
          return { name: student.name, attendance: totalLec ? Math.round((totalAttend / totalLec) * 100) : 0 };
        });

        setmydata(newData);
      }
       
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
      alert("Error in fetching data");
    }
  };

  getAttendanceData();
}, []);
 console.log(mydata);
  
     const data = [
  { name: "Jhon", attendance: 40 },
  { name: "Doe", attendance: 30 },
  { name: "Smith", attendance: 20 },
  { name: "Sachin", attendance: 27 },
  { name: "Jack", attendance: 18 },
]
console.log(mydata.length)
  return (
    <div className="relative h-full overflow-y-hidden bg-gradient-to-br from-blue-100 via-white to-blue-300">
      <div className="text-2xl text-center pt-8 border-t">
        <div
          onClick={logout}
          className="flex items-center w-28 sm:w-35 absolute py-2 sm:right-6 right-2 justify-center p-2 px-4 rounded-4xl cursor-pointer bg-blue-500 text-white m-1 top-6 hover:bg-blue-600 transition-all"
        >
          <i className="ri-arrow-left-line text-xl sm:text-3xl"></i>
          <span className="ml-2 font-semibold text-xs sm:text-md">LOG OUT</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl flex justify-center mt-10 font-bold text-blue-900 text-wrap">
          Teacher <span className="text-red-500 ml-3">Pannel</span>
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center my-8 gap-8 md:gap-16 px-4 md:px-16">
        {/* <img
          src={Teacher}
          className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl object-contain"
          alt=""
        /> */}
     <Card className="w-full max-w-lg bg-black/5 shadow-md">
  <CardHeader>
    <CardTitle>Attendance % Data</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Scrollable wrapper */}
    <div className="overflow-x-auto">
      <div className={`h-64`} style={{ width: 400}}>
        <BarChart
          width={400}  // dynamic width based on number of students
          height={256}                 // fixed height
          data={mydata.length === 0 ? data : mydata}
          
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          {/* X-axis: student names */}
          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
          
          {/* Y-axis: attendance percentage */}
          <YAxis />
          
          {/* Tooltip */}
          <Tooltip />
          
          {/* Bars */}
          <Bar className="w-10" dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </div>
    </div>
  </CardContent>
</Card>


        <div className="flex flex-col justify-center  gap-0 w-full md:w-2/4 text-gray-600 mt-6 md:mt-0">

           {/* <h1 className="sm:text-4xl text-3xl sm:mt-5 ml-6 sm:ml-10 font-bold text-gray-800">Hii ! <span className="text-blue-500">{localStorage.getItem('teachername')}</span> Welcome to Attendance Portal</h1>
            <h1 className="sm:text-2xl text-1xl sm:mt-4 ml-6 sm:ml-15 font-bold text-gray-500">{localStorage.getItem('teachersection')?`Your assigned Section is ${localStorage.getItem('teachersection')}`:`You haven't assigned  any section yet`}</h1> */}
            <h1 className="sm:text-4xl text-3xl sm:mt-6 ml-6 sm:ml-10 font-bold text-gray-800">
  Hii ! <span className="text-blue-600">{localStorage.getItem('teachername')}</span> Welcome to Attendance Portal
</h1>

<h2 className="sm:text-2xl text-xl sm:mt-3 ml-6 sm:ml-10 font-medium text-gray-600">
  {localStorage.getItem('teachersection')
    ? `Assigned Section: ${localStorage.getItem('teachersection')}`
    : `No section has been assigned to you yet`}
</h2>
          <div className="flex mt-0 flex-col items-center sm:flex-row sm:justify-center md:flex-row gap-4 md:gap-4 w-full">
            <div
              onClick={() => {
                navigate("/dashboard");
              }}
              className="bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <i className="ri-stack-line text-5xl md:text-7xl"></i>
              <h1 className="text-lg md:text-xl font-semibold">MARK ATTENDANCE</h1>
            </div>

            <div
              onClick={() => {
                navigate("/monitorStudents");
              }}
              className="bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-lg p-4 h-55 w-70 md:h-60 md:w-60 text-center m-4 md:m-8 flex items-center justify-center gap-4 md:gap-6 flex-col shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <i className="ri-graduation-cap-line text-5xl md:text-7xl"></i>
              <h1 className="text-lg md:text-xl font-semibold">
                 MONITOR STUDENTS
              </h1>
            </div>
          </div>
        <h5 className="text-lg md:text-xl sm:ml-17 font-semibold ml-5">Send Email to those whose Attendance is below the criteria</h5>
          <Dialog>
  <DialogTrigger className="px-4 py-2 bg-blue-500 sm:w-35 sm:ml-17 sm:mt-5 mt-5 w-full m-2 text-white rounded hover:bg-blue-600">Send Email</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Send Email to students having less Attendance</DialogTitle>
      <DialogDescription className={"flex flex-col gap-5 mt-5"}>
       
            <select
                            value={year}
                            onChange={(e) => setyear(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="Ist">Ist</option>
                            <option value="IInd">IInd</option>
                            <option value="IIIrd">IIIrd</option>
                            <option value="IVth">IVth</option>
                        </select>
   
       <Input value={section} onChange={(e) => setsection(e.target.value)} type="text" placeholder="Enter section"  />
       <Input value={batch} onChange={(e) => setbatch(e.target.value)} type="text" placeholder="Enter batch"  />
       <Button onClick={sendEmailStudents} className="bg-blue-500 hover:bg-blue-600">Send Email</Button>
        This action will send Email to all students having less attendance of this section fill the section detail to send email.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
           
        </div>
      </div>
      <div className="text-2xl py-4">
        <h1 className=" text-3xl sm:text-3xl   flex justify-center sm:mt-10 mt-8 font-bold  text-blue-900   text-wrap ">
          ACTIVITES <span className="text-red-500 ml-3">TO MONITOR </span>
        </h1>
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>STUDENT MONITOR</b>
          <p className="text-gray-600">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo
            molestias, aliquam repellat laborum odit in ducimus perferendis quod
            nihi
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>MARK ATTENDENCE:</b>
          <p className="text-gray-600">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo
            molestias, aliquam repellat laborum odit in ducimus perferendis quod
            nihi
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>ADD SUBJECT :</b>
          <p className="text-gray-600">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo
            molestias, aliquam repellat laborum odit in ducimus perferendis quod
            nihi
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
