import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";
import ModuleState from "./ui/module-state";

const MonitorSubjectFaculty = () => {
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [batch, setBatch] = useState("");
  const [subjectFaculty, setSubjectFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const adminLikeToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("deanToken") ||
    localStorage.getItem("directorToken");

  const fetchAssignments = async () => {
    setLoading(true);
    setErrorMessage("");
    setHasSearched(true);
    try {
      const response = await axios.get(
        backendUrl + "/api/gelStudentBySection",
        {
          params: {
            section,
            year,
            batch,
          },
          headers: {
            admintoken: adminLikeToken ? adminLikeToken : null,
          },
        }
      );

      if (response.data.sucess) {
        setSubjectFaculty(response.data.subjectFaculty || []);
        toast.success("Subject assignments loaded");
      } else {
        setSubjectFaculty([]);
        setErrorMessage(response.data.message || "Unable to fetch assignments.");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Unable to fetch assignments.";
      console.log(msg);
      setSubjectFaculty([]);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-4 items-center justify-items-center gap-4 rounded-lg border border-gray-300 bg-white p-4 shadow-md">
        <input
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="Enter your Section"
          type="text"
          className="w-20 rounded border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-40"
        />
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-20 rounded border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-40"
        >
          <option value="Ist">1st Year</option>
          <option value="IInd">2nd Year</option>
          <option value="IIIrd">3rd Year</option>
          <option value="IVth">4th Year</option>
        </select>
        <input
          value={batch}
          onChange={(e) => setBatch(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter Starting year here"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          className="w-20 rounded border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-40"
        />
        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="w-20 rounded-lg bg-blue-500 px-2 py-2 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
        >
          {loading ? "Loading..." : "Track"}
        </button>
      </div>

      <div className="mt-5">
        {loading ? (
          <ModuleState type="loading" title="Fetching subject assignments" />
        ) : errorMessage ? (
          <ModuleState
            type="error"
            title="Unable to load assignments"
            message={errorMessage}
            actionLabel="Retry"
            onAction={fetchAssignments}
          />
        ) : hasSearched && subjectFaculty.length === 0 ? (
          <ModuleState
            type="empty"
            title="No assignments found"
            message="Try a different section, year, or batch."
          />
        ) : !hasSearched ? (
          <ModuleState
            type="empty"
            title="Monitor subject-wise faculty"
            message="Apply filters above and click Track."
          />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-800">
                Subject-wise Faculty
              </h3>
              <span className="text-xs text-slate-500">
                Section: {section || "-"} | Year: {year || "-"} | Batch: {batch || "-"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Total subjects: {subjectFaculty.length}
            </p>
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-slate-50 px-3 py-2 text-left">
                    Subject
                  </th>
                  <th className="border border-gray-200 bg-slate-50 px-3 py-2 text-left">
                    Section
                  </th>
                  <th className="border border-gray-200 bg-slate-50 px-3 py-2 text-left">
                    Year
                  </th>
                  <th className="border border-gray-200 bg-slate-50 px-3 py-2 text-left">
                    Faculty Name
                  </th>
                  <th className="border border-gray-200 bg-slate-50 px-3 py-2 text-left">
                    Faculty Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjectFaculty.map((item, idx) => (
                  <tr key={`${item.subject}-${idx}`} className="even:bg-slate-50">
                    <td className="border border-gray-200 px-3 py-2">
                      {item.subject}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {section || "-"}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {year || "-"}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {item.faculty?.name || "Not assigned"}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {item.faculty?.email || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorSubjectFaculty;
