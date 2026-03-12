import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "@/App";

const DirectorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(backendUrl + "/api/loginAdmin", {
        email,
        password,
      });

      if (response.data.sucess) {
        localStorage.setItem("directorToken", response.data.adminToken);
        toast.success(response.data.message);
        setEmail("");
        setPassword("");
        navigate("/director");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      toast.error(msg);
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
              Strategic View
            </p>
            <h1 className="mt-4 text-3xl font-semibold">Director Access</h1>
            <p className="mt-3 text-slate-200 text-sm leading-relaxed">
              Track academic performance and attendance trends for institutional
              oversight.
            </p>
          </div>
          <div className="mt-10">
            <p className="text-xs text-slate-300">Looking for another portal?</p>
            <div className="mt-3 flex gap-3 text-sm">
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
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 md:p-10 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500">
              Use director credentials to access oversight tools.
            </p>
          </div>

          <label className="text-sm font-medium text-slate-700" htmlFor="director-email">
            Email
          </label>
          <input
            id="director-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="director@college.edu"
            className="rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />

          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="director-password"
          >
            Password
          </label>
          <input
            id="director-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
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

export default DirectorLogin;
