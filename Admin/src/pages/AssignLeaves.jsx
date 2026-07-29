import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  assignLeavesToAllStaff,
  assignLeavesToAllTeachers,
  assignLeavesToStaffByEmail,
  assignLeavesToTeacherByEmail,
  getDirectorLeaveSemesters,
} from '@/lib/leaveApi';

const AssignLeaves = ({ target, mode = "semester" }) => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  
  // Leave values
  const [el, setEl] = useState("");
  const [cl, setCl] = useState("");
  const [ml, setMl] = useState("");
  const [od, setOd] = useState("");
  const [winterLeave, setWinterLeave] = useState("");
  const [summerLeave, setSummerLeave] = useState("");
  
  // Special leave values
  const [maternityLeave, setMaternityLeave] = useState("");
  const [studyLeave, setStudyLeave] = useState("");
  const [specialDisabilityLeave, setSpecialDisabilityLeave] = useState("");
  
  // Assignment details
  // For special leaves, assignMode is always "individual"
  const [assignMode, setAssignMode] = useState(mode === "special" ? "individual" : "all");
  const [targetEmail, setTargetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Reset assign mode if mode prop changes
  useEffect(() => {
    setAssignMode(mode === "special" ? "individual" : "all");
    setTargetEmail("");
  }, [mode]);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await getDirectorLeaveSemesters();
        if (response.data.success) {
          setSemesters(response.data.semesters);
          if (response.data.semesters.length > 0) {
            const current = response.data.semesters.find(s => s.isCurrent) || response.data.semesters[0];
            setSelectedSemester(current.name);
            setAcademicYear(current.academicYear);
          }
        }
      } catch (error) {
        console.error("Error fetching semesters:", error);
        toast.error("Failed to load semesters");
      }
    };
    fetchSemesters();
  }, []);

  const handleSemesterChange = (e) => {
    const semName = e.target.value;
    setSelectedSemester(semName);
    const found = semesters.find(s => s.name === semName);
    if (found) {
      setAcademicYear(found.academicYear);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const trimmedEmail = targetEmail.trim();
      if (assignMode === "individual" && !trimmedEmail) {
        toast.error(`${capitalize(target)} email is required`);
        setIsLoading(false);
        return;
      }

      // Build payload dynamically based on mode. Omitting unused leave fields prevents
      // backend from overwriting existing quotas inside MongoDB.
      const leavePayload = {
        semesterName: selectedSemester,
        academicYear,
        targetEmail: assignMode === "individual" ? trimmedEmail : "",
      };

      const addNumberIfPresent = (key, value) => {
        if (value !== "") {
          leavePayload[key] = Number(value);
        }
      };

      if (mode === "semester") {
        addNumberIfPresent("el", el);
        addNumberIfPresent("cl", cl);

        if (!["el", "cl"].some((key) => key in leavePayload)) {
          toast.error("Enter at least one semester quota to assign");
          setIsLoading(false);
          return;
        }
      } else if (mode === "yearly") {
        addNumberIfPresent("ml", ml);
        addNumberIfPresent("od", od);
        addNumberIfPresent("winterLeave", winterLeave);
        addNumberIfPresent("summerLeave", summerLeave);

        if (!["ml", "od", "winterLeave", "summerLeave"].some((key) => key in leavePayload)) {
          toast.error("Enter at least one yearly quota to assign");
          setIsLoading(false);
          return;
        }
      } else if (mode === "special") {
        leavePayload.maternityLeave = maternityLeave === "" ? undefined : Number(maternityLeave);
        leavePayload.studyLeave = studyLeave === "" ? undefined : Number(studyLeave);
        leavePayload.specialDisabilityLeave = specialDisabilityLeave === "" ? undefined : Number(specialDisabilityLeave);
      }

      // Map correct API endpoint based on target and assignment mode
      const assignLeaveFn =
        target === "teacher"
          ? assignMode === "individual"
            ? assignLeavesToTeacherByEmail
            : assignLeavesToAllTeachers
          : assignMode === "individual"
            ? assignLeavesToStaffByEmail
            : assignLeavesToAllStaff;

      const response = await assignLeaveFn(leavePayload);

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/director');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to assign leaves");
    } finally {
      setIsLoading(false);
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Dynamic Theme Colors for page visual differentiation
  const getThemeClasses = () => {
    if (mode === "semester") {
      return {
        text: "text-blue-900",
        accentText: "text-blue-600",
        bg: "bg-blue-50/50",
        border: "border-blue-100",
        btn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        ring: "focus:ring-blue-500 focus:border-blue-500",
        cardBg: "from-blue-50 to-indigo-50/30",
        badge: "bg-blue-100 text-blue-800",
      };
    }
    if (mode === "yearly") {
      return {
        text: "text-indigo-900",
        accentText: "text-indigo-600",
        bg: "bg-indigo-50/50",
        border: "border-indigo-100",
        btn: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
        ring: "focus:ring-indigo-500 focus:border-indigo-500",
        cardBg: "from-indigo-50 to-purple-50/30",
        badge: "bg-indigo-100 text-indigo-800",
      };
    }
    // "special" mode
    return {
      text: "text-amber-900",
      accentText: "text-amber-600",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      btn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
      ring: "focus:ring-amber-500 focus:border-amber-500",
      cardBg: "from-amber-50 to-orange-50/30",
      badge: "bg-amber-100 text-amber-800",
    };
  };

  const theme = getThemeClasses();

  const getPageTitles = () => {
    if (mode === "semester") {
      return {
        header: "Semester Quota Allocation",
        desc: "Allocate standard semester-based leave limits (EL, CL) for teachers and staff.",
      };
    }
    if (mode === "yearly") {
      return {
        header: "Yearly Quota Allocation",
        desc: "Allocate standard academic-year limits (ML, OD, Winter, Summer) carried forward across semesters.",
      };
    }
    return {
      header: "Individual Special Leave Allocation",
      desc: "Assign maternity, study, or special disability leave allowances to a specific individual.",
    };
  };

  const pageMeta = getPageTitles();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${theme.badge}`}>
            {capitalize(target)} Limit Management
          </span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {pageMeta.header}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 max-w-md mx-auto">
          {pageMeta.desc}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Semester Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="semester" className="block text-sm font-semibold text-slate-700">
                  Select Target Semester
                </label>
                <select
                  id="semester"
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  className={`mt-2 block w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50 ${theme.ring}`}
                  required
                >
                  <option value="">-- Choose Semester --</option>
                  {semesters.map((sem) => (
                    <option key={sem._id} value={sem.name}>
                      {sem.name} ({sem.academicYear}) {sem.isCurrent ? "[Active]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="academicYear" className="block text-sm font-semibold text-slate-700">
                  Academic Year
                </label>
                <input
                  type="text"
                  id="academicYear"
                  value={academicYear}
                  readOnly
                  className="mt-2 block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none bg-slate-50 text-slate-500 font-medium"
                />
              </div>
            </div>

            {/* Mode selection (Bulk vs Individual) - Hidden for Special Leaves */}
            {mode !== "special" && (
              <div className={`p-4 rounded-xl border ${theme.bg} ${theme.border} space-y-3`}>
                <h3 className={`text-sm font-bold ${theme.text}`}>Assign Mode Selection</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 transition-all`}>
                    <input
                      type="radio"
                      name="assignMode"
                      value="all"
                      checked={assignMode === "all"}
                      onChange={(e) => setAssignMode(e.target.value)}
                      className="h-4 w-4 text-slate-600 focus:ring-slate-400"
                    />
                    <span>Assign to all {target}s</span>
                  </label>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 transition-all`}>
                    <input
                      type="radio"
                      name="assignMode"
                      value="individual"
                      checked={assignMode === "individual"}
                      onChange={(e) => setAssignMode(e.target.value)}
                      className="h-4 w-4 text-slate-600 focus:ring-slate-400"
                    />
                    <span>Assign page by Email</span>
                  </label>
                </div>
              </div>
            )}

            {/* Email Field - Shown if individual assignMode or special leaves */}
            {(assignMode === "individual" || mode === "special") && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Target Recipient Details</h3>
                <div>
                  <label htmlFor="targetEmail" className="block text-xs font-semibold text-slate-600">
                    {capitalize(target)} Email Address
                  </label>
                  <input
                    type="email"
                    id="targetEmail"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    required
                    placeholder={`e.g. ${target}@college.edu`}
                    className={`mt-2 block w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50 ${theme.ring} bg-white placeholder-slate-400`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Entering a valid email assigns quotas exclusively to that {target}'s account.
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields: Semester Quota */}
            {mode === "semester" && (
              <div className="bg-blue-50/20 p-5 rounded-xl border border-blue-100/50 space-y-4">
                <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Semester Quota Input
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="el" className="block text-xs font-semibold text-slate-600">
                      Earned Leave (EL) Total
                    </label>
                    <input
                      type="number"
                      id="el"
                      min="0"
                      value={el}
                      onChange={(e) => setEl(e.target.value)}
                      placeholder="Keep unchanged"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="cl" className="block text-xs font-semibold text-slate-600">
                      Casual Leave (CL) Total
                    </label>
                    <input
                      type="number"
                      id="cl"
                      min="0"
                      value={cl}
                      onChange={(e) => setCl(e.target.value)}
                      placeholder="Keep unchanged"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Empty semester inputs will keep their existing values. Fill only EL or CL quotas that you want to update.
                </p>
              </div>
            )}

            {/* Form Fields: Yearly Quota */}
            {mode === "yearly" && (
              <div className="bg-indigo-50/20 p-5 rounded-xl border border-indigo-100/50 space-y-4">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  Yearly Quota Input
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ml" className="block text-xs font-semibold text-slate-600">
                      Medical Leave (ML) Total
                    </label>
                    <input
                      type="number"
                      id="ml"
                      min="0"
                      value={ml}
                      onChange={(e) => setMl(e.target.value)}
                      placeholder="Keep unchanged"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                      
                    />
                  </div>
                  <div>
                    <label htmlFor="od" className="block text-xs font-semibold text-slate-600">
                      On-Duty Leave (OD) Total
                    </label>
                    <input
                      type="number"
                      id="od"
                      min="0"
                      value={od}
                      onChange={(e) => setOd(e.target.value)}
                      placeholder="Keep unchanged"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                       
                    />
                  </div>
                  <div>
                    <label htmlFor="winterLeave" className="block text-xs font-semibold text-slate-600">
                      Winter Leave Total
                    </label>
                    <input
                      type="number"
                      id="winterLeave"
                      min="0"
                      value={winterLeave}
                      onChange={(e) => setWinterLeave(e.target.value)}
                      placeholder="Keep unchanged"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="summerLeave" className="block text-xs font-semibold text-slate-600">
                      Summer Leave Total
                    </label>
                    <input
                      type="number"
                      id="summerLeave"
                      min="0"
                      value={summerLeave}
                      onChange={(e) => setSummerLeave(e.target.value)}
                      placeholder="Keep unchanged"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Empty yearly inputs will keep their existing values. Fill only ML, OD, Winter, or Summer quotas that you want to update.
                </p>
              </div>
            )}

            {/* Form Fields: Special Leave */}
            {mode === "special" && (
              <div className="bg-amber-50/30 p-5 rounded-xl border border-amber-100/70 space-y-4">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Special Leave Input Values
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="maternityLeave" className="block text-xs font-semibold text-slate-600">
                      Maternity Leave
                    </label>
                    <input
                      type="number"
                      id="maternityLeave"
                      min="0"
                      value={maternityLeave}
                      onChange={(e) => setMaternityLeave(e.target.value)}
                      placeholder="None"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="studyLeave" className="block text-xs font-semibold text-slate-600">
                      Study Leave
                    </label>
                    <input
                      type="number"
                      id="studyLeave"
                      min="0"
                      value={studyLeave}
                      onChange={(e) => setStudyLeave(e.target.value)}
                      placeholder="None"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="specialDisabilityLeave" className="block text-xs font-semibold text-slate-600">
                      Special Leave
                    </label>
                    <input
                      type="number"
                      id="specialDisabilityLeave"
                      min="0"
                      value={specialDisabilityLeave}
                      onChange={(e) => setSpecialDisabilityLeave(e.target.value)}
                      placeholder="None"
                      className={`mt-1.5 block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.ring}`}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  * Empty inputs will retain their original values in the database. Only provided rates will be overwritten.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/director')}
                className="w-1/3 flex justify-center py-2.5 px-4 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 transition-all rounded-lg text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-2/3 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.btn} disabled:opacity-60`}
              >
                {isLoading ? "Processing..." : `Assign ${capitalize(mode)} Allocation`}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignLeaves;
