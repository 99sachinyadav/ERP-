import React from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";
import ModuleState from "./ui/module-state";
import { useNavigate } from "react-router-dom";

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

const getAvailableMarkSemesters = (students, currentSemester) => {
  const semesters = new Set();
  if (currentSemester) semesters.add(currentSemester);
  students.forEach((student) => {
    (student?.marks || []).forEach((mark) => {
      if (mark?.semester) semesters.add(mark.semester);
    });
  });
  return Array.from(semesters);
};

const MonitorMarks = () => {
  const [popupStudent, setPopupStudent] = useState(null);
  const [section, setsection] = useState("");
  const [year, setyear] = useState("");
  const [batch, setbatch] = useState("");
  const [students, setstudents] = useState([]);
  const [semester, setsemester] = useState("");
  const [selectedMarksSemester, setSelectedMarksSemester] = useState("");
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

  const openMarksPopup = (student, exam) => {
    setPopupStudent(student);
    setSelectedExam(exam);
  };

  const downloadMarksPdf = (student) => {
    if (!student) return;
    const popupWindow = window.open("", "_blank", "width=900,height=700");
    if (!popupWindow) return;

    const marks = Array.isArray(student?.marks) ? student.marks : [];
    const currentSemesterMarks = marks.filter(
      (mark) => !activeMarksSemester || mark?.semester === activeMarksSemester
    );

    const renderExamTable = (exam) => {
      const rows = currentSemesterMarks
        .filter(
          (mark) => String(mark?.exam || "").toUpperCase() === exam
        )
        .map((mark) => {
          const obtained = Number(mark?.obtainedMarks || 0);
          const total = Number(mark?.totalMarks || 0);
          const percent = total ? ((obtained / total) * 100).toFixed(2) : "-";
          return `
            <tr>
              <td>${mark?.subject || "-"}</td>
              <td>${obtained}</td>
              <td>${total}</td>
              <td>${percent}${percent !== "-" ? "%" : ""}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <h2>${exam} Marks</h2>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Obtained</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='4'>No marks data available.</td></tr>"}
          </tbody>
        </table>
      `;
    };

    const html = `
      <html>
        <head>
          <title>Marks Report</title>
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
          <h1>Marks Report</h1>
          <div class="meta">Name: ${student.name || "-"} | Roll No: ${student.rollno || "-"}</div>
          <div class="meta">Father's Name: ${student.father_name || "-"}</div>
          <div class="meta">Semester: ${activeMarksSemester || "-"}</div>
          ${renderExamTable("ST1")}
          ${renderExamTable("ST2")}
          ${renderExamTable("PUT")}
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
          admintoken: adminLikeToken ? adminLikeToken : null,
        },
      });

      if (responce.data.sucess) {
        const sortedStudents = [...(responce.data.findSection.students || [])].sort(
          (a, b) => Number(a.rollno) - Number(b.rollno)
        );
        setstudents(sortedStudents);
        setsemester(responce.data.findSection.semester);
        setSelectedMarksSemester(responce.data.findSection.semester || "");
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
    setSelectedExam("ALL");
  };

  const clearSearch = () => {
    setSearchRoll("");
    setSearchMessage("");
    setPopupStudent(null);
  };
  const availableMarkSemesters = getAvailableMarkSemesters(students, semester);
  const activeMarksSemester = selectedMarksSemester || semester;

  const popupMarks = popupStudent
    ? selectedExam === "ALL"
      ? (popupStudent.marks || []).filter(
          (mark) => !activeMarksSemester || mark?.semester === activeMarksSemester
        )
      : getMarksForExam(popupStudent, selectedExam, activeMarksSemester)
    : [];
  const popupTotals = popupStudent
    ? getExamTotals(popupStudent, selectedExam, activeMarksSemester)
    : { obtained: 0, total: 0 };

  const navigate = useNavigate();
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
        {hasSearched && students.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">
              Marks Semester
            </label>
            <select
              value={activeMarksSemester}
              onChange={(e) => setSelectedMarksSemester(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {availableMarkSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
        ) : null}
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
                const st1Total = getExamTotals(student, "ST1", activeMarksSemester);
                const st2Total = getExamTotals(student, "ST2", activeMarksSemester);
                const putTotal = getExamTotals(student, "PUT", activeMarksSemester);

                return (
                  <React.Fragment key={student.rollno}>
                    <tr className={`even:bg-gray-50 ${popupStudent ? "opacity-40" : ""}`}>
                      <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                        {student?.name}
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
                        <td colSpan={6}>
                          <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-40 z-50">
                            <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[90vw]">
                              <h2 className="text-lg font-bold mb-2">
                                Student Marks Details {selectedExam === "ALL" ? "(All Exams)" : `(${selectedExam})`}
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
                                {selectedExam === "ALL"
                                  ? "All Marks"
                                  : `Subject-wise Marks (${selectedExam})`}
                              </h3>

                              {popupMarks.length > 0 ? (
                                <table className="w-full text-xs mb-2">
                                  <thead>
                                    <tr>
                                      {selectedExam === "ALL" ? (
                                        <>
                                          <th className="border px-2 py-1">Exam</th>
                                          <th className="border px-2 py-1">Subject</th>
                                        </>
                                      ) : (
                                        <th className="border px-2 py-1">Subject</th>
                                      )}
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
                                          {selectedExam === "ALL" ? (
                                            <>
                                              <td className="border px-2 py-1">{mark?.exam || "-"}</td>
                                              <td className="border px-2 py-1">{mark?.subject || "-"}</td>
                                            </>
                                          ) : (
                                            <td className="border px-2 py-1">{mark?.subject || "-"}</td>
                                          )}
                                          <td className="border px-2 py-1">{obtained}</td>
                                          <td className="border px-2 py-1">{total}</td>
                                          <td className="border px-2 py-1">
                                            {total ? `${((obtained / total) * 100).toFixed(2)}%` : "-"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {selectedExam !== "ALL" ? (
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
                                    ) : null}
                                  </tbody>
                                </table>
                              ) : (
                                <div>No marks available for this semester.</div>
                              )}

                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  className="px-4 py-2 bg-blue-500 text-white rounded"
                                  onClick={() => downloadMarksPdf(popupStudent)}
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

export default MonitorMarks;
