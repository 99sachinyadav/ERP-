import React from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";
import ModuleState from "./ui/module-state";

const EXAMS = ["ST1", "ST2", "PUT"];

const getMarksForExam = (student, exam, semester) => {
  const marks = Array.isArray(student?.marks) ? student.marks : [];
  return marks.filter(
    (mark) =>
      String(mark?.exam || "").toUpperCase() === exam &&
      (!semester || mark?.semester === semester)
  );
};

const getExamTotals = (student, exam, semester) => {
  const examMarks = getMarksForExam(student, exam, semester);
  return examMarks.reduce(
    (acc, mark) => ({
      obtained: acc.obtained + Number(mark?.obtainedMarks || 0),
      total: acc.total + Number(mark?.totalMarks || 0),
    }),
    { obtained: 0, total: 0 }
  );
};

const formatTotal = ({ obtained, total }) => {
  if (!total) return "-";
  return `${obtained}/${total}`;
};

const getAttendancePercent = (student, semester) => {
  let totalLec = 0;
  let totalAttend = 0;

  if (Array.isArray(student?.attendance)) {
    student.attendance.forEach((attend) => {
      if (Array.isArray(attend?.subject)) {
        attend.subject.forEach((subj) => {
          if (!semester || String(subj?.name || "").includes(semester)) {
            totalAttend += Number(subj?.noofLecAttended || 0);
            totalLec += Number(subj?.totalnoLec || 0);
          }
        });
      }
    });
  }

  if (!totalLec) return "N/A";
  return `${((totalAttend / totalLec) * 100).toFixed(2)}%`;
};

const MonitorMarks = () => {
  const [popupStudent, setPopupStudent] = useState(null);
  const [section, setsection] = useState("");
  const [year, setyear] = useState("");
  const [batch, setbatch] = useState("");
  const [students, setstudents] = useState([]);
  const [semester, setsemester] = useState("");
  const [selectedExam, setSelectedExam] = useState("ST1");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const openMarksPopup = (student, exam) => {
    setPopupStudent(student);
    setSelectedExam(exam);
  };

  const getStudent = async () => {
    setLoading(true);
    setErrorMessage("");
    setHasSearched(true);
    try {
      const responce = await axios.get(backendUrl + "/api/gelStudentBySection", {
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
      });

      if (responce.data.sucess) {
        const sortedStudents = [...(responce.data.findSection.students || [])].sort(
          (a, b) => Number(a.rollno) - Number(b.rollno)
        );
        setstudents(sortedStudents);
        setsemester(responce.data.findSection.semester);
        toast.success(responce.data.message);
      } else {
        setstudents([]);
        setErrorMessage(responce.data.message || "Unable to fetch students.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Unable to fetch students.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const popupMarks = popupStudent
    ? getMarksForExam(popupStudent, selectedExam, semester)
    : [];
  const popupTotals = popupStudent
    ? getExamTotals(popupStudent, selectedExam, semester)
    : { obtained: 0, total: 0 };

  return (
    <div className="flex flex-col">
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
          disabled={loading}
          className="px-2 py-2 rounded-lg text-lg font-semibold text-white bg-blue-500 w-20 sm:w-40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Track"}
        </button>
      </div>

      <div className="mt-5">
        {loading ? (
          <ModuleState type="loading" title="Fetching students" />
        ) : errorMessage ? (
          <ModuleState
            type="error"
            title="Unable to load student data"
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
            title="Track a class to view marks"
            message="Apply filters above and click Track."
          />
        ) : (
          <table className="w-full border-collapse mt-5">
            <thead>
              <tr>
                <th className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">
                  Name
                </th>
                <th className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">
                  Attendance
                </th>
                <th className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
                  Father&apos;s Name
                </th>
                <th className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
                  Roll No
                </th>
                {EXAMS.map((exam) => (
                  <th
                    key={exam}
                    className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center"
                  >
                    {exam} Total
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const st1Total = getExamTotals(student, "ST1", semester);
                const st2Total = getExamTotals(student, "ST2", semester);
                const putTotal = getExamTotals(student, "PUT", semester);

                return (
                  <React.Fragment key={student.rollno}>
                    <tr className={`even:bg-gray-50 ${popupStudent ? "opacity-40" : ""}`}>
                      <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                        {student?.name}
                      </td>
                      <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                        {getAttendancePercent(student, semester)}
                      </td>
                      <td className="border border-gray-300 text-xs text-wrap sm:text-lg text-center sm:px-4 py-2">
                        {student?.father_name}
                      </td>
                      <td className="border border-gray-300 whitespace-normal max-w-[120px] text-xs text-center">
                        {student?.rollno}
                      </td>
                      <td className="border border-gray-300 text-xs sm:text-sm text-center px-2 py-2">
                        <button
                          onClick={() => openMarksPopup(student, "ST1")}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {formatTotal(st1Total)}
                        </button>
                      </td>
                      <td className="border border-gray-300 text-xs sm:text-sm text-center px-2 py-2">
                        <button
                          onClick={() => openMarksPopup(student, "ST2")}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {formatTotal(st2Total)}
                        </button>
                      </td>
                      <td className="border border-gray-300 text-xs sm:text-sm text-center px-2 py-2">
                        <button
                          onClick={() => openMarksPopup(student, "PUT")}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {formatTotal(putTotal)}
                        </button>
                      </td>
                    </tr>

                    {popupStudent && popupStudent.rollno === student.rollno && (
                      <tr>
                        <td colSpan={7}>
                          <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-40 z-50">
                            <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[90vw]">
                              <h2 className="text-lg font-bold mb-2">
                                Student Marks Details ({selectedExam})
                              </h2>
                              <p>
                                <strong>Name:</strong> {popupStudent.name}
                              </p>
                              <p>
                                <strong>Roll No:</strong> {popupStudent.rollno}
                              </p>
                              <p>
                                <strong>Father&apos;s Name:</strong> {popupStudent.father_name}
                              </p>
                              <h3 className="font-semibold mt-4 mb-2">
                                Subject-wise Marks ({selectedExam})
                              </h3>

                              {popupMarks.length > 0 ? (
                                <table className="w-full text-xs mb-2">
                                  <thead>
                                    <tr>
                                      <th className="border px-2 py-1">Subject</th>
                                      <th className="border px-2 py-1">Obtained</th>
                                      <th className="border px-2 py-1">Total</th>
                                      <th className="border px-2 py-1">Percentage</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {popupMarks.map((mark, i) => {
                                      const obtained = Number(mark?.obtainedMarks || 0);
                                      const total = Number(mark?.totalMarks || 0);
                                      return (
                                        <tr key={`${mark?.subject}-${i}`} className="even:bg-gray-50">
                                          <td className="border px-2 py-1">{mark?.subject || "-"}</td>
                                          <td className="border px-2 py-1">{obtained}</td>
                                          <td className="border px-2 py-1">{total}</td>
                                          <td className="border px-2 py-1">
                                            {total ? `${((obtained / total) * 100).toFixed(2)}%` : "-"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    <tr className="bg-blue-50 font-semibold">
                                      <td className="border px-2 py-1 text-right">Total</td>
                                      <td className="border px-2 py-1">{popupTotals.obtained}</td>
                                      <td className="border px-2 py-1">{popupTotals.total}</td>
                                      <td className="border px-2 py-1">
                                        {popupTotals.total
                                          ? `${((popupTotals.obtained / popupTotals.total) * 100).toFixed(2)}%`
                                          : "-"}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              ) : (
                                <div>No {selectedExam} marks available for this semester.</div>
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

export default MonitorMarks;
