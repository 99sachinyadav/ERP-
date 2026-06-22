import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import logo from "../assets/logo.jpg";
import {
  applyCompoffCredit,
  applyTeacherLeave,
  getMyLeaveBalance,
  getMyLeaveRequests,
} from "@/lib/leaveApi";

const departments = ["AIML", "EN", "CSE", "APPLIED", "ADMINISTRATOR", "STAFF"];
const leaveTypes = ["EL", "CL", "ML", "OD", "COMPOFF"];
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
  PENDING_ADMIN: "bg-amber-100 text-amber-700",
  FORWARDED_TO_DIRECTOR: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED_BY_ADMIN: "bg-red-100 text-red-700",
  REJECTED_BY_DIRECTOR: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

const balanceValue = (balance, type) => {
  if (!balance) return 0;
  if (type === "EL") return balance.elTotal - balance.elUsed;
  if (type === "CL") return balance.clTotal - balance.clUsed;
  if (type === "ML") return balance.mlTotal - balance.mlUsed;
  if (type === "COMPOFF") return balance.compoffTotal - balance.compoffUsed;
  return balance.odUsed;
};

const approvalRemark = (request) => {
  const remarks = [];
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

  const submitLeave = async (event) => {
    event.preventDefault();
    try {
      await applyTeacherLeave(form);
      toast.success("Leave request sent to admin");
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
      await applyCompoffCredit(payload);
      toast.success("Comp off credit request sent to admin");
      setForm(emptyForm);
      setFileInputKey((current) => current + 1);
      loadLeaveData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to apply comp off credit"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Leave Desk
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Welcome, {localStorage.getItem("teachername") || "Teacher"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Apply for EL, CL, ML, OD, comp off leave, or comp off credit.
            </p>
          </div>
          <img src={logo} alt="college" className="h-14 w-14 rounded-full object-cover" />
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-6">
        {["EL", "CL", "ML", "COMPOFF"].map((type) => (
          <div
            key={type}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{type} Balance</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-700">
              {balanceValue(currentBalance, type)}
            </h2>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-amber-600">
            {pendingCount}
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {approvedCount}
          </h2>
        </div>
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
                  {type}
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
                      {request.leaveType} - {request.days} day(s)
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
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Type</th>
                <th className="p-3">Kind</th>
                <th className="p-3">Days</th>
                <th className="p-3">Status</th>
                <th className="p-3">Document</th>
                <th className="p-3">Admin/Director Remark</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{formatDate(request.fromDate)}</td>
                  <td className="p-3">{formatDate(request.toDate)}</td>
                  <td className="p-3">{request.leaveType}</td>
                  <td className="p-3">
                    {request.requestKind === "COMPOFF_CREDIT"
                      ? "Comp off credit"
                      : "Leave usage"}
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
                </tr>
              ))}
              {!requests.length && !loading && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan="8">
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
