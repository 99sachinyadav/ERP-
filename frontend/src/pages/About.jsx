import { about } from "../assets/assets";

const About = () => {
  const values = [
    {
      title: "Academic Excellence",
      text: "A focused curriculum and structured assessment flow to support strong student outcomes.",
      icon: "ri-medal-line",
    },
    {
      title: "Student-Centric System",
      text: "Attendance, profile, and marks are accessible in one reliable digital experience.",
      icon: "ri-user-heart-line",
    },
    {
      title: "Operational Clarity",
      text: "Clear workflows for faculty and administration with transparent progress tracking.",
      icon: "ri-layout-grid-line",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <i className="ri-information-line"></i>
              ABOUT RKGITM
            </p>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">
              Building a Better Academic Experience
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              We combine academic rigor with digital systems to help students, faculty, and administration stay aligned on progress and outcomes.
            </p>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Our Mission</h3>
              <p className="mt-1 text-sm text-slate-600">
                Deliver a transparent, efficient, and student-focused environment for learning and growth.
              </p>
            </div>
          </div>
          <img
            src={about}
            alt="About RKGITM"
            className="w-full rounded-2xl border border-white/70 object-cover shadow-2xl"
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Why Choose Us</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <i className={`${item.icon} text-xl text-blue-700`}></i>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
