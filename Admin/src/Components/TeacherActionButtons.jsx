import { useLocation, useNavigate } from "react-router-dom";

const actions = [
  {
    label: "Home",
    path: "/teacherdashboard",
    icon: "ri-home-4-line",
    gradient: "from-slate-100 to-slate-200",
    border: "border-slate-200",
    text: "text-slate-800",
  },
  {
    label: "Upload Marks",
    path: "/marks",
    icon: "ri-file-list-3-line",
    gradient: "from-green-100 to-emerald-200",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
  {
    label: "Mark Attendance",
    path: "/dashboard",
    icon: "ri-stack-line",
    gradient: "from-orange-100 to-amber-200",
    border: "border-amber-200",
    text: "text-amber-800",
  },
  {
    label: "Monitor Student",
    path: "/monitorStudents",
    icon: "ri-graduation-cap-line",
    gradient: "from-indigo-100 to-blue-200",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  {
    label: "Monitor Marks",
    path: "/monitorMarks",
    icon: "ri-bar-chart-grouped-line",
    gradient: "from-cyan-100 to-sky-200",
    border: "border-sky-200",
    text: "text-sky-800",
  },
];

const TeacherActionButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location?.pathname || "";

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => {
          const isActive = current === action.path;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`group flex items-center gap-3 rounded-2xl border bg-gradient-to-br px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.gradient} ${action.border} ${
                isActive ? "ring-2 ring-offset-2 ring-blue-500" : ""
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-xl ${action.text}`}
              >
                <i className={action.icon}></i>
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Quick Action
                </span>
                <span className="text-sm font-bold text-slate-900 sm:text-base">
                  {action.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherActionButtons;
