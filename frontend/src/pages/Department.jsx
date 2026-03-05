function Department() {
  const departments = [
    {
      name: "Computer Science & Engineering",
      focus: "Software systems, AI, and data-driven applications.",
      icon: "ri-code-box-line",
    },
    {
      name: "Electronics & Communication",
      focus: "Embedded systems, communication, and electronics design.",
      icon: "ri-cpu-line",
    },
    {
      name: "Mechanical Engineering",
      focus: "Design, manufacturing, and industrial engineering practices.",
      icon: "ri-settings-3-line",
    },
    {
      name: "Civil Engineering",
      focus: "Infrastructure planning, structures, and sustainable development.",
      icon: "ri-building-line",
    },
    {
      name: "Applied Sciences",
      focus: "Strong foundation in mathematics, physics, and core sciences.",
      icon: "ri-flask-line",
    },
    {
      name: "Management Studies",
      focus: "Leadership, operations, and strategic business learning.",
      icon: "ri-briefcase-4-line",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <i className="ri-building-4-line"></i>
            DEPARTMENTS
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">Academic Departments</h1>
          <p className="mt-2 max-w-3xl text-base text-slate-600 sm:text-lg">
            Explore major disciplines designed to prepare students for modern careers, higher education, and industry leadership.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <i className={`${dept.icon} text-xl text-indigo-700`}></i>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{dept.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{dept.focus}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Department;
