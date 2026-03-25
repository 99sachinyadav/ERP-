import React from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { backendUrl } from '@/App';
import ModuleState from "./ui/module-state";
import { useNavigate } from "react-router-dom";
const MonitorAttendence = () => {
  const [popupStudent, setPopupStudent] = useState(null);
  const [section, setsection] = useState("");
  const [year, setyear] = useState("");
  const [batch, setbatch] = useState("");
  const [students, setstudents] = useState([]);
  const [Attendance, setAttendance] = useState([]);
  const [semester, setsemester] = useState("");
  const [selectedExam, setSelectedExam] = useState("ST1");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const adminLikeToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("deanToken") ||
    localStorage.getItem("directorToken");

  const downloadAttendancePdf = (student) => {
    if (!student) return;
    const popupWindow = window.open("", "_blank", "width=900,height=700");
    if (!popupWindow) return;

    let subjectRows = "";
    if (student.attendance && student.attendance.length > 0) {
      student.attendance.forEach((attend) => {
        let totalLec = 0;
        let totalAttend = 0;
        let subjectName = "";
        attend.subject &&
          attend.subject.forEach((subj) => {
            if (subj.name && subj.name.includes(semester)) {
              totalAttend += subj.noofLecAttended || 0;
              totalLec += subj.totalnoLec || 0;
              subjectName = subj.name || "";
            }
          });
        if (subjectName && totalLec) {
          const percent = ((totalAttend / totalLec) * 100).toFixed(2);
          subjectRows += `
            <tr>
              <td>${subjectName}</td>
              <td>${totalLec}</td>
              <td>${totalAttend}</td>
              <td>${percent}%</td>
            </tr>
          `;
        }
      });
    }

    const html = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 8px; }
            h2 { font-size: 16px; margin-top: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
            .meta { font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>Attendance Report</h1>
          <div class="meta">Name: ${student.name || "-"} | Roll No: ${student.rollno || "-"}</div>
          <div class="meta">Father's Name: ${student.father_name || "-"}</div>
          <h2>Subject-wise Attendance</h2>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total Lectures</th>
                <th>Lectures Attended</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              ${subjectRows || "<tr><td colspan='4'>No attendance data available.</td></tr>"}
            </tbody>
          </table>
        </body>
      </html>
    `;
    popupWindow.document.write(html);
    popupWindow.document.close();
    popupWindow.focus();
    popupWindow.print();
  };
  const getStudent = async () => {
    setLoading(true);
    setErrorMessage("");
    setHasSearched(true);
    setSearchMessage("");
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
            admintoken: adminLikeToken ? adminLikeToken : null,
          },
        }
      );
      // console.log(responce.data);
      if (responce.data.sucess) {
        const sortedStudents = [...(responce.data.findSection.students || [])].sort(
          (a, b) => Number(a.rollno) - Number(b.rollno)
        );
        setstudents(sortedStudents);
        setAttendance(responce.data.attendance);
        setsemester(responce.data.findSection.semester);
        toast.success(responce.data.message);
      } else {
        setstudents([]);
        setErrorMessage(responce.data.message || "Unable to fetch students.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Unable to fetch students.";
      console.log(msg);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchMessage("");
    const roll = String(searchRoll || "").trim();
    if (!roll) {
      setSearchMessage("Enter a roll number to search.");
      return;
    }
    const found = students.find(
      (student) => String(student?.rollno || "").trim() === roll
    );
    if (!found) {
      setPopupStudent(null);
      setSearchMessage("No student found with this roll number.");
      return;
    }
    setPopupStudent(found);
  };

  const clearSearch = () => {
    setSearchRoll("");
    setSearchMessage("");
    setPopupStudent(null);
  };
  const navigate = useNavigate();
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
          onChange={(e) => setbatch(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter Starting year here"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          className="border border-gray-300 rounded sm:w-40 w-20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={() => getStudent()}
          disabled={loading}
          className="px-2 py-2 rounded-lg text-lg font-semibold text-white bg-blue-500 w-20 sm:w-40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Track"}
        </button>
      </div>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              placeholder="Search by roll no"
              type="text"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition md:w-64"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={clearSearch}
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <i className="ri-arrow-left-line text-base"></i>
            Back
          </button>
        </div>
        {searchMessage ? (
          <p className="mt-2 text-sm text-slate-600">{searchMessage}</p>
        ) : null}
      </div>
      <div className="mt-5">
        {loading ? (
          <ModuleState type="loading" title="Fetching attendance" />
        ) : errorMessage ? (
          <ModuleState
            type="error"
            title="Unable to load attendance"
            message={errorMessage}
            actionLabel="Retry"
            onAction={getStudent}
          />
        ) : hasSearched && students.length === 0 ? (
          <ModuleState
            type="empty"
            title="No students found"
            message="Try a different section, year, or batch."
          />
        ) : !hasSearched ? (
          <ModuleState
            type="empty"
            title="Track a class to view attendance"
            message="Apply filters above and click Track."
          />
        ) : (
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
                <React.Fragment key={student.rollno}>
                  <tr
                    onClick={() => setPopupStudent(student)}
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
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={() => downloadAttendancePdf(popupStudent)}
                              >
                                Download PDF
                              </button>
                              <button
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded"
                                onClick={() => setPopupStudent(null)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
        )}
      </div>
    </div>
  );
};

export default MonitorAttendence;
