import React from "react";

const coreActions = [
  {
    title: "Register Teacher",
    description: "Add new faculty profiles and credentials.",
    icon: "ri-user-add-line",
    key: "TeacherRegister",
    gradient: "from-sky-100 to-blue-100 border-sky-300",
  },
  {
    title: "Update Teacher",
    description: "Modify teacher records and assignments.",
    icon: "ri-user-settings-line",
    key: "UpdateTeacher",
    gradient: "from-indigo-100 to-violet-100 border-indigo-300",
  },
  {
    title: "All Teachers",
    description: "View the full teacher list with details.",
    icon: "ri-team-line",
    key: "SeeALLTeachers",
    gradient: "from-purple-100 to-fuchsia-100 border-purple-300",
  },
  {
    title: "All Students",
    description: "Browse and review enrolled student records.",
    icon: "ri-graduation-cap-line",
    key: "SeeALLStudents",
    gradient: "from-yellow-100 to-amber-100 border-yellow-300",
  },
  {
    title: "Create Section",
    description: "Create and manage class sections quickly.",
    icon: "ri-layout-grid-line",
    key: "CreateSection",
    gradient: "from-green-100 to-emerald-100 border-green-300",
  },
  {
    title: "Change Year",
    description: "Update academic year across records.",
    icon: "ri-calendar-event-line",
    key: "ChangeYear",
    gradient: "from-teal-100 to-cyan-100 border-teal-300",
  },
  {
    title: "Add Subjects",
    description: "Assign curriculum subjects by year/section.",
    icon: "ri-book-open-line",
    key: "AddSubjects",
    gradient: "from-orange-100 to-amber-100 border-orange-300",
  },
  {
    title: "Remove Subject",
    description: "Delete subject from a section and students.",
    icon: "ri-delete-bin-6-line",
    key: "RemoveSubject",
    gradient: "from-red-100 to-rose-100 border-red-300",
  },
  {
    title: "Semester / Section",
    description: "Update semester and section mappings.",
    icon: "ri-exchange-2-line",
    key: "ChangeSemesterOrSection",
    gradient: "from-rose-100 to-pink-100 border-rose-300",
  },
];

const controlActions = [
  {
    title: "Monitor Attendance",
    description: "Track class attendance trends and stats.",
    icon: "ri-bar-chart-box-line",
    key: "MonitorAttendence",
    gradient: "from-blue-100 to-indigo-100 border-blue-300",
  },
  {
    title: "Subject-wise Faculty",
    description: "See subject assignments for each section.",
    icon: "ri-book-2-line",
    key: "MonitorSubjectFaculty",
    gradient: "from-cyan-100 to-sky-100 border-cyan-300",
  },
  {
    title: "Teacher Password",
    description: "Reset teacher credentials securely.",
    icon: "ri-lock-password-line",
    key: "ChangeTeacherpassword",
    gradient: "from-slate-100 to-gray-200 border-slate-300",
  },
  {
    title: "Student Password",
    description: "Reset student login passwords.",
    icon: "ri-shield-user-line",
    key: "ChangeStudentpassword",
    gradient: "from-cyan-100 to-sky-100 border-cyan-300",
  },
  {
    title: "Student Section",
    description: "Move students between sections in bulk.",
    icon: "ri-git-branch-line",
    key: "ChangeStudentSection",
    gradient: "from-lime-100 to-green-100 border-lime-300",
  },
    {title: "Leaves Management",
    description: "Manage teacher leave requests and approvals.",
    icon: "ri-calendar-2-line",
    key: "ManageLeaves",
    gradient: "from-amber-100 to-orange-100 border-amber-300",
  },
];

const AdminMenu = ({ setActiveComponent, setIsOpen }) => {
  const handleNavigate = (key) => {
    setActiveComponent(key);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
              <i className="ri-verified-badge-line"></i>
              ADMIN WORKSPACE
            </p>
            <h3 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
              Professional Control Center for Academic Operations
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-blue-100/90 sm:text-base">
              Manage faculty, students, sections, passwords, and attendance workflows from one modern dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
              <p className="text-xs text-blue-100">Modules</p>
              <p className="text-xl font-bold">{coreActions.length + controlActions.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
              <p className="text-xs text-blue-100">Category</p>
              <p className="text-xl font-bold">Admin</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900 sm:text-xl">Core Management</h4>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            High Priority
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coreActions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleNavigate(action.key)}
              className={`group rounded-2xl border bg-gradient-to-br p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${action.gradient}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 shadow-sm">
                  <i className={`${action.icon} text-2xl text-slate-700`}></i>
                </div>
                <i className="ri-arrow-right-up-line text-lg text-slate-500 transition group-hover:text-slate-900"></i>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">{action.title}</h4>
              <p className="mt-1 text-sm text-slate-700">{action.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900 sm:text-xl">Security & Controls</h4>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Controlled Access
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {controlActions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleNavigate(action.key)}
              className={`group rounded-2xl border bg-gradient-to-br p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${action.gradient}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 shadow-sm">
                  <i className={`${action.icon} text-2xl text-slate-700`}></i>
                </div>
                <i className="ri-arrow-right-up-line text-lg text-slate-500 transition group-hover:text-slate-900"></i>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">{action.title}</h4>
              <p className="mt-1 text-sm text-slate-700">{action.description}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            title: "Teacher Lifecycle",
            text: "Onboard, update, and maintain teacher profiles with centralized controls.",
            icon: "ri-user-star-line",
          },
          {
            title: "Student Governance",
            text: "Manage enrollment-related actions and section transitions without confusion.",
            icon: "ri-group-line",
          },
          {
            title: "Academic Integrity",
            text: "Track attendance and secure credentials using dedicated admin modules.",
            icon: "ri-shield-check-line",
          },
        ].map((item) => (
          <button
            key={item.title}
            type="button"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <i className={`${item.icon} text-xl text-slate-700`}></i>
            </div>
            <h4 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{item.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminMenu;
