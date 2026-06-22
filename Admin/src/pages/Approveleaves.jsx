import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  approveLeaveByDirector,
  getLeaveRecords,
  getLeaveSummary,
  getTeacherLeaveDetails,
  rejectLeaveByDirector,
} from "@/lib/leaveApi";

const COLORS = ["#F59E0B", "#10B981", "#EF4444"];

const emptyFilters = {
  status: "FORWARDED_TO_DIRECTOR",
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
  CANCELLED: "bg-slate-100 text-slate-700",
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

const Approveleaves = () => {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [filters, setFilters] = useState(emptyFilters);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [pendingRes, summaryRes] = await Promise.all([
        getLeaveRecords(filters, "directorToken"),
        getLeaveSummary("directorToken"),
      ]);
      setRequests(pendingRes.data.leaveRequests || []);
      setSummary(summaryRes.data.summary || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const chartData = useMemo(() => {
    const approved = summary
      .filter((item) => item._id.status === "APPROVED")
      .reduce((total, item) => total + item.requests, 0);
    const rejected = summary
      .filter((item) => item._id.status.includes("REJECTED"))
      .reduce((total, item) => total + item.requests, 0);

    return [
      { name: "Matching", value: requests.length },
      { name: "Approved", value: approved },
      { name: "Rejected", value: rejected },
    ];
  }, [requests, summary]);

  const totalRequests = chartData.reduce((total, item) => total + item.value, 0);

  const updateRemark = (id, value) => {
    setRemarks((current) => ({ ...current, [id]: value }));
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const approveLeave = async (id) => {
    try {
      await approveLeaveByDirector(id, remarks[id] || "");
      toast.success("Leave approved");
      loadRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to approve leave");
    }
  };

  const rejectLeave = async (id) => {
    try {
      await rejectLeaveByDirector(id, remarks[id] || "");
      toast.success("Leave rejected");
      loadRequests();
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
      const response = await getTeacherLeaveDetails(teacherId, "directorToken");
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
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Director Approval
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Final Leave Approval Queue
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Approve forwarded leave requests and comp off credits.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRequests}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <i className="ri-refresh-line"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.name}</p>
            <h2
              className="mt-2 text-3xl font-bold"
              style={{ color: COLORS[index] }}
            >
              {item.value}
            </h2>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tracked</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {totalRequests}
          </h2>
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Teacher Leave Records
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
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
                      <p className="text-xs text-slate-500">
                        {request.days} day(s)
                      </p>
                    </td>
                    <td className="max-w-[180px] p-3 text-slate-600">
                      {request.reason || "-"}
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
                    <td className="max-w-[180px] p-3 text-slate-600">
                      {request.adminApproval?.remark || "-"}
                    </td>
                    <td className="p-3">
                      {request.status === "FORWARDED_TO_DIRECTOR" ? (
                        <input
                          value={remarks[request._id] || ""}
                          onChange={(event) =>
                            updateRemark(request._id, event.target.value)
                          }
                          placeholder="Director remark"
                          className="w-44 rounded-lg border border-slate-300 px-3 py-2"
                        />
                      ) : (
                        request.directorApproval?.remark || "-"
                      )}
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
                        {request.status === "FORWARDED_TO_DIRECTOR" && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveLeave(request._id)}
                              className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700"
                            >
                              Approve
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Approval Analytics
          </h2>
          <div className="relative mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-slate-900">
                {totalRequests}
              </h2>
              <p className="text-sm text-slate-500">Requests</p>
            </div>
          </div>
        </div>
      </div>

      {(teacherDetails || detailsLoading) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
    </div>
  );
};

export default Approveleaves;
