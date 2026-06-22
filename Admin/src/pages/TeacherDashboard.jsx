import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {Dialog,  DialogContent,DialogDescription,  DialogHeader,DialogTitle,DialogTrigger} from "@/Components/ui/dialog"
import { useNavigate } from "react-router-dom";
import { Input } from "@/Components/ui/input"
import {toast} from "react-hot-toast";

import { Button } from "@/Components/ui/button";
import axios from "axios";
import { backendUrl } from "@/App";
 


const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [students, setstudents] = React.useState([]);
  const [attendance, setAttendance] = React.useState([]);
  const [semester, setsemester] = React.useState("");
  const [sentEmail, setsentEmail] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const [year, setyear] = React.useState("");
  const [section, setsection] = React.useState("");
  const [batch, setbatch] = React.useState("");
  const [marksSection, setMarksSection] = React.useState("");
  const [marksYear, setMarksYear] = React.useState("");
  const [marksBatch, setMarksBatch] = React.useState("");
  const [marksExam, setMarksExam] = React.useState("ST1");
  const [marksSemester, setMarksSemester] = React.useState("");
  const [marksSubject, setMarksSubject] = React.useState("");
  const [marksRollNo, setMarksRollNo] = React.useState("");
  const [marksObtained, setMarksObtained] = React.useState("");
  const [marksTotal, setMarksTotal] = React.useState("");
   
  const [mydata,setmydata]= React.useState([]);
  const [assignedSections, setAssignedSections] = React.useState([]);
  const [sectionSemesters, setSectionSemesters] = React.useState({});
  const [sectionSubjects, setSectionSubjects] = React.useState({});
  const [assignedSubjects, setAssignedSubjects] = React.useState([]);
  const logout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teachername"); 
    localStorage.removeItem("teachersection");
    navigate("/teacherlogin");
 

  };


  const sendEmailStudents = async() => {
    setIsSendingEmail(true);
    try {
      const response = await axios.post(backendUrl + "/api/send-email", {
      
        year,
        section,
        batch
      }, {
        headers: { teachertoken: localStorage.getItem("teacherToken") }
      });
          // console.log(response );
      if (response.data.success) {
        toast.success(response.data.message || "Emails sent successfully");
        setsentEmail(true);
        
      } else {
        toast.error(response.data.message || "Failed to send emails");
      }
    } catch (error) {
      // console.log(error)
      console.log(error.response?.data?.message || error.message);
      toast.error("Error in sending emails");
    } finally {
      setIsSendingEmail(false);
    }
  }

  useEffect(() => {
    const parseSections = () => {
      const raw = localStorage.getItem("teachersection") || "";
      return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const parseAssignmentKey = (key) => {
      const parts = String(key || "")
        .split("_")
        .map((item) => item.trim())
        .filter(Boolean);
      if (parts.length < 3) return null;

      const semester = parts[0];
      const batch = parts[parts.length - 1];
      const sectionYear = parts[parts.length - 2];
      const subject = parts.slice(1, -2).join("_");

      const yearTokens = [
        "Ist",
        "IInd",
        "IIIrd",
        "IVth",
        "Vth",
        "VIth",
        "VIIth",
        "VIIIth",
      ];
      let yearValue = "";
      let sectionValue = sectionYear;
      yearTokens.some((yearToken) => {
        if (sectionYear.endsWith(yearToken)) {
          yearValue = yearToken;
          sectionValue = sectionYear.slice(0, -yearToken.length);
          return true;
        }
        return false;
      });

      return {
        subject,
        section: sectionValue || "-",
        year: yearValue || "-",
        batch: batch || "-",
        semester: semester || "-",
      };
    };

    const getAttendanceData = async () => {
      try {
        const sections = parseSections();
        setAssignedSections(sections);

        if (sections.length > 0) {
          const primary = sections[0];
          const underscoreIndex = primary.indexOf("_");
          const sectionVal = primary[0];
          const batchVal = primary.substring(underscoreIndex + 1).trim();
          const yearVal = primary.substring(1, underscoreIndex).trim();

          const response = await axios.get(backendUrl + "/api/gelStudentBySection", {
            params: { section: sectionVal, year: yearVal, batch: batchVal },
            headers: { teachertoken: localStorage.getItem("teacherToken") }
          });

          if (response.data.sucess) {
            const studentsFromResponse = response.data.findSection.students;
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

          const semesterResults = await Promise.all(
            sections.map(async (sectionName) => {
              const underscore = sectionName.indexOf("_");
              const sec = sectionName[0];
              const batch = sectionName.substring(underscore + 1).trim();
              const year = sectionName.substring(1, underscore).trim();
              try {
                const res = await axios.get(backendUrl + "/api/gelStudentBySection", {
                  params: { section: sec, year, batch },
                  headers: { teachertoken: localStorage.getItem("teacherToken") }
                });
                if (res.data?.findSection?.semester) {
                  const currentSemester = res.data.findSection.semester;
                  const currentSubjects = (res.data.findSection.subjects || [])
                    .filter((subjectName) =>
                      String(subjectName || "").startsWith(`${currentSemester}_`)
                    )
                    .map((subjectName) =>
                      String(subjectName || "").replace(`${currentSemester}_`, "")
                    );
                  return [sectionName, currentSemester, currentSubjects];
                }
              } catch (err) {
                // ignore per-section errors
              }
              return [sectionName, "", []];
            })
          );

          const semesterMap = {};
          const subjectsMap = {};
          semesterResults.forEach(([name, sem, subjects]) => {
            semesterMap[name] = sem;
            subjectsMap[name] = subjects;
          });
          setSectionSemesters(semesterMap);
          setSectionSubjects(subjectsMap);
        } else {
          setstudents([]);
          setAttendance([]);
          setsemester("");
          setmydata([]);
          setSectionSemesters({});
          setSectionSubjects({});
        }

        try {
          const assignments = await axios.get(
            backendUrl + "/api/getTeacherAssignments",
            {
              headers: { teachertoken: localStorage.getItem("teacherToken") },
            }
          );
          
          if (assignments.data?.sucess) {
            const parsed = (assignments.data.subjects || [])
              .map(parseAssignmentKey)
              .filter(Boolean);
            setAssignedSubjects(parsed);
          }
        } catch (err) {
          // silently ignore assignment errors
          console.log(err)
        }
      } catch (error) {
        console.log(error.response?.data?.message || error.message);
        alert("Error in fetching data");
      }
    };

    getAttendanceData();
  }, []);
//  console.log(mydata);
  
     const data = [
  { name: "Jhon", attendance: 40 },
  { name: "Doe", attendance: 30 },
  { name: "Smith", attendance: 20 },
  { name: "Sachin", attendance: 27 },
  { name: "Jack", attendance: 18 },
]
// console.log(mydata.length)

  const uploadMarks = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/uploadMarks",
        {
          section: marksSection,
          year: marksYear,
          batch: marksBatch,
          semester: marksSemester,
          subject: marksSubject,
          exam: marksExam,
          rollno: marksRollNo,
          obtainedMarks: marksObtained,
          totalMarks: marksTotal,
        },
        {
          headers: {
            teachertoken: localStorage.getItem("teacherToken"),
          },
        }
      );
      if (response.data.sucess) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to upload marks");
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Failed to upload marks");
    }
  };
  const quickActions = [
    {
      title: "Mark Attendance",
      icon: "ri-stack-line",
      onClick: () => navigate("/dashboard"),
      className: "from-orange-100 to-orange-200 border-orange-300",
    },
    {
      title: "Monitor Students",
      icon: "ri-graduation-cap-line",
      onClick: () => navigate("/monitorStudents"),
      className: "from-yellow-100 to-yellow-200 border-yellow-300",
    },
    {
      title: "Monitor Marks",
      icon: "ri-bar-chart-grouped-line",
      onClick: () => navigate("/monitorMarks"),
      className: "from-cyan-100 to-cyan-200 border-cyan-300",
    },
    {
      title: "Upload Marks",
      icon: "ri-file-list-3-line",
      onClick: () => navigate("/marks"),
      className: "from-green-100 to-green-200 border-green-300",
    },
    {
      title: "Apply Leave",
      icon: "ri-file-paper-2-line",
      onClick: () => navigate("/applyLeave"),
      className: "from-pink-100 to-pink-200 border-pink-300",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-blue-900 sm:text-4xl">
            Teacher <span className="text-red-500">Panel</span>
          </h1>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 w-full sm:w-auto"
          >
            <i className="ri-logout-box-r-line text-lg"></i>
            LOG OUT
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-blue-100 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mydata.length === 0 ? data : mydata}
                    margin={{ top: 12, right: 12, left: 0, bottom: 36 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-md">
            <CardContent className="p-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                Hi, <span className="text-blue-600">{localStorage.getItem("teachername") || "Teacher"}</span>
              </h2>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                {assignedSections.length > 0 ? "Assigned Sections" : "No section is assigned yet."}
              </p>
              {assignedSections.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {assignedSections.map((sectionName) => (
                    <div
                      key={sectionName}
                      className="rounded-xl border border-blue-100 bg-blue-50 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-800">
                        <span className="rounded-full bg-white px-3 py-1 border border-blue-200">
                          Section: {sectionName}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 border border-blue-200">
                          Semester: {sectionSemesters[sectionName] || "N/A"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(sectionSubjects[sectionName] || []).length > 0 ? (
                          sectionSubjects[sectionName].map((subject) => (
                            <span
                              key={`${sectionName}-${subject}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200"
                            >
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No subjects assigned.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-slate-800">
                  Assigned Subjects
                </h4>
                {assignedSubjects.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    No subjects assigned yet.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          <th className="border border-slate-200 bg-white px-2 py-1 text-left">
                            Subject
                          </th>
                          <th className="border border-slate-200 bg-white px-2 py-1 text-left">
                            Section
                          </th>
                          <th className="border border-slate-200 bg-white px-2 py-1 text-left">
                            Year
                          </th>
                          <th className="border border-slate-200 bg-white px-2 py-1 text-left">
                            Batch
                          </th>
                          <th className="border border-slate-200 bg-white px-2 py-1 text-left">
                            Semester
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedSubjects.map((item, idx) => (
                          <tr key={`${item.subject}-${idx}`} className="even:bg-slate-50">
                            <td className="border border-slate-200 px-2 py-1">
                              {item.subject}
                            </td>
                            <td className="border border-slate-200 px-2 py-1">
                              {item.section}
                            </td>
                            <td className="border border-slate-200 px-2 py-1">
                              {item.year}
                            </td>
                            <td className="border border-slate-200 px-2 py-1">
                              {item.batch}
                            </td>
                            <td className="border border-slate-200 px-2 py-1">
                              {item.semester}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-xl bg-blue-50 p-4">
                <h5 className="text-sm font-semibold text-blue-900 sm:text-base">
                  Low Attendance Email Alert
                </h5>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  Send warning emails to students below attendance criteria.
                </p>
                <Dialog
                  open={open}
                  onOpenChange={(isOpen) => {
                    setOpen(isOpen);
                    if (!isOpen) {
                      setsentEmail(false);
                    }
                  }}
                >
                  <DialogTrigger className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Send Email
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Email to Low Attendance Students</DialogTitle>
                      <DialogDescription className="mt-4 flex flex-col gap-4">
                        <select
                          value={year}
                          onChange={(e) => setyear(e.target.value)}
                          className="border rounded-lg px-2 py-2 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="Ist">Ist</option>
                          <option value="IInd">IInd</option>
                          <option value="IIIrd">IIIrd</option>
                          <option value="IVth">IVth</option>
                        </select>
                        <Input value={section} onChange={(e) => setsection(e.target.value)} type="text" placeholder="Enter section" />
                        <Input
                          value={batch}
                          onChange={(e) => setbatch(e.target.value.replace(/\D/g, ""))}
                          type="text"
                          inputMode="numeric"
                          pattern="\\d*"
                          placeholder="Enter batch"
                        />
                        <Button
                          onClick={sendEmailStudents}
                          disabled={isSendingEmail || sentEmail}
                          className={`${sentEmail ? "bg-green-500" : "bg-blue-500"} hover:bg-blue-600`}
                        >
                          {isSendingEmail ? "Sending..." : sentEmail ? "Email Sent" : "Send Email"}
                        </Button>
                        <p className="text-xs text-gray-500">
                          Send once and wait for confirmation before sending again.
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-blue-900 sm:text-3xl">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className={`min-h-36 rounded-xl border bg-gradient-to-br p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${action.className}`}
              >
                <i className={`${action.icon} text-4xl text-gray-800`}></i>
                <p className="mt-4 text-lg font-semibold text-gray-900">{action.title}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10 pb-10">
          <h2 className="text-xl font-bold text-blue-900 sm:text-3xl">
            Activities <span className="text-red-500">to Monitor</span>
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <b className="text-base text-gray-900">Student Monitor</b>
              <p className="mt-2 text-sm text-gray-600">
                Track low performers, irregular attendance, and student-wise progress in one place.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <b className="text-base text-gray-900">Mark Attendance</b>
              <p className="mt-2 text-sm text-gray-600">
                Capture lecture attendance quickly and keep records updated class by class.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <b className="text-base text-gray-900">Upload Marks</b>
              <p className="mt-2 text-sm text-gray-600">
                Upload internal marks by exam and subject with clear validation and visibility.
              </p>
            </div>
           
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
