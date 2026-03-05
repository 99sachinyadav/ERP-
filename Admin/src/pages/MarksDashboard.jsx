import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";

function MarksDashboard() {
  const [student, setStudent] = useState([]);
  const [batch, setBatch] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [singleSubject, setSingleSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [exam, setExam] = useState("ST1");
  const [obtainedMarks, setObtainedMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [savingRollNo, setSavingRollNo] = useState("");
  const getDefaultTotalByExam = (examName) =>
    examName === "PUT" ? 70 : 50;

  const showStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const responce = await axios.get(backendUrl + "/api/gelStudentBySection", {
        headers: {
          teachertoken: localStorage.getItem("teacherToken")
            ? localStorage.getItem("teacherToken")
            : null,
        },
        params: {
          year: year,
          batch: batch,
          section: section,
        },
      });

      if (responce.data.sucess === false) {
        toast.error(responce.data.message);
      } else {
        const sorted = [...(responce.data.findSection.students || [])].sort(
          (a, b) => Number(a.rollno) - Number(b.rollno)
        );
        setStudent(sorted);
        setObtainedMarks({});
        const defaults = {};
        sorted.forEach((item) => {
          defaults[item?.rollno] = getDefaultTotalByExam(exam);
        });
        setTotalMarks(defaults);
        setSubjects(responce.data.findSection.subjects || []);
        setSingleSubject(
          responce.data.findSection.subjects
            ? responce.data.findSection.subjects[0]
            : ""
        );
        setSemester(responce.data.findSection.semester);
        toast.success(responce.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while fetching students."
      );
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const uploadMarks = async (rollno) => {
    setSavingRollNo(rollno);
    try {
      const response = await axios.post(
        backendUrl + "/api/uploadMarks",
        {
          rollno,
          section,
          year,
          batch,
          semester,
          subject: singleSubject,
          exam,
          obtainedMarks: obtainedMarks[rollno],
          totalMarks: totalMarks[rollno],
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
      toast.error(
        error.response?.data?.message || "An error occurred while uploading marks."
      );
    } finally {
      setSavingRollNo("");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col gap-6 p-4 sm:p-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <h1 className="text-2xl font-bold text-blue-700 mb-4">
            Upload Marks
          </h1>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">
                Faculty Name
              </span>
              <span className="text-base font-semibold text-gray-700">
                {localStorage.getItem("teachername") || "Unknown Teacher"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Exam</span>
              <select
                value={exam}
                onChange={(e) => {
                  const nextExam = e.target.value;
                  setExam(nextExam);
                  setObtainedMarks({});
                  const defaults = {};
                  student.forEach((item) => {
                    defaults[item?.rollno] = getDefaultTotalByExam(nextExam);
                  });
                  setTotalMarks(defaults);
                }}
                className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="ST1">ST1</option>
                <option value="ST2">ST2</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">
                Subject
              </span>
              <select
                value={singleSubject}
                onChange={(e) => setSingleSubject(e.target.value)}
                className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {subjects &&
                  subjects.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Year</span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Ist">Ist</option>
                <option value="IInd">IInd</option>
                <option value="IIIrd">IIIrd</option>
                <option value="IVth">IVth</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Section</span>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Section"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Batch</span>
              <input
                placeholder="Enter Starting Year"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="border rounded-lg px-2 py-1 text-base font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={showStudents}
              disabled={isLoadingStudents}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full sm:w-auto mt-2 sm:mt-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingStudents ? "Loading..." : "Find Students"}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 overflow-x-auto">
          <div className="hidden sm:grid grid-cols-5 gap-4 pb-2 border-b">
            <span className="text-sm font-semibold text-gray-600">
              Roll No
            </span>
            <span className="text-sm font-semibold text-gray-600">Name</span>
            <span className="text-sm font-semibold text-gray-600">
              Obtained Marks
            </span>
            <span className="text-sm font-semibold text-gray-600">
              Total Marks
            </span>
            <span className="text-sm font-semibold text-gray-600">Action</span>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {student &&
              student.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 items-center border-b last:border-b-0 py-2"
                >
                  <span className="text-sm text-gray-500">{item?.rollno}</span>
                  <span className="text-sm text-gray-500">{item?.name}</span>
                  <input
                    type="number"
                    value={obtainedMarks[item?.rollno] || ""}
                    onChange={(e) =>
                      setObtainedMarks((prev) => ({
                        ...prev,
                        [item?.rollno]: e.target.value,
                      }))
                    }
                    placeholder="Obtained"
                    className="border rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="number"
                    value={totalMarks[item?.rollno] ?? ""}
                    onChange={(e) =>
                      setTotalMarks((prev) => ({
                        ...prev,
                        [item?.rollno]: e.target.value,
                      }))
                    }
                    placeholder="Total"
                    className="border rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => uploadMarks(item?.rollno)}
                    disabled={savingRollNo === item?.rollno}
                    className="bg-green-500 text-white font-semibold rounded-lg px-4 py-1 hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {savingRollNo === item?.rollno ? "Saving..." : "Save"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[30%] bg-white rounded-xl shadow-lg p-4 sm:p-8 flex flex-col items-center gap-6 mt-4 lg:mt-0">
        <h1 className="text-base font-semibold text-gray-700 mb-2">
          Summary
        </h1>
        <div className="w-full bg-blue-100 p-4 rounded-lg shadow flex flex-col items-center mt-4">
          <h1 className="text-2xl font-bold text-blue-700">
            {student ? student.length : "00"}
          </h1>
          <p className="text-sm font-semibold text-gray-600">
            Total Students
          </p>
        </div>
        <div className="w-full bg-green-100 p-4 rounded-lg shadow flex flex-col items-center mt-4">
          <h1 className="text-2xl font-bold text-green-700">
            {subjects ? subjects.length : "00"}
          </h1>
          <p className="text-sm font-semibold text-gray-600">Total Subjects</p>
        </div>
      </div>
    </div>
  );
}

export default MarksDashboard;
