import axios from "axios";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "@/App";
const TeacherLogin = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  let section = "";

  const navigate = useNavigate();

  const submithandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const responce = await axios.post(backendUrl + "/api/loginTeacher", {
        email: email,
        password: password,
      });

      if (responce.data.success) {
        localStorage.setItem("teacherToken", responce.data.refeshTeacherToken);
        localStorage.setItem("teacherId", responce.data.findTeacher._id);
        localStorage.setItem("teachername", responce.data.findTeacher.name);
        responce.data.findTeacher?.section?.forEach((elem) => {
          section = section + "," + elem.name + " ";
        });
        localStorage.setItem("teachersection", section);
        localStorage.setItem("teacherrole", responce.data.findTeacher.role);
        localStorage.setItem("teacherdepartment", responce.data.findTeacher.department);
        navigate("/teacherdashboard");
        toast.success(responce.data.message);
      }
    } catch (error) {
      try {
        const responce = await axios.post(backendUrl + "/api/loginStaff", {
          email: email,
          password: password,
        });

        if (responce.data.success) {
          localStorage.setItem("teacherToken", responce.data.refeshStaffToken);
          localStorage.setItem("teacherId", responce.data.findStaff._id);
          localStorage.setItem("teachername", responce.data.findStaff.name);
          localStorage.setItem("teachersection", "");
          localStorage.setItem("teacherrole", responce.data.findStaff.role);
          localStorage.setItem("teacherdepartment", responce.data.findStaff.department);
          navigate("/teacherdashboard");
          toast.success(responce.data.message);
        }
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || "Login failed");
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
              Faculty & Staff Portal
            </p>
            <h1 className="mt-4 text-3xl font-semibold">Faculty Access</h1>
            <p className="mt-3 text-slate-200 text-sm leading-relaxed">
              Teachers can manage academics, and staff can apply for leave.
            </p>
          </div>
          <div className="mt-10">
            <p className="text-xs text-slate-300">Need another portal?</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-cyan-200 hover:text-white"
              >
                Admin Login
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

        <form onSubmit={submithandle} className="p-8 md:p-10 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500">
              Use your faculty or staff credentials to continue.
            </p>
          </div>

          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setemail(e.target.value)}
            type="email"
            id="email"
            className="rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />

          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            type="password"
            id="password"
            className="rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TeacherLogin
