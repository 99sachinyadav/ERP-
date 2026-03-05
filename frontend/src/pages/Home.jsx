import { useState } from "react";
import { welcome } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [studentName] = useState(localStorage.getItem("studentname") || "Student");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentname");
    navigate("/login");
  };

  const quickLinks = [
    {
      title: "View Attendance",
      subtitle: "Track lecture attendance and performance",
      icon: "ri-calendar-check-line",
      path: "/attendance",
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "See Marks",
      subtitle: "Open marks dashboard independently",
      icon: "ri-bar-chart-box-line",
      path: "/marks",
      color: "from-violet-500 to-indigo-600",
    },
    {
      title: "Profile & Result",
      subtitle: "Manage profile and download report card",
      icon: "ri-id-card-line",
      path: "/profile",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <i className="ri-user-smile-line"></i>
              STUDENT DASHBOARD
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <i className="ri-checkbox-circle-line"></i>
              Active
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Hi, <span className="text-blue-700">{studentName}</span>
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Welcome back. Manage attendance, marks, and profile from one clean workspace.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Session</p>
              <p className="mt-1 text-lg font-bold text-slate-800">Active Session</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Workspace</p>
              <p className="mt-1 text-lg font-bold text-slate-800">Student Portal</p>
            </div>
          </div>

          <button
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto"
            onClick={logout}
          >
            <i className="ri-logout-box-r-line"></i>
            Log Out
          </button>
        </div>

        <div className="order-1 lg:order-2 flex justify-center">
          <img
            className="max-h-[460px] w-full max-w-lg rounded-3xl border border-white/50 object-contain p-4 shadow-2xl backdrop-blur-sm"
            src={welcome}
            alt="Student Dashboard Welcome"
          />
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Quick Access</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickLinks.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`group rounded-2xl bg-gradient-to-r ${item.color} p-[1px] text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="h-full rounded-2xl bg-white/95 p-5">
                <div className="flex items-center justify-between">
                  <i className={`${item.icon} text-3xl text-slate-800`}></i>
                  <i className="ri-arrow-right-up-line text-slate-500 transition group-hover:text-slate-900"></i>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
