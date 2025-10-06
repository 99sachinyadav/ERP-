import React from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { backendUrl } from '@/App';
const MonitorAttendence = () => {
  const [popupStudent, setPopupStudent] = useState(null);
  const [section, setsection] = useState("");
  const [year, setyear] = useState("");
  const [batch, setbatch] = useState("");
  const [students, setstudents] = useState([]);
  const [Attendance, setAttendance] = useState([]);
  const [semester, setsemester] = useState("");
  const getStudent = async () => {
    try {
      // console.log(localStorage.getItem("teacherToken"));
      const responce = await axios.get(
        backendUrl + "/api/gelStudentBySection",
        {
          params: {
            section,
            year,
            batch,
          },
          headers: {
            teachertoken: localStorage.getItem("teacherToken")
              ? localStorage.getItem("teacherToken")
              : null,
            admintoken: localStorage.getItem("adminToken")
              ? localStorage.getItem("adminToken")
              : null,
          },
        }
      );
      console.log(responce.data);
      if (responce.data.sucess) {
        setstudents(responce.data.findSection.students);
        setAttendance(responce.data.attendance);
        setsemester(responce.data.findSection.semester);
        toast.success(responce.data.message);
      }
    } catch (error) {
      console.log(error.response.data.message );
      toast.error(error. response.data.message);
    }
  };
  return (
    <div className={`flex flex-col  `}>
      <div
        className={`grid grid-cols-4 items-center justify-items-center border border-gray-300 gap-4 p-4 bg-white ${
          popupStudent ? " bg-black opacity-40 " : ""
        } rounded-lg shadow-md`}
      >
        <input
          value={section}
          onChange={(e) => setsection(e.target.value)}
          placeholder="Enter your Section"
          type="text"
          className="border border-gray-300 rounded sm:w-40 px-3 w-20 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <select
          value={year}
          onChange={(e) => setyear(e.target.value)}
          className="border border-gray-300 rounded sm:w-40 w-20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="Ist">1st Year</option>
          <option value="IInd">2nd Year</option>
          <option value="IIIrd">3rd Year</option>
          <option value="IVth">4th Year</option>
        </select>
       
        <input
          value={batch}
          onChange={(e) => setbatch(e.target.value)}
          placeholder="Enter Starting year here"
          type="text"
          className="border border-gray-300 rounded sm:w-40 w-20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={() => getStudent()}
          className="px-2 py-2 rounded-lg text-lg font-semibold text-white bg-blue-500 w-20 sm:w-40"
        >
          Track
        </button>
      </div>
      <table className="w-full border-collapse mt-5">
        <thead>
          <tr>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">
              Name
            </th>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">
              Attendance
            </th>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
              Father's Name
            </th>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
              ROLL NO
            </th>
          </tr>
        </thead>
        <tbody>
          {students &&
            students.map((student, idx) => {
              // Calculate total lectures and attendance
              let totalLec = 0;
              let totalAttend = 0;
              if (student.attendance) {
                student.attendance.forEach((attend) => {
                  if (Array.isArray(attend.subject)) {
                    attend.subject.forEach((att) => {
                      // Replace 'noofLecAttended' and 'totalnoLec' with actual property names from your data
                      //  console.log(att)
                      if(att.name.includes(semester)){
                         totalAttend += att.noofLecAttended || 0;
                      totalLec += att.totalnoLec || 0;
                      }
                    });
                  }
                });
              }

              return (
                <>
                  <tr
                    onClick={() => setPopupStudent(student)}
                    key={student.rollno}
                    className={`${
                      ((totalAttend / totalLec) * 100).toFixed(2) < 75
                        ? "bg-red-400"
                        : "even:bg-gray-50"
                    } ${popupStudent && popupStudent ? "opacity-40" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                      {student?.name}
                    </td>
                    <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                      {totalLec > 0
                        ? `${((totalAttend / totalLec) * 100).toFixed(2)}%`
                        : "N/A"}
                    </td>
                    <td className="border border-gray-300 text-xs text-wrap sm:text-lg text-center sm:px-4 py-2">
                      {student?.father_name}
                    </td>
                    <td className="border border-gray-300 whitespace-normal max-w-[120px] text-xs">
                      {student?.rollno}
                    </td>
                  </tr>
                  {popupStudent && popupStudent.rollno === student.rollno && (
                    <tr>
                      <td colSpan={4}>
                        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-40 z-50">
                          <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[90vw]">
                            <h2 className="text-lg font-bold mb-2">
                              Student Attendance Details
                            </h2>
                            <p>
                              <strong>Name:</strong> {popupStudent.name}
                            </p>
                            <p>
                              <strong>Roll No:</strong> {popupStudent.rollno}
                            </p>
                            <p>
                              <strong>Father's Name:</strong>{" "}
                              {popupStudent.father_name}
                            </p>
                            <h3 className="font-semibold mt-4 mb-2">
                              Subject-wise Attendance
                            </h3>
                            {popupStudent.attendance &&
                            popupStudent.attendance.length > 0 ? (
                              popupStudent.attendance.map((attend, i) => {
                                let totalLec = 0;
                                let totalAttend = 0;
                                let subjectName = "";
                                {
                                  attend.subject &&
                                    attend.subject.forEach((subj) => {
                                       if(subj.name.includes(semester)){
                                           totalAttend += subj.noofLecAttended || 0;
                                           totalLec += subj.totalnoLec || 0;
                                           subjectName = subj.name || "";
                                       }
                                    });
                                }
                                return (
                                  <div key={i} className="mb-2">
                                    {Array.isArray(attend.subject) && totalLec!=0 && totalAttend!=0 &&
                                    attend.subject.length > 0 ? (
                                      <table className="w-full text-xs mb-2">
                                        <thead>
                                          <tr>
                                            <th className="border px-2 py-1">
                                              Subject
                                            </th>
                                            <th className="border px-2 py-1">
                                              Total Lectures
                                            </th>
                                            <th className="border px-2 py-1">
                                              Lectures Attended
                                            </th>
                                            <th className="border px-2 py-1">
                                              Attendance %
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr
                                            key={i}
                                            className={`${
                                              (
                                                (totalAttend / totalLec) *
                                                100
                                              ).toFixed(2) < 75
                                                ? "bg-red-400"
                                                : "even:bg-gray-50"
                                            }`}
                                          >
                                            <td className="border px-2 py-1">
                                              {subjectName || "N/A"}
                                            </td>
                                            <td className="border px-2 py-1">
                                              {totalLec || 0}
                                            </td>
                                            <td className="border px-2 py-1">
                                              {totalAttend || 0}
                                            </td>
                                            <td className="border px-2 py-1">
                                              {totalLec > 0
                                                ? `${(
                                                    (totalAttend / totalLec) *
                                                    100
                                                  ).toFixed(2)}%`
                                                : "N/A"}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    ) : (
                                      null
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div>No attendance data available.</div>
                            )}
                            <button
                              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                              onClick={() => setPopupStudent(null)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default MonitorAttendence;
