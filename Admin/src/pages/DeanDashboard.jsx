import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DeanDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("deanToken");
    navigate("/deanlogin");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-lime-500 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100">
                Dean Control Center
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
                Academic Oversight Dashboard
              </h1>
              <p className="mt-2 text-sm md:text-base text-cyan-50 max-w-xl">
                Monitor marks and attendance across all sections with a consolidated
                overview.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dean/marks"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
              >
                Marks Monitor
              </Link>
              <Link
                to="/dean/attendance"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
              >
                Attendance Monitor
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-cyan-500">Quick Access</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              Review Section Performance
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Jump directly into marks or attendance. Filter by section, year, and batch
              to see the latest data.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/dean/marks"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                Open Marks Monitor
              </Link>
              <Link
                to="/dean/attendance"
                className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700"
              >
                Open Attendance Monitor
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-xs uppercase tracking-widest text-cyan-200">Guidance</p>
            <h3 className="mt-2 text-xl font-semibold">Daily Dean Checklist</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Review section attendance below threshold.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-lime-400" />
                Validate marks uploads for current assessments.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                Coordinate with faculty on corrective plans.
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-widest text-cyan-500">Marks</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Marks Monitor</h3>
            <p className="mt-2 text-sm text-slate-600">
              Review subject-wise results and overall performance quickly.
            </p>
            <Link
              to="/dean/marks"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Open Marks Monitor
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-widest text-lime-500">Attendance</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Attendance Monitor</h3>
            <p className="mt-2 text-sm text-slate-600">
              Track section-wise attendance and drill down to student level.
            </p>
            <Link
              to="/dean/attendance"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700"
            >
              Open Attendance Monitor
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">Insights</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">
              Sections Requiring Attention
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Use the monitors to identify low-attendance or low-performing sections.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">Notes</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">
              Faculty Follow-ups
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Track follow-up requests after reviewing marks and attendance data.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">Reports</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">
              Dean Summary Prep
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Export or summarize insights after reviewing class performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeanDashboard;
