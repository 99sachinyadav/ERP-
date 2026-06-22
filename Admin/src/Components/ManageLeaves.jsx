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

const departments = ["ALL", "AIML", "EN", "CSE", "APPLIED", "ADMINISTRATOR", "STAFF"];
const leaveTypes = ["ALL", "EL", "CL", "ML", "OD", "COMPOFF"];
const requestKinds = ["ALL", "LEAVE_USAGE", "COMPOFF_CREDIT"];
const statusOptions = [
  "ALL",
  "PENDING_ADMIN",
  "FORWARDED_TO_DIRECTOR",
  "APPROVED",
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
  PENDING_ADMIN: "bg-amber-100 text-amber-700",
  FORWARDED_TO_DIRECTOR: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED_BY_ADMIN: "bg-red-100 text-red-700",
  REJECTED_BY_DIRECTOR: "bg-red-100 text-red-700",
};

const leaveBalanceRows = (balance) => [
  ["EL", balance.elTotal, balance.elUsed, balance.elTotal - balance.elUsed],
  ["CL", balance.clTotal, balance.clUsed, balance.clTotal - balance.clUsed],
  ["ML", balance.mlTotal, balance.mlUsed, balance.mlTotal - balance.mlUsed],
  ["OD", "-", balance.odUsed, "-"],
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
              Admin Review and Semester Control
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Forward teacher leave requests and close semesters manually.
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
              <option value="SEMESTER-1">SEMESTER-1</option>
              <option value="SEMESTER-2">SEMESTER-2</option>
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Teacher Leave Records
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={filters.department}
              onChange={(event) => updateFilter("department", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <select
              value={filters.leaveType}
              onChange={(event) => updateFilter("leaveType", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={filters.requestKind}
              onChange={(event) => updateFilter("requestKind", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {requestKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search teacher"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="p-3">Teacher</th>
                <th className="p-3">Department</th>
                <th className="p-3">Type</th>
                <th className="p-3">Kind</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Teacher Remark</th>
                <th className="p-3">Document</th>
                <th className="p-3">Status</th>
                <th className="p-3">Admin Remark</th>
                <th className="p-3">Director Remark</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">
                    {request.teacher?.name || "Teacher"}
                    <p className="text-xs font-normal text-slate-500">
                      {request.teacher?.email}
                    </p>
                  </td>
                  <td className="p-3">{request.department}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                      {request.leaveType}
                    </span>
                  </td>
                  <td className="p-3">
                    {request.requestKind === "COMPOFF_CREDIT"
                      ? "Comp off credit"
                      : "Leave usage"}
                  </td>
                  <td className="p-3">
                    {formatDate(request.fromDate)} - {formatDate(request.toDate)}
                    <p className="text-xs text-slate-500">{request.days} day(s)</p>
                  </td>
                  <td className="max-w-[220px] p-3 text-slate-600">
                    {request.reason}
                  </td>
                  <td className="p-3">
                    {request.attachment?.data ? (
                      <a
                        href={attachmentHref(request.attachment)}
                        download={request.attachment.fileName || "leave-document"}
                        className="font-semibold text-blue-700 hover:text-blue-800"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClass[request.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {request.status === "PENDING_ADMIN" ? (
                      <input
                        value={remarks[request._id] || ""}
                        onChange={(event) =>
                          updateRemark(request._id, event.target.value)
                        }
                        placeholder="Admin remark"
                        className="w-44 rounded-lg border border-slate-300 px-3 py-2"
                      />
                    ) : (
                      request.adminApproval?.remark || "-"
                    )}
                  </td>
                  <td className="max-w-[180px] p-3 text-slate-600">
                    {request.directorApproval?.remark || "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openTeacherDetails(request)}
                        className="rounded-lg bg-slate-800 px-3 py-2 font-semibold text-white hover:bg-slate-700"
                      >
                        View
                      </button>
                      {request.status === "PENDING_ADMIN" && (
                        <>
                          <button
                            type="button"
                            onClick={() => forwardLeave(request._id)}
                            className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700"
                          >
                            Forward
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectLeave(request._id)}
                            className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!requests.length && !loading && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan="11">
                    No leave records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(teacherDetails || detailsLoading) && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Teacher Leave Details
              </h2>
              <p className="text-sm text-slate-500">
                {teacherDetails?.teacher?.name || "Selected teacher"}{" "}
                {teacherDetails?.teacher?.email ? `- ${teacherDetails.teacher.email}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTeacherDetails(null)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          {detailsLoading ? (
            <p className="text-sm text-slate-500">Loading teacher leave details...</p>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-slate-900">All Leave Balances</h3>
                <div className="space-y-4">
                  {teacherDetails.leaveBalances.map((balance) => (
                    <div key={balance._id} className="rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">
                        {balance.semester} - {balance.academicYear}
                      </p>
                      <p className="text-sm text-slate-500">{balance.department}</p>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[420px] text-sm">
                          <thead>
                            <tr className="border-b text-left text-slate-500">
                              <th className="py-2">Type</th>
                              <th className="py-2">Total</th>
                              <th className="py-2">Used</th>
                              <th className="py-2">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaveBalanceRows(balance).map(([type, total, used, remaining]) => (
                              <tr key={type} className="border-b last:border-0">
                                <td className="py-2 font-medium">{type}</td>
                                <td className="py-2">{total}</td>
                                <td className="py-2">{used}</td>
                                <td className="py-2">{remaining}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  {!teacherDetails.leaveBalances.length && (
                    <p className="text-sm text-slate-500">No leave balance found.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-slate-900">All Leave Requests</h3>
                <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
                  {teacherDetails.leaveRequests.map((request) => (
                    <div key={request._id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {request.leaveType} - {request.days} day(s)
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDate(request.fromDate)} to {formatDate(request.toDate)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusClass[request.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Teacher: {request.reason || "-"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Document:{" "}
                        {request.attachment?.data ? (
                          <a
                            href={attachmentHref(request.attachment)}
                            download={request.attachment.fileName || "leave-document"}
                            className="font-semibold text-blue-700 hover:text-blue-800"
                          >
                            {request.attachment.fileName || "View attachment"}
                          </a>
                        ) : (
                          "-"
                        )}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Admin: {request.adminApproval?.remark || "-"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Director: {request.directorApproval?.remark || "-"}
                      </p>
                    </div>
                  ))}
                  {!teacherDetails.leaveRequests.length && (
                    <p className="text-sm text-slate-500">No leave requests found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Leave Summary</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.map((item) => (
            <div
              key={`${item._id.department}-${item._id.leaveType}-${item._id.status}`}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {item._id.department} - {item._id.leaveType}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.requests} request(s), {item.days} day(s)
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusClass[item._id.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item._id.status}
                </span>
              </div>
            </div>
          ))}
          {!summary.length && (
            <p className="text-sm text-slate-500">No summary data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLeaves;
