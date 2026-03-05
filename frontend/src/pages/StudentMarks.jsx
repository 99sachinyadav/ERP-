import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";

function StudentMarks() {
  const [profile, setProfile] = useState(null);
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const token = localStorage.getItem("token");
        const response = await axios.get(backendUrl + "/api/getProfile", {
          headers: { token },
        });
        if (response.data.sucess) {
          setProfile(response.data.profile);
          setSemester(response.data.profile?.semester || "");
        } else {
          setErrorMessage(response.data.message || "Unable to load marks.");
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Unable to load marks.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const allMarks = profile?.marks || [];

  const groupedMarks = useMemo(() => {
    const base = { ST1: [], ST2: [], PUT: [] };
    allMarks
      .filter((m) => !semester || m.semester === semester)
      .forEach((m) => {
        if (base[m.exam]) base[m.exam].push(m);
      });
    return base;
  }, [allMarks, semester]);

  const totals = useMemo(() => {
    const all = [...groupedMarks.ST1, ...groupedMarks.ST2, ...groupedMarks.PUT];
    const obtained = all.reduce((sum, m) => sum + Number(m.obtainedMarks || 0), 0);
    const total = all.reduce((sum, m) => sum + Number(m.totalMarks || 0), 0);
    const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : "0.00";
    return { obtained, total, percentage };
  }, [groupedMarks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <i className="ri-loader-4-line animate-spin text-3xl text-blue-600"></i>
          <p className="mt-3 text-slate-700">Loading your marks...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <i className="ri-error-warning-line text-3xl text-red-600"></i>
          <p className="mt-3 font-semibold text-red-800">Unable to load marks</p>
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-md backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Marks Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">View your exam-wise and semester-wise performance.</p>
            </div>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {[...new Set(allMarks.map((m) => m.semester).filter(Boolean))].map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-700">Total Obtained</p>
            <h3 className="text-2xl font-bold text-blue-900">{totals.obtained}</h3>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-xs text-indigo-700">Total Marks</p>
            <h3 className="text-2xl font-bold text-indigo-900">{totals.total}</h3>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Percentage</p>
            <h3 className="text-2xl font-bold text-emerald-900">{totals.percentage}%</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {["ST1", "ST2", "PUT"].map((exam) => (
            <div key={exam} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-center text-lg font-semibold text-slate-800">{exam} Marks</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-3 py-2 text-left">Subject</th>
                      <th className="px-3 py-2 text-center">Obtained</th>
                      <th className="px-3 py-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedMarks[exam].map((m, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{m.subject}</td>
                        <td className="px-3 py-2 text-center">{m.obtainedMarks}</td>
                        <td className="px-3 py-2 text-center">{m.totalMarks}</td>
                      </tr>
                    ))}
                    {groupedMarks[exam].length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                          No marks available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentMarks;
