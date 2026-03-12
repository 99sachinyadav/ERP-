import { backendUrl } from "@/App";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handelSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const responce = await axios.post(backendUrl + "/api/loginAdmin", {
        email,
        password,
      });

      if (responce.data.sucess) {
        localStorage.setItem("adminToken", responce.data.adminToken);
        toast.success(responce.data.message);
        setemail("");
        setpassword("");
        navigate("/admindashboard");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-lime-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <div className="p-8 md:p-10 bg-slate-800 text-white flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
              System Control
            </p>
            <h1 className="mt-4 text-3xl font-semibold">Admin Access</h1>
            <p className="mt-3 text-slate-200 text-sm leading-relaxed">
              Manage faculty, students, and academic workflows from a unified control
              panel.
            </p>
          </div>
          <div className="mt-10">
            <p className="text-xs text-slate-300">Need another portal?</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                onClick={() => navigate("/teacherlogin")}
                className="text-cyan-200 hover:text-white"
              >
                Faculty Login
              </button>
              <span className="text-slate-500">|</span>
              <button
                type="button"
                onClick={() => navigate("/deanlogin")}
                className="text-cyan-200 hover:text-white"
              >
                Dean Login
              </button>
              <span className="text-slate-500">|</span>
              <button
                type="button"
                onClick={() => navigate("/directorlogin")}
                className="text-cyan-200 hover:text-white"
              >
                Director Login
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handelSubmit} className="p-8 md:p-10 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500">
              Use admin credentials to continue.
            </p>
          </div>

          <label htmlFor="admin-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            id="admin-email"
            name="email"
            placeholder="admin@college.edu"
            className="rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
            onChange={(e) => setemail(e.target.value)}
          />

          <label
            htmlFor="admin-password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            type="password"
            id="admin-password"
            name="password"
            value={password}
            placeholder="Enter your password"
            className="rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
            onChange={(e) => setpassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
