import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  closeLeaveSemester,
  createLeaveSemester,
  forwardLeaveToDirector,
  getLeaveRecords,
  getLeaveSemesters,
  getLeaveSummary,
  getTeacherLeaveDetails,
  rejectLeaveByAdmin,
} from "@/lib/leaveApi";

const emptySemesterForm = {
  name: "",
  academicYear: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
};

const emptyFilters = {
  status: "PENDING_ADMIN",
  department: "ALL",
  leaveType: "ALL",
  requestKind: "ALL",
  search: "",
};

const departments = ["AIML/CSE/IT", "ECE/EN", "APPLIED/STAFF", "ADMINISTRATOR"];
const leaveTypes = ["ALL", "EL", "CL", "ML", "OD", "WINTER_LEAVE", "SUMMER_LEAVE", "COMPOFF"];
const requestKinds = ["ALL", "LEAVE_USAGE", "COMPOFF_CREDIT"];
const statusOptions = [
  "ALL",
  "PENDING_HOD",
  "PENDING_ADMIN",
  "FORWARDED_TO_DIRECTOR",
  "APPROVED",
  "REJECTED_BY_HOD",
  "REJECTED_BY_ADMIN",
  "REJECTED_BY_DIRECTOR",
  "CANCELLED",
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClass = {
  PENDING_HOD: "bg-purple-100 text-purple-700",
  PENDING_ADMIN: "bg-amber-100 text-amber-700",
  FORWARDED_TO_DIRECTOR: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED_BY_HOD: "bg-red-100 text-red-700",
  REJECTED_BY_ADMIN: "bg-red-100 text-red-700",
  REJECTED_BY_DIRECTOR: "bg-red-100 text-red-700",
};

const leaveBalanceRows = (balance) => [
  ["EL", balance.elTotal, balance.elUsed, balance.elTotal - balance.elUsed],
  ["CL", balance.clTotal, balance.clUsed, balance.clTotal - balance.clUsed],
  ["ML", balance.mlTotal, balance.mlUsed, balance.mlTotal - balance.mlUsed],
  ["OD", "-", balance.odUsed, "-"],
  [
    "WINTER_LEAVE",
    balance.winterLeaveTotal || 0,
    balance.winterLeaveUsed || 0,
    (balance.winterLeaveTotal || 0) - (balance.winterLeaveUsed || 0),
  ],
  [
    "SUMMER_LEAVE",
    balance.summerLeaveTotal || 0,
    balance.summerLeaveUsed || 0,
    (balance.summerLeaveTotal || 0) - (balance.summerLeaveUsed || 0),
  ],
  [
    "COMPOFF",
    balance.compoffTotal,
    balance.compoffUsed,
    balance.compoffTotal - balance.compoffUsed,
  ],
];

const attachmentHref = (attachment) => {
  if (!attachment?.data || !attachment?.mimeType) return "";
  return `data:${attachment.mimeType};base64,${attachment.data}`;
};

const ManageLeaves = () => {
  const [requests, setRequests] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [summary, setSummary] = useState([]);
  const [semesterForm, setSemesterForm] = useState(emptySemesterForm);
  const [closeForm, setCloseForm] = useState({
    completedSemesterId: "",
    nextSemesterId: "",
  });
  const [remarks, setRemarks] = useState({});
  const [filters, setFilters] = useState(emptyFilters);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      const [pendingRes, semestersRes, summaryRes] = await Promise.all([
        getLeaveRecords(filters),
        getLeaveSemesters(),
        getLeaveSummary(),
      ]);

      setRequests(pendingRes.data.leaveRequests || []);
      setSemesters(semestersRes.data.semesters || []);
      setSummary(summaryRes.data.summary || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load leave data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, [filters]);

  const totals = useMemo(() => {
    const forwardedStatuses = [
      "FORWARDED_TO_DIRECTOR",
      "APPROVED",
      "REJECTED_BY_DIRECTOR",
    ];
    const summaryDays = summary
      .filter((item) => forwardedStatuses.includes(item._id.status))
      .reduce((total, item) => total + item.days, 0);

    return {
      matching: requests.length,
      semesters: semesters.length,
      activeSemester:
        semesters.find((semester) => semester.isCurrent)?.name || "Not set",
      summaryDays,
    };
  }, [requests, semesters, summary]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSemesterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSemesterForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createSemester = async (event) => {
    event.preventDefault();
    try {
      await createLeaveSemester(semesterForm);
      toast.success("Semester created");
      setSemesterForm(emptySemesterForm);
      loadLeaveData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Semester creation failed");
    }
  };

  const closeSemester = async (event) => {
    event.preventDefault();
    try {
      const response = await closeLeaveSemester(closeForm);
      toast.success(
        `Semester closed. ${response.data.teachersUpdated || 0} teacher balance(s) updated`
      );
      setCloseForm({ completedSemesterId: "", nextSemesterId: "" });
      loadLeaveData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Semester closing failed");
    }
  };

  const updateRemark = (id, value) => {
    setRemarks((current) => ({ ...current, [id]: value }));
  };

  const forwardLeave = async (id) => {
    try {
      await forwardLeaveToDirector(id, remarks[id] || "");
      toast.success("Forwarded to director");
      loadLeaveData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to forward leave");
    }
  };

  const rejectLeave = async (id) => {
    try {
      await rejectLeaveByAdmin(id, remarks[id] || "");
      toast.success("Leave rejected");
      loadLeaveData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reject leave");
    }
  };

  const openTeacherDetails = async (request) => {
    const teacherId = request.teacher?._id || request.teacher;
    if (!teacherId) {
      toast.error("Teacher details are not available for this request");
      return;
    }

    try {
      setDetailsLoading(true);
      const response = await getTeacherLeaveDetails(teacherId);
      setTeacherDetails({
        teacher: request.teacher,
        leaveRequests: response.data.leaveRequests || [],
        leaveBalances: response.data.leaveBalances || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load teacher leave details");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-slate-100 p-4 sm:p-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Leave Administration
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Semester and Academic Control
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage academic years, semesters, and carry-forward settings.
            </p>
          </div>
          <button
            type="button"
            onClick={loadLeaveData}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <i className="ri-refresh-line"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Matching Records</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-600">
            {totals.matching}
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Semester</p>
          <h2 className="mt-2 text-xl font-bold text-blue-700">
            {totals.activeSemester}
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Semesters</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {totals.semesters}
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Admin Forwarded Days</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {totals.summaryDays}
          </h2>
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={createSemester}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Create Semester
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              name="name"
              value={semesterForm.name}
              onChange={handleSemesterChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select semester</option>
              <option value="EVEN-SEMESTER">EVEN-SEMESTER</option>
              <option value="ODD-SEMESTER">ODD-SEMESTER</option>
            </select>
            {/* <input
              name="name"
              value={semesterForm.name}
              onChange={handleSemesterChange}
              placeholder="Semester 1"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            /> */}
            <input
              name="academicYear"
              value={semesterForm.academicYear}
              onChange={handleSemesterChange}
              placeholder="2026-2027"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="startDate"
              value={semesterForm.startDate}
              onChange={handleSemesterChange}
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="endDate"
              value={semesterForm.endDate}
              onChange={handleSemesterChange}
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              name="isCurrent"
              checked={semesterForm.isCurrent}
              onChange={handleSemesterChange}
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
            />
            Mark as current active semester
          </label>
          <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Create Semester
          </button>
        </form>

        <form
          onSubmit={closeSemester}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Close Semester
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This marks the completed semester closed and carries unused EL to the next semester.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              value={closeForm.completedSemesterId}
              onChange={(event) =>
                setCloseForm((current) => ({
                  ...current,
                  completedSemesterId: event.target.value,
                }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Completed semester</option>
              {semesters.slice(0,2).map((semester) => (
                <option key={semester._id} value={semester._id}>
                  {semester.name} - {semester.academicYear}
                </option>
              ))}
            </select>
            <select
              value={closeForm.nextSemesterId}
              onChange={(event) =>
                setCloseForm((current) => ({
                  ...current,
                  nextSemesterId: event.target.value,
                }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
                {console.log(semesters)}
              <option value="">Next semester</option>
              {semesters.slice(0, 2).map((semester) => (
                <option key={semester._id} value={semester._id}>
                  {semester.name} - {semester.academicYear}
                </option>
              ))}
             
            </select>
          </div>
          <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Close Semester
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageLeaves;
