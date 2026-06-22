import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const adminHeaders = (tokenKey = "adminToken") => ({
  headers: {
    admintoken: localStorage.getItem(tokenKey),
  },
});

const teacherHeaders = () => ({
  headers: {
    teachertoken: localStorage.getItem("teacherToken"),
  },
});

export const getAdminPendingLeaves = () =>
  axios.get(`${API_URL}/leaves/admin/pending`, adminHeaders());

export const createLeaveSemester = (data) =>
  axios.post(`${API_URL}/leaves/admin/semester`, data, adminHeaders());

export const getLeaveSemesters = () =>
  axios.get(`${API_URL}/leaves/admin/semesters`, adminHeaders());

export const forwardLeaveToDirector = (id, remark) =>
  axios.put(`${API_URL}/leaves/admin/${id}/forward`, { remark }, adminHeaders());

export const rejectLeaveByAdmin = (id, remark) =>
  axios.put(`${API_URL}/leaves/admin/${id}/reject`, { remark }, adminHeaders());

export const closeLeaveSemester = (data) =>
  axios.post(`${API_URL}/leaves/admin/close-semester`, data, adminHeaders());

export const getLeaveSummary = (tokenKey = "adminToken") =>
  axios.get(`${API_URL}/leaves/summary`, adminHeaders(tokenKey));

export const getLeaveRecords = (filters = {}, tokenKey = "adminToken") =>
  axios.get(`${API_URL}/leaves/records`, {
    ...adminHeaders(tokenKey),
    params: filters,
  });

export const getTeacherLeaveDetails = (teacherId, tokenKey = "adminToken") =>
  axios.get(`${API_URL}/leaves/teacher/${teacherId}`, adminHeaders(tokenKey));

export const getDirectorPendingLeaves = () =>
  axios.get(`${API_URL}/leaves/director/pending`, adminHeaders("directorToken"));

export const approveLeaveByDirector = (id, remark) =>
  axios.put(
    `${API_URL}/leaves/director/${id}/approve`,
    { remark },
    adminHeaders("directorToken")
  );

export const rejectLeaveByDirector = (id, remark) =>
  axios.put(
    `${API_URL}/leaves/director/${id}/reject`,
    { remark },
    adminHeaders("directorToken")
  );

export const applyTeacherLeave = (data) =>
  axios.post(`${API_URL}/leaves/apply`, data, teacherHeaders());

export const applyCompoffCredit = (data) =>
  axios.post(`${API_URL}/leaves/apply-compoff-credit`, data, teacherHeaders());

export const getMyLeaveRequests = () =>
  axios.get(`${API_URL}/leaves/my-requests`, teacherHeaders());

export const getMyLeaveBalance = () =>
  axios.get(`${API_URL}/leaves/my-balance`, teacherHeaders());
