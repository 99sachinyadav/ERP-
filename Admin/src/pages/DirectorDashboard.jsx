import React from "react";
import { Link, useNavigate } from "react-router-dom";
import college from "../assets/college.jpg";

const DirectorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("directorToken");
    navigate("/directorlogin");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-lime-500 text-white sticky top-0">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100">
                Director Command
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold">
                Institutional Performance Hub
              </h1>
              <p className="mt-2 text-sm md:text-base text-cyan-50 max-w-xl">
                Oversee marks and attendance trends across departments and batches.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/director/marks"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
              >
                Marks Monitor
              </Link>
              <Link
                to="/director/attendance"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
              >
                Attendance Monitor
              </Link>
              <Link
                to="/director/subject-faculty"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
              >
                Subject-wise Faculty
              </Link>
              <Link
                to="/director/approveLeaves"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
              >
                Manage Leaves
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

      <div
        className="min-h-screen relative bg-cover bg-center"
        style={{ backgroundImage: `url(${college})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="mx-auto max-w-6xl px-6 py-10 relative z-50">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-cyan-500">Executive View</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Institutional Monitoring
              </h3>
            <p className="mt-2 text-sm text-slate-600">
              Review marks and attendance across departments. Apply filters to get the
              latest class-level insights.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/director/marks"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                Open Marks Monitor
              </Link>
              <Link
                to="/director/attendance"
                className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700"
              >
                Open Attendance Monitor
              </Link>
              <Link
                to="/director/subject-faculty"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Open Subject-wise Faculty
              </Link>
              <Link
                to="/director/approveLeaves"
                className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700"
              >
                Manage Leaves
              </Link>
            </div>

            {/* Structured Leave Allocations Area */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-xs uppercase tracking-widest text-orange-500 font-bold">Quota Allocation controls</p>
              <h4 className="mt-1 text-xl font-bold text-slate-900">
                Leave Quota Allocations
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Assign and modify leave balances. Manage semester quotas, yearly quotas, and individual special leaves.
              </p>
              
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Teacher Allocations Card */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                      Faculty Quota Allocations (Teacher)
                    </h5>
                  </div>
                  <div className="mt-4 space-y-2 flex-grow">
                    <Link
                      to="/director/assign-semester-quota-teacher"
                      className="flex justify-between items-center w-full bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 transition-all rounded-lg p-3 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      <div className="text-left">
                        Semester Quota Allocation
                        <span className="text-[10px] font-normal text-slate-400 block mt-0.5">Earned Leave (EL) & Casual Leave (CL)</span>
                      </div>
                      <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                      to="/director/assign-yearly-quota-teacher"
                      className="flex justify-between items-center w-full bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 transition-all rounded-lg p-3 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      <div className="text-left">
                        Yearly Quota Allocation
                        <span className="text-[10px] font-normal text-slate-400 block mt-0.5">ML, OD, Winter Leave & Summer Leave</span>
                      </div>
                      <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                      to="/director/assign-special-leave-teacher"
                      className="flex justify-between items-center w-full bg-orange-50 border border-orange-100 hover:border-orange-500 hover:text-orange-700 transition-all rounded-lg p-3 text-xs font-semibold text-orange-800 shadow-sm"
                    >
                      <div className="text-left">
                        Individual Special Leave Allocation
                        <span className="text-[10px] font-normal text-orange-600/80 block mt-0.5">Maternity, Study & Special Disability Leaves</span>
                      </div>
                      <span className="text-orange-500 font-bold">&rarr;</span>
                    </Link>
                  </div>
                </div>

                {/* Staff Allocations Card */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      Support Staff Quota Allocations (Staff)
                    </h5>
                  </div>
                  <div className="mt-4 space-y-2 flex-grow">
                    <Link
                      to="/director/assign-semester-quota-staff"
                      className="flex justify-between items-center w-full bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all rounded-lg p-3 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      <div className="text-left">
                        Semester Quota Allocation
                        <span className="text-[10px] font-normal text-slate-400 block mt-0.5">Earned Leave (EL) & Casual Leave (CL)</span>
                      </div>
                      <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                      to="/director/assign-yearly-quota-staff"
                      className="flex justify-between items-center w-full bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all rounded-lg p-3 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      <div className="text-left">
                        Yearly Quota Allocation
                        <span className="text-[10px] font-normal text-slate-400 block mt-0.5">ML, OD, Winter Leave & Summer Leave</span>
                      </div>
                      <span className="text-slate-400">&rarr;</span>
                    </Link>
                    <Link
                      to="/director/assign-special-leave-staff"
                      className="flex justify-between items-center w-full bg-blue-50 border border-blue-100 hover:border-blue-500 hover:text-blue-700 transition-all rounded-lg p-3 text-xs font-semibold text-blue-800 shadow-sm"
                    >
                      <div className="text-left">
                        Individual Special Leave Allocation
                        <span className="text-[10px] font-normal text-blue-600/80 block mt-0.5">Maternity, Study & Special Disability Leaves</span>
                      </div>
                      <span className="text-blue-500 font-bold">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-xs uppercase tracking-widest text-cyan-200">Focus</p>
            <h3 className="mt-2 text-xl font-semibold">Director Checklist</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Review department attendance trends weekly.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-lime-400" />
                Validate assessment compliance across batches.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                Align interventions with academic leadership.
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-widest text-cyan-500">Marks</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Marks Monitor</h3>
            <p className="mt-2 text-sm text-slate-600">
              Access section-wise marks and drill into subject-level results.
            </p>
            <Link
              to="/director/marks"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Open Marks Monitor
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-widest text-lime-500">Attendance</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Attendance Monitor</h3>
            <p className="mt-2 text-sm text-slate-600">
              Examine attendance rates by batch and verify lecture engagement.
            </p>
            <Link
              to="/director/attendance"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700"
            >
              Open Attendance Monitor
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-widest text-sky-500">Faculty</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Subject-wise Faculty</h3>
            <p className="mt-2 text-sm text-slate-600">
              Review faculty assignments by subject across sections.
            </p>
            <Link
              to="/director/subject-faculty"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Open Faculty Monitor
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-widest text-lime-500">Leaves</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Leave Management</h3>
            <p className="mt-2 text-sm text-slate-600">
              Review and approve leave requests for faculty members.
            </p>
            <Link
              to="/director/approveLeaves"
             className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700"
            >
             Manage Leaves
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">Governance</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">
              Department Oversight
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Compare departments after reviewing monitor outputs.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">Quality</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">
              Assessment Consistency
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Ensure uniform assessment practices across sections.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-500">Follow-up</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">
              Action Planning
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Plan institutional actions after reviewing data.
            </p>
          </div>
        </div>
      </div>   

                  
         </div>

    </div>
  );
};

export default DirectorDashboard;
