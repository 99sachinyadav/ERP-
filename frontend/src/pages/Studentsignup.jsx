import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "@/App";

const Studentsignup = () => {
  const [image, setimage] = useState(null);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [address, setaddress] = useState("");
  const [mobile, setmobile] = useState("");
  const [section, setsection] = useState("");
  const [rollno, setrollno] = useState("");
  const [dob, setdob] = useState("");
  const [batch, setbatch] = useState("");
  const [year, setyear] = useState("");
  const [fathername, setfathername] = useState("");
  const [semester, setsemester] = useState("");
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSecondsLeft, setCodeSecondsLeft] = useState(0);
  const [codeExpired, setCodeExpired] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optional guard: you had one in previous version; keep or remove as you like
    if (!image) {
      toast.error("Please upload profile image");
      return;
    }
    setIsSendingCode(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/requestStudentVerification",
        { email, name },
        { timeout: 30000 }
      );

      if (response.data.sucess) {
        toast.success(response.data.message);
        setIsVerifyOpen(true);
        setCodeSecondsLeft(600);
        setCodeExpired(false);
      } else {
        toast.error(response.data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSendingCode(false);
    }
  };

  const submitRegistrationWithCode = async () => {
    if (!verificationCode) {
      toast.error("Enter the verification code");
      return;
    }
    if (codeExpired) {
      toast.error("Verification code expired. Please resend.");
      return;
    }
    setIsVerifying(true);
    try {
      const formData = new FormData();
      // File
      formData.append("image", image);

      // Simple fields
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("section", section);
      formData.append("rollno", rollno);
      formData.append("dob", dob);
      formData.append("batch", batch);
      formData.append("year", year);
      formData.append("semester", semester);
      formData.append("father_name", fathername);
      formData.append("verificationCode", verificationCode);
      // Contact info (flat fields because FormData can't send nested objects)
      formData.append("address", address);
      formData.append("phoneNO", mobile);

      const response = await axios.post(
        backendUrl + "/api/registerStudentWithCode",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      if (response.data.sucess) {
        localStorage.setItem("token", response.data.studentToken);
        localStorage.setItem("studentname", response.data.name);

        toast.success(response.data.message);
        setIsVerifyOpen(false);
        navigate("/home");

        setname("");
        setaddress("");
        setbatch("");
        setdob("");
        setemail("");
        setfathername("");
        setimage(null);
        setmobile("");
        setpassword("");
        setrollno("");
        setsection("");
        setyear("");
        setsemester("");
        setVerificationCode("");
        setCodeSecondsLeft(0);
        setCodeExpired(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationCode = async () => {
    if (!email) {
      toast.error("Enter email first");
      return;
    }
    setIsSendingCode(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/requestStudentVerification",
        { email, name },
        { timeout: 30000 }
      );
      if (response.data.sucess) {
        toast.success("Verification code resent");
        setCodeSecondsLeft(600);
        setCodeExpired(false);
      } else {
        toast.error(response.data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSendingCode(false);
    }
  };

  useEffect(() => {
    if (!isVerifyOpen) return;
    if (codeSecondsLeft <= 0) {
      setCodeExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setCodeSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isVerifyOpen, codeSecondsLeft]);
  const handlelogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 py-8 px-2">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 sm:p-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-900 text-center mb-8">
          Registration <span className="text-red-500">Form</span>
        </h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side */}
          <div className="flex flex-col gap-6">
            <div className="mb-[20px] text-center">
              <label className="block text-lg font-semibold text-blue-800 mb-2">Profile Image</label>
              <div className="flex items-center  justify-center gap-4">
                <label
                  htmlFor="image1"
                  className="cursor-pointer w-32 h-32 flex items-center justify-center border-2 border-blue-300 rounded-lg bg-gray-50 hover:bg-blue-50 transition"
                >
                  <input
                    id="image1"
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) setimage(f);
                    }}
                  />
                  {image ? (
                    <img
                      className="w-32 h-32 object-cover rounded-lg"
                      src={URL.createObjectURL(image)}
                      alt="Uploaded Preview"
                    />
                  ) : (
                    <span className="text-blue-400 text-2xl">+</span>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Student Name</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={name}
                onChange={(e) => setname(e.target.value)}
                placeholder="Enter Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Roll No</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={rollno}
                onChange={(e) => setrollno(e.target.value)}
                placeholder="Enter Your Roll No"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Father's Name</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={fathername}
                onChange={(e) => setfathername(e.target.value)}
                placeholder="Enter Father's Name"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Semester</label>
              <select
                value={semester}
                onChange={(e) => setsemester(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                required
              >
                <option value="">Select Semester</option>
                <option value="Ist">1st sem</option>
                <option value="IInd">2nd sem</option>
                <option value="IIIrd">3rd sem</option>
                <option value="IVth">4th sem</option>
                <option value="Vth">5th sem</option>
                <option value="VIth">6th sem</option>
                <option value="VIIth">7th sem</option>
                <option value="VIIIth">8th sem</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Mobile</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={mobile}
                onChange={(e) => setmobile(e.target.value)}
                placeholder="Enter Mobile Number"
                required
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Date of Birth</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="date"
                value={dob}
                onChange={(e) => setdob(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Batch</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={batch}
                onChange={(e) => setbatch(e.target.value)}
                placeholder="Enter Starting Year"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Year</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                value={year}
                onChange={(e) => setyear(e.target.value)}
                required
              >
                <option value="">Select Year</option>
                <option value="Ist">Ist</option>
                <option value="IInd">IInd</option>
                <option value="IIIrd">IIIrd</option>
                <option value="IVth">IVth</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Section</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={section}
                onChange={(e) => setsection(e.target.value)}
                placeholder="Enter Section"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Email</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                placeholder="Enter Email"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Password</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-blue-800 mb-2">Address</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                type="text"
                value={address}
                onChange={(e) => setaddress(e.target.value)}
                placeholder="Enter Address"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex flex-col items-center mt-4">
            <button
              type="submit"
              disabled={isSendingCode}
              className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition text-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSendingCode ? "Sending Code..." : "Register"}
            </button>
            <p onClick={handlelogin} className="mt-4 text-blue-700 hover:underline cursor-pointer text-md">
              Already have an account? Login here...
            </p>
          </div>
        </form>
      </div>
      {isVerifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">Verify Your Email</h2>
            <p className="mt-2 text-sm text-slate-600">
              We sent a verification code to <span className="font-semibold">{email}</span>.
            </p>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span>
                {codeExpired ? "Code expired." : "Code expires in"}
              </span>
              <span className="font-semibold text-slate-800">
                {codeExpired
                  ? "--:--"
                  : `${String(Math.floor(codeSecondsLeft / 60)).padStart(2, "0")}:${String(
                      codeSecondsLeft % 60
                    ).padStart(2, "0")}`}
              </span>
            </div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {codeExpired ? (
              <p className="mt-2 text-xs font-semibold text-red-500">
                Verification code expired. Please resend.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={submitRegistrationWithCode}
                disabled={isVerifying || codeExpired}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isVerifying ? "Verifying..." : "Verify & Register"}
              </button>
              <button
                type="button"
                onClick={resendVerificationCode}
                disabled={isSendingCode}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Resend Code
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsVerifyOpen(false)}
              className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studentsignup;

