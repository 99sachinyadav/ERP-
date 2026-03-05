import axios from "axios";
import { User, logo } from "../assets/assets";
import { backendUrl } from "@/App";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
 
function Profile() {
  const navigate = useNavigate();
  const [response, setresponce] = useState();
  const [Attendance, setAttendance] = useState([]);
  const [isOpen, setisOpen] = useState(false);
  const [semester, setSemester] = useState("");
  const [marks, setMarks] = useState([]);
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
        setMarks(response.data.profile.marks || []);
      }
    } catch (error) {
      console.log(error); // Set error message
      toast.error(error.response.data.message); // Display error message
    }
  };
  const handleDownloadResult = () => {
    window.print();
  };
  const ATTENDANCE_THRESHOLD = 75;
  const getAttendanceInsight = (totalLectures, attendedLectures) => {
    if (!totalLectures) {
      return {
        percent: "0.00",
        isLow: false,
        message: "No lectures conducted yet.",
      };
    }
    const percent = ((attendedLectures / totalLectures) * 100).toFixed(2);
    const isLow = Number(percent) < ATTENDANCE_THRESHOLD;
    if (!isLow) {
      return {
        percent,
        isLow,
        message: `On track (${ATTENDANCE_THRESHOLD}%+).`,
      };
    }
    const thresholdDecimal = ATTENDANCE_THRESHOLD / 100;
    const requiredLectures = Math.max(
      0,
      Math.ceil(
        (thresholdDecimal * totalLectures - attendedLectures) /
          (1 - thresholdDecimal)
      )
    );
    return {
      percent,
      isLow,
      message: `Attend next ${requiredLectures} lecture(s) to reach ${ATTENDANCE_THRESHOLD}%.`,
    };
  };

  const groupedMarks = useMemo(() => {
    const base = { ST1: [], ST2: [], PUT: [] };
    marks
      ?.filter((m) => m.semester === semester)
      .forEach((m) => {
        if (base[m.exam]) {
          base[m.exam].push(m);
        }
      });
    return base;
  }, [marks, semester]);

  const subjectsForSemester = useMemo(() => {
    const subs = response?.subjects || [];
    if (!semester) return subs;
    return subs.filter((s) => String(s).includes(semester));
  }, [response?.subjects, semester]);

  const marksByExamAndSubject = useMemo(() => {
    const map = { ST1: new Map(), ST2: new Map(), PUT: new Map() };
    ["ST1", "ST2", "PUT"].forEach((exam) => {
      groupedMarks[exam]?.forEach((m) => {
        map[exam].set(m.subject, m);
      });
    });
    return map;
  }, [groupedMarks]);

  const totals = useMemo(() => {
    const st1Obt = groupedMarks.ST1.reduce((a, m) => a + Number(m.obtainedMarks || 0), 0);
    const st2Obt = groupedMarks.ST2.reduce((a, m) => a + Number(m.obtainedMarks || 0), 0);
    const putObt = groupedMarks.PUT.reduce((a, m) => a + Number(m.obtainedMarks || 0), 0);

    const st1Max = subjectsForSemester.length * 50;
    const st2Max = subjectsForSemester.length * 50;
    const putMax = subjectsForSemester.length * 70;

    const totalObt = st1Obt + st2Obt + putObt;
    const totalMax = st1Max + st2Max + putMax;
    const st1Percentage = st1Max > 0 ? ((st1Obt / st1Max) * 100).toFixed(2) : "0.00";
    const st2Percentage = st2Max > 0 ? ((st2Obt / st2Max) * 100).toFixed(2) : "0.00";
    const putPercentage = putMax > 0 ? ((putObt / putMax) * 100).toFixed(2) : "0.00";
    const percentage = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : "0.00";

    return {
      st1Obt,
      st2Obt,
      putObt,
      st1Max,
      st2Max,
      putMax,
      totalObt,
      totalMax,
      st1Percentage,
      st2Percentage,
      putPercentage,
      percentage,
    };
  }, [groupedMarks, subjectsForSemester.length]);
 
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <style>{`
        @media print {
          header, footer, nav {
            display: none !important;
          }
        }
      `}</style>
   
      {/* PRINT-ONLY RESULT (sample-style report card) */}
      <div className="hidden print:block p-6 text-black">
        <div className="border border-black bg-white">
          <div className="flex items-center justify-between border-b border-black  p-4">
            <img
              src={logo}
              alt="College Logo"
              className="h-24 w-24 object-contain self-center   p-1 flex-shrink-0"
            />
            <div className="text-center flex-1 px-4">
              <div className="text-lg font-bold ml-10 text-center max-w-[500px] text-wrap">
                Raj Kumar Goel Institute of Technology &amp;
                 Managment (RKGITM)
              </div>
              <div className="mt-1 text-sm font-semibold tracking-wide">FINAL CONSOLIDATED REPORT CARD</div>
            </div>
            <img
              src={response?.avtar ? `data:image/*;base64,${response.avtar}` : User}
              alt="Student"
              className="h-28 w-28 object-cover border border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-[15px]">
            <div><span className="font-bold">Student Name:</span> {response?.name}</div>
            <div><span className="font-bold">Roll No:</span> {response?.rollno}</div>
            <div><span className="font-bold">Father Name:</span> {response?.father_name}</div>
            <div><span className="font-bold">Section:</span> {response?.section}</div>
            <div><span className="font-bold">Semester:</span> {response?.semester}</div>
            <div><span className="font-bold">DOB:</span> {response?.dob}</div>
          </div>

          <div className="px-4 pb-4">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="border border-black p-1 text-left">Subject Name</th>
                  <th className="border border-black p-1 text-center">ST1 (50)</th>
                  <th className="border border-black p-1 text-center">ST2 (50)</th>
                  <th className="border border-black p-1 text-center">PUT (70)</th>
                </tr>
              </thead>
              <tbody>
                {subjectsForSemester.map((subj, idx) => {
                  const st1 = marksByExamAndSubject.ST1.get(subj);
                  const st2 = marksByExamAndSubject.ST2.get(subj);
                  const put = marksByExamAndSubject.PUT.get(subj);
                  const st1v = Number(st1?.obtainedMarks || 0);
                  const st2v = Number(st2?.obtainedMarks || 0);
                  const putv = Number(put?.obtainedMarks || 0);

                  return (
                    <tr key={idx}>
                      <td className="border border-black p-1">{subj}</td>
                      <td className="border border-black p-1 text-center">{st1 ? st1v : "-"}</td>
                      <td className="border border-black p-1 text-center">{st2 ? st2v : "-"}</td>
                      <td className="border border-black p-1 text-center">{put ? putv : "-"}</td>
                    </tr>
                  );
                })}
                {subjectsForSemester.length === 0 && (
                  <tr>
                    <td className="border border-black p-2 text-center" colSpan={4}>
                      No subjects found for this semester.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="border border-black p-1 font-semibold text-right">Total Marks</td>
                  <td className="border border-black p-1 text-center font-semibold">
                    {totals.st1Obt}/{totals.st1Max}
                  </td>
                  <td className="border border-black p-1 text-center font-semibold">
                    {totals.st2Obt}/{totals.st2Max}
                  </td>
                  <td className="border border-black p-1 text-center font-semibold">
                    {totals.putObt}/{totals.putMax}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-semibold text-right">
                    Percentage
                  </td>
                  <td className="border border-black p-1 text-center font-semibold">
                    {totals.st1Percentage}%
                  </td>
                  <td className="border border-black p-1 text-center font-semibold">
                    {totals.st2Percentage}%
                  </td>
                  <td className="border border-black p-1 text-center font-semibold">
                    {totals.putPercentage}%
                  </td>
                </tr>
              </tfoot>
            </table>

          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 p-4 lg:p-12 w-full max-w-7xl mx-auto print:hidden">
 
          <div className="flex flex-col w-full lg:w-1/3 rounded-2xl border border-white/70 shadow-xl bg-white/90 backdrop-blur p-6">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-5">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[2px] shadow-xl">
                  <img
                    src={ response?.avtar ? `data:image/${response.imageType};base64,${response.avtar}` : User  }
                    className="h-36 w-36 lg:h-44 lg:w-44 rounded-[22px] object-cover border-4 border-white"
                    alt="User"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">{response?.name}</h2>
                  <p className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    Roll No: {response?.rollno}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 break-all">{response?.email}</p>
                </div>
                <div className="grid w-full grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-100">
                    <p className="text-[10px] text-slate-500">Section</p>
                    <p className="text-sm font-semibold text-slate-800">{response?.section || "-"}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-100">
                    <p className="text-[10px] text-slate-500">Semester</p>
                    <p className="text-sm font-semibold text-slate-800">{response?.semester || "-"}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-100">
                    <p className="text-[10px] text-slate-500">Year</p>
                    <p className="text-sm font-semibold text-slate-800">{response?.year || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setisOpen(!isOpen)}
              className="bg-blue-600 hover:bg-blue-700 transition w-full mt-3 text-white py-2 rounded-lg font-semibold shadow"
            >
              {isOpen ? "Hide Attendance" : "View Attendance"}
            </button>
          </div>
          {/* Details & Attendance */}
          <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/90 border border-white/70 shadow rounded-xl p-4 gap-3">
            <h1 className="text-xl lg:text-2xl font-semibold text-blue-800">Profile Details</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/marks")}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                See Marks
              </button>
              <button
                onClick={handleDownloadResult}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Download Result
              </button>
            </div>
          </div>
          <table className="w-full bg-white/95 rounded-xl shadow border border-white/70 print:text-xs">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs text-blue-700">Total Obtained</p>
              <h3 className="text-2xl font-bold text-blue-900">{totals.totalObt}</h3>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs text-indigo-700">Total Marks</p>
              <h3 className="text-2xl font-bold text-indigo-900">{totals.totalMax}</h3>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-700">Percentage</p>
              <h3 className="text-2xl font-bold text-emerald-900">{totals.percentage}%</h3>
            </div>
          </div>
          {/* Attendance Table */}
          <div
            className={`w-full bg-white/95 rounded-xl shadow-2xl transition-all duration-300 ${
              !isOpen ? "max-h-0 overflow-hidden opacity-0" : "max-h-[1000px] opacity-100 py-6"
            }`}
          >
            <h1 className="text-center text-2xl lg:text-3xl mb-4 text-red-500 font-semibold">
              <span className="text-blue-600">Total</span> Attendance
            </h1>
            <div className="mb-4 mx-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Minimum attendance required: <b>{ATTENDANCE_THRESHOLD}%</b>. Subjects below this are marked with a warning badge and recommendation.
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left text-md lg:text-xl font-semibold">Subject</th>
                    <th className="py-3 px-4 text-center text-md lg:text-xl font-semibold">Total Lectures</th>
                    <th className="py-3 px-4 text-center text-md lg:text-xl font-semibold">Lectures Attended</th>
                    <th className="py-3 px-4 text-center text-md lg:text-xl font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Attendance?.map((item, idx) => {
                    let totalnooflec = 0;
                    let noofattend = 0;
                    item?.subject?.forEach((element) => {
                      if (element.name.includes(semester)) {
                        totalnooflec += element.totalnoLec || 0;
                        noofattend += element.noofLecAttended || 0;
                      }
                    });
                    const insight = getAttendanceInsight(totalnooflec, noofattend);
                    return totalnooflec !== 0 && noofattend !== 0 ? (
                      <tr
                        key={idx}
                        className={`border-t ${insight.isLow ? "bg-red-100" : "bg-white"} hover:bg-blue-50`}
                      >
                        <td className="py-2 px-4 text-md lg:text-lg font-medium">{item?.subject?.[0]?.name}</td>
                        <td className="py-2 px-4 text-md lg:text-lg text-center">{totalnooflec}</td>
                        <td className="py-2 px-4 text-md lg:text-lg text-center">{noofattend}</td>
                        <td className="py-2 px-4 text-sm text-center">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              insight.isLow ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {insight.percent}% {insight.isLow ? "(Low)" : "(Safe)"}
                          </span>
                          <p className="mt-1 text-xs text-slate-600">{insight.message}</p>
                        </td>
                      </tr>
                    ) : null;
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Marks Tables by exam */}
          <div className="w-full bg-white/95 rounded-xl shadow-2xl mt-4 p-6 print:p-4">
            <h1 className="text-center text-2xl lg:text-3xl mb-4 text-blue-600 font-semibold">
              Semester Marks Summary
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {["ST1", "ST2", "PUT"].map((exam) => (
                <div key={exam}>
                  <h2 className="text-center text-lg font-semibold mb-2 text-gray-800">
                    {exam} Marks
                  </h2>
                  <table className="min-w-full border border-gray-200 rounded-lg shadow-sm text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left font-semibold">
                          Subject
                        </th>
                        <th className="py-2 px-3 text-center font-semibold">
                          Marks
                        </th>
                        <th className="py-2 px-3 text-center font-semibold">
                          Max
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedMarks[exam].map((m, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-1.5 px-3 font-medium">
                            {m.subject}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            {m.obtainedMarks}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            {m.totalMarks}
                          </td>
                        </tr>
                      ))}
                      {groupedMarks[exam].length === 0 && (
                        <tr>
                          <td
                            className="py-3 px-3 text-center text-gray-500"
                            colSpan={3}
                          >
                            No marks uploaded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
