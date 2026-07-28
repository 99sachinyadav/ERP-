import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";


const leaveTypes = ["ALL", "EL", "CL", "ML", "OD", "WINTER_LEAVE", "SUMMER_LEAVE", "COMPOFF"];
const requestKinds = ["ALL", "LEAVE_USAGE", "COMPOFF_CREDIT"];
const statusOptions = [
  "ALL",
  "PENDING_HOD",
  "FORWARDED_TO_DIRECTOR",
  "APPROVED",
  "REJECTED_BY_HOD",
  "REJECTED_BY_DIRECTOR",
  "CANCELLED",
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
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

const attachmentHref = (attachment) => {
  if (!attachment?.data || !attachment?.mimeType) return "";
  return `data:${attachment.mimeType};base64,${attachment.data}`;
};

const leaveBalanceRows = (balance) => [
  ["EL", balance.elTotal, balance.elUsed, balance.elTotal - balance.elUsed],
  ["CL", balance.clTotal, balance.clUsed, balance.clTotal - balance.clUsed],
  ["ML", balance.mlTotal, balance.mlUsed, balance.mlTotal - balance.mlUsed],
  ["OD", (balance.odTotal || 15), balance.odUsed, (balance.odTotal || 15) - balance.odUsed],
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
  ["COMPOFF", balance.compoffTotal, balance.compoffUsed, balance.compoffTotal - balance.compoffUsed],
];

const HODLeavePanel = ({ onBack }) => {
  const department = localStorage.getItem("teacherdepartment");
  const teacherId = localStorage.getItem("teacherId");
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState({});
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "PENDING_HOD",
    department: department,
    leaveType: "ALL",
    requestKind: "ALL",
    search: "",
  });

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/leaves/records`, {
        params: { ...filters, department },
        headers: { teachertoken: localStorage.getItem("teacherToken") }
      });
      if (res.data.success) {
        setRequests(res.data.leaveRequests || []);
      }
    } catch (error) {
      toast.error("Unable to load department leave data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, [filters]);

  const totals = useMemo(() => ({
    matching: requests.length,
    pending: requests.filter(r => r.status === "PENDING_HOD").length,
    forwarded: requests.filter(r => r.status === "FORWARDED_TO_DIRECTOR").length,
    approved: requests.filter(r => r.status === "APPROVED").length,
  }), [requests]);

  const updateFilter = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const updateRemark = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = async (id, action) => {
    try {
      const endpoint = action === "forward" ? "forward" : "reject";
      const res = await axios.put(`${backendUrl}/api/leaves/hod/${id}/${endpoint}`, 
        { remark: remarks[id] || "", teacherId },
        { headers: { teachertoken: localStorage.getItem("teacherToken") } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        loadLeaveData();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const openTeacherDetails = async (request) => {
    const tId = request.teacher?._id || request.teacher;
    try {
      setDetailsLoading(true);
      const res = await axios.get(`${backendUrl}/api/leaves/teacher/${tId}`, {
        headers: { teachertoken: localStorage.getItem("teacherToken") }
      });
      setTeacherDetails({
        teacher: request.teacher,
        leaveRequests: res.data.leaveRequests || [],
        leaveBalances: res.data.leaveBalances || [],
      });
    } catch (error) {
      toast.error("Unable to load teacher details");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 h-screen overflow-y-auto">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Department Leave Management</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{department} Department</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/teacherdashboard")} className="w-full sm:w-auto">Back to Dashboard</Button>
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >Refresh</Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="p-5 shadow-sm border-blue-100 bg-white">
          <p className="text-sm text-slate-500">Matching Records</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{totals.matching}</h2>
        </Card>
        <Card className="p-5 shadow-sm border-purple-100 bg-white">
          <p className="text-sm text-slate-500">Pending Dept Action</p>
          <h2 className="mt-2 text-3xl font-bold text-purple-600">{totals.pending}</h2>
        </Card>
        <Card className="p-5 shadow-sm border-blue-100 bg-white">
          <p className="text-sm text-slate-500">Forwarded to Director</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">{totals.forwarded}</h2>
        </Card>
        <Card className="p-5 shadow-sm border-emerald-100 bg-white">
          <p className="text-sm text-slate-500">Final Approved</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-600">{totals.approved}</h2>
        </Card>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Leave Records</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select
              value={filters.leaveType}
              onChange={(e) => updateFilter("leaveType", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select
              value={filters.requestKind}
              onChange={(e) => updateFilter("requestKind", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {requestKinds.map(kind => (
                <option key={kind} value={kind}>
                  {kind === "ALL" ? "All Kinds" : kind === "COMPOFF_CREDIT" ? "COMP_OFF CREDIT" : "LEAVE_USES"}
                </option>
              ))}
            </select>
            <Input
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search teacher"
              className="px-3 py-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="p-3">Teacher</th>
                <th className="p-3">Type</th>
                <th className="p-3">Kind</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Document</th>
                <th className="p-3">Status</th>
                <th className="p-3">Remarks</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">
                    {request.teacher?.name||request.staff?.name}
                    <p className="text-xs font-normal text-slate-500">{request.teacher?.email||request.staff?.email}</p>
                  </td>
                  <td className="p-3">{request.leaveType}</td>
                  <td className="p-3">
                    {request.requestKind === "COMPOFF_CREDIT" ? "COMP_OFF CREDIT" : "LEAVE_USES"}
                  </td>
                  <td className="p-3">
                    {formatDate(request.fromDate)} - {formatDate(request.toDate)}
                    <p className="text-xs text-slate-500">{request.days} day(s)</p>
                  </td>
                  <td className="p-3 max-w-[200px] text-slate-600">{request.reason}</td>
                  <td className="p-3">
                    {request.attachment?.data ? (
                      <a href={attachmentHref(request.attachment)} download={request.attachment.fileName} className="font-semibold text-blue-700">View</a>
                    ) : "-"}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[request.status] || "bg-slate-100"}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {request.status === "PENDING_HOD" ? (
                      <Input
                        value={remarks[request._id] || ""}
                        onChange={(e) => updateRemark(request._id, e.target.value)}
                        placeholder="HOD remark"
                        className="w-40"
                      />
                    ) : (
                      request.hodApproval?.remark || "-"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openTeacherDetails(request)}>View</Button>
                        {request.status === "PENDING_HOD" && (
                          <>
                            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold" onClick={() => handleAction(request._id, "forward")}>Forward</Button>
                            <Button variant="destructive" size="sm" className="font-semibold" onClick={() => handleAction(request._id, "reject")}>Reject</Button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {!requests.length && !loading && (
                <tr><td colSpan="8" className="p-10 text-center text-slate-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(teacherDetails || detailsLoading) && (
        <Card className="mt-6 p-5 border border-slate-200 bg-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Teacher Leave Details</h2>
              <p className="text-sm text-slate-500">{teacherDetails?.teacher?.name} ({teacherDetails?.teacher?.email})</p>
            </div>
            <Button variant="ghost" onClick={() => setTeacherDetails(null)}>Close</Button>
          </div>

          {detailsLoading ? <p>Loading details...</p> : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-slate-900 underline">Leave Balances</h3>
                <div className="space-y-4">
                  {teacherDetails.leaveBalances.map(bal => (
                    <div key={bal._id} className="border p-3 rounded-lg bg-slate-50">
                      <p className="font-bold">{bal.semester} - {bal.academicYear}</p>
                      <table className="w-full text-sm mt-2">
                        <thead>
                          <tr className="text-left text-slate-500 border-b">
                            <th>Type</th><th>Total</th><th>Used</th><th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveBalanceRows(bal).map(([type, total, used, rem]) => (
                            <tr key={type} className="border-b last:border-0 hover:bg-white">
                              <td>{type}</td><td>{total}</td><td>{used}</td><td>{rem}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-slate-900 underline">Leave Requests History</h3>
                <div className="max-h-[500px] overflow-y-auto space-y-3">
                  {teacherDetails.leaveRequests.map(req => (
                    <div key={req._id} className="border p-3 rounded-lg">
                      <div className="flex justify-between">
                        <p className="font-bold">{req.leaveType} - {req.days} days</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass[req.status] || "bg-slate-100"}`}>{req.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(req.fromDate)} to {formatDate(req.toDate)}</p>
                      <p className="text-sm mt-1">Reason: {req.reason}</p>
                      {req.hodApproval?.remark && <p className="text-xs text-purple-600 mt-1">HOD: {req.hodApproval.remark}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default HODLeavePanel;
