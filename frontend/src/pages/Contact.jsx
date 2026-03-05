import { contact } from "../assets/assets";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <i className="ri-phone-line"></i>
            CONTACT US
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">Get in Touch</h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Reach out for admissions, academics, or support. Our team will assist you quickly.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Campus</p>
              <p className="mt-1 font-semibold text-slate-900">Rajnagar Extension, RKGITM</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Phone</p>
              <p className="mt-1 font-semibold text-slate-900">+91-9315966203</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
              <p className="text-xs text-slate-500">Email</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">sy7841846@gmail.com | Ratnesh34@gmail.com | raj67@gmail.com</p>
            </div>
          </div>

          <button className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Explore Opportunities
          </button>
        </div>

        <div className="order-1 lg:order-2">
          <img
            src={contact}
            alt="Contact RKGITM"
            className="w-full rounded-3xl border border-white/70 object-cover shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
