import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import logo from "../assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import {
  applyCompoffCredit,
  applyTeacherLeave,
  getMyLeaveBalance,
  getMyLeaveRequests,
  applyStaffLeave,
  applyStaffCompoffCredit,
  requestLeaveRollback,
} from "@/lib/leaveApi";

const departments = ["AIML/CSE/IT", "ECE/EN", "APPLIED/STAFF", "ADMINISTRATOR"];

const leaveTypes = [
  "EL",
  "CL",
  "ML",
  "OD",
  "WINTER_LEAVE",
  "SUMMER_LEAVE",
  "COMPOFF",
  "MATERNITY_LEAVE",
  "STUDY_LEAVE",
  "SPECIAL_DISABILITY_LEAVE",
];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

const emptyForm = {
  department: "",
  leaveType: "CL",
  fromDate: "",
  toDate: "",
  days: "",
  reason: "",
  attachment: null,
};

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
  FORWARDED_TO_DIRECTOR: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED_BY_HOD: "bg-red-100 text-red-700",
  REJECTED_BY_DIRECTOR: "bg-red-100 text-red-700",
  ROLLBACK_REQUESTED: "bg-amber-100 text-amber-700",
  ROLLED_BACK: "bg-slate-100 text-slate-700",
  ROLLBACK_REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

const balanceValue = (balance, type) => {
  if (!balance) return 0;
  if (type === "EL") return balance.elTotal - balance.elUsed;
  if (type === "CL") return balance.clTotal - balance.clUsed;
  if (type === "ML") return balance.mlTotal - balance.mlUsed;
  if (type === "COMPOFF") return balance.compoffTotal - balance.compoffUsed;
  if (type === "OD") return (balance.odTotal || 0) - balance.odUsed;
  if (type === "WINTER_LEAVE") {
    return (balance.winterLeaveTotal || 0) - (balance.winterLeaveUsed || 0);
  }
  if (type === "SUMMER_LEAVE") {
    return (balance.summerLeaveTotal || 0) - (balance.summerLeaveUsed || 0);
  }
  if (type === "MATERNITY_LEAVE") {
    return (balance.maternityLeaveTotal || 0) - (balance.maternityLeaveUsed || 0);
  }
  if (type === "STUDY_LEAVE") {
    return (balance.studyLeaveTotal || 0) - (balance.studyLeaveUsed || 0);
  }
  if (type === "SPECIAL_DISABILITY_LEAVE") {
    return (
      (balance.specialDisabilityLeaveTotal || 0) -
      (balance.specialDisabilityLeaveUsed || 0)
    );
  }
  return 0;
};

const leaveTypeLabel = (type) =>
  ({
    MATERNITY_LEAVE: "Maternity Leave",
    STUDY_LEAVE: "Study Leave",
    SPECIAL_DISABILITY_LEAVE: "Special Disability Leave",
    WINTER_LEAVE: "Winter Leave",
    SUMMER_LEAVE: "Summer Leave",
  }[type] || type);

const approvalRemark = (request) => {
  const remarks = [];
  if (request.hodApproval?.remark) {
    remarks.push(`HOD: ${request.hodApproval.remark}`);
  }
  if (request.adminApproval?.remark) {
    remarks.push(`Admin: ${request.adminApproval.remark}`);
  }
  if (request.directorApproval?.remark) {
    remarks.push(`Director: ${request.directorApproval.remark}`);
  }
  return remarks.join(" | ");
};

const attachmentHref = (attachment) => {
  if (!attachment?.data || !attachment?.mimeType) return "";
  return `data:${attachment.mimeType};base64,${attachment.data}`;
};

const Leave = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [activeBalance, setActiveBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      const [requestsRes, balanceRes] = await Promise.all([
        getMyLeaveRequests(),
        getMyLeaveBalance(),
      ]);
      setRequests(requestsRes.data.leaveRequests || []);
      setBalances(balanceRes.data.leaveBalances || []);
      setActiveBalance(balanceRes.data.currentBalance || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load leave data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  const currentBalance = useMemo(
    () => activeBalance || balances[0],
    [activeBalance, balances]
  );
  const pendingCount = requests.filter(
    (request) =>
      request.status === "PENDING_HOD" ||
      request.status === "PENDING_ADMIN" ||
      request.status === "FORWARDED_TO_DIRECTOR"
  ).length;
  const approvedCount = requests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, attachment: null }));
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("Attachment size cannot be more than 2 MB");
      setFileInputKey((current) => current + 1);
      setForm((current) => ({ ...current, attachment: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const data = result.includes(",") ? result.split(",").pop() : result;
      setForm((current) => ({
        ...current,
        attachment: {
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          data,
        },
      }));
    };
    reader.onerror = () => toast.error("Unable to read attachment");
    reader.readAsDataURL(file);
  };

  const isStaff = localStorage.getItem("teacherrole") === "STAFF" ;

  const submitLeave = async (event) => {
    event.preventDefault();
    try {
      if (isStaff) {
        console.log(form.department)
       const res = await applyStaffLeave(form);
        toast.success(res.data.message);
      } else {
        console.log("Hello")
        const res = await applyTeacherLeave(form);
        toast.success(res.data.message);
      }
      setForm(emptyForm);
      setFileInputKey((current) => current + 1);
      loadLeaveData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to apply leave");
    }
  };

  const submitCompoffCredit = async () => {
    try {
      const payload = { ...form };
      delete payload.leaveType;
      if (isStaff) {
        await applyStaffCompoffCredit(payload);
        toast.success("Comp off credit request sent to Director");
      } else {
        await applyCompoffCredit(payload);
        toast.success("Comp off credit request sent to admin");
      }
      setForm(emptyForm);
      setFileInputKey((current) => current + 1);
      loadLeaveData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to apply comp off credit"
      );
    }
  };

  const submitRollbackRequest = async (request) => {
    try {
      const reason = window.prompt("Reason for rollback request", "");
      if (reason === null) return;

      await requestLeaveRollback(request._id, reason);
      toast.success("Rollback request sent to Director");
      loadLeaveData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to request rollback");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="college" className="h-14 w-14 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Leave Desk
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Welcome, {localStorage.getItem("teachername") || "Teacher"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Apply for EL, CL, ML, OD, Winter, Summer, comp off leave, or comp off credit.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
            <div className="flex w-full gap-2 sm:w-auto">
              <div className="flex min-w-24 flex-1 items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm sm:flex-none sm:gap-3">
                <span className="font-semibold text-amber-700">Pending</span>
                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              </div>
              <div className="flex min-w-24 flex-1 items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm sm:flex-none sm:gap-3">
                <span className="font-semibold text-emerald-700">Approved</span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                  {approvedCount}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/teacherdashboard")} className="w-full sm:w-auto">Back to Dashboard</Button>
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >Refresh</Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        {[
          { type: "EL", label: "EL Balance" },
          { type: "CL", label: "CL Balance" },
          { type: "ML", label: "ML (Yearly)" },
          { type: "OD", label: "OD (Yearly)" },
          { type: "WINTER_LEAVE", label: "Winter (Yearly)" },
          { type: "SUMMER_LEAVE", label: "Summer (Yearly)" },
          { type: "COMPOFF", label: "CompOff" },
          { type: "MATERNITY_LEAVE", label: "Maternity" },
          { type: "STUDY_LEAVE", label: "Study" },
          { type: "SPECIAL_DISABILITY_LEAVE", label: "Special Disability" },
        ].map((item) => (
          <div
            key={item.type}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-700">
              {balanceValue(currentBalance, item.type)}
            </h2>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr,1.2fr]">
        <form
          onSubmit={submitLeave}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Apply Leave</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Department</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {leaveTypeLabel(type)}
                </option>
              ))}
            </select>
            <input
              name="fromDate"
              value={form.fromDate}
              onChange={handleChange}
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="toDate"
              value={form.toDate}
              onChange={handleChange}
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="days"
              value={form.days}
              onChange={handleChange}
              type="number"
              min={["EL", "COMPOFF"].includes(form.leaveType) ? "0.5" : "0.5"}
              step="0.5"
              placeholder="Days"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows="4"
            placeholder="Reason"
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3">
            <input
              key={fileInputKey}
              type="file"
              onChange={handleAttachmentChange}
              className="w-full text-sm text-slate-700"
            />
            <p className="mt-2 text-xs text-slate-500">
              Optional document, maximum 2 MB.
            </p>
            {form.attachment?.fileName && (
              <p className="mt-1 text-sm font-medium text-slate-700">
                Attached: {form.attachment.fileName}
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Submit Leave
            </button>
            <button
              type="button"
              onClick={submitCompoffCredit}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Request Comp Off Credit
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Current Requests
            </h2>
            {loading && <span className="text-sm text-slate-500">Loading...</span>}
          </div>
          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <div
                key={request._id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {leaveTypeLabel(request.leaveType)} - {request.days} day(s)
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(request.fromDate)} to {formatDate(request.toDate)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {request.requestKind === "COMPOFF_CREDIT"
                        ? "Comp off credit request"
                        : request.reason}
                    </p>
                    {approvalRemark(request) && (
                      <p className="mt-2 text-sm text-slate-700">
                        {approvalRemark(request)}
                      </p>
                    )}
                    {request.attachment?.data && (
                      <a
                        href={attachmentHref(request.attachment)}
                        download={request.attachment.fileName || "leave-document"}
                        className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        View attachment
                      </a>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClass[request.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
            {!requests.length && !loading && (
              <p className="text-sm text-slate-500">No leave requests yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Leave History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Department</th>
                <th className="p-3">Type</th>
                <th className="p-3">Kind</th>
                <th className="p-3">Days</th>
                <th className="p-3">Status</th>
                <th className="p-3">Document</th>
                <th className="p-3">Admin/Director Remark</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{formatDate(request.fromDate)}</td>
                  <td className="p-3">{formatDate(request.toDate)}</td>
                  <td className="p-3">{request.department || "-"}</td>
                  <td className="p-3">{leaveTypeLabel(request.leaveType)}</td>
                  <td className="p-3">
                    {request.requestKind === "COMPOFF_CREDIT"
                      ? "COMP_OFF CREDIT"
                      : "LEAVE_USES"}
                  </td>
                  <td className="p-3">{request.days}</td>
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
                  <td className="max-w-[260px] p-3 text-slate-600">
                    {approvalRemark(request) || "-"}
                  </td>
                  <td className="p-3">
                    {request.status === "APPROVED" &&
                    request.requestKind === "LEAVE_USAGE" ? (
                      <button
                        type="button"
                        onClick={() => submitRollbackRequest(request)}
                        className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        Rollback
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {!requests.length && !loading && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan="10">
                    No leave history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;
