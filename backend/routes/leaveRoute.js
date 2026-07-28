import express from "express";
import {
  applyCompoffCredit,
  applyLeave,
  applyStaffLeave,
  applyStaffCompoffCredit,
  assignLeavesToAllStaff,
  assignLeavesToAllTeachers,
  assignLeavesToStaffByEmail,
  assignLeavesToTeacherByEmail,
  approveLeaveByDirector,
  closeSemesterAndCarryForwardEl,
  createSemester,
  getAdminPendingLeaves,
  getHODPendingLeaves,
  getMyLeaveBalance,
  getMyLeaveRequests,
  getSemesters,
  getTeacherLeaves,
  getDepartmentLeaves,
  getDirectorPendingLeaves,
  getLeaveRecords,
  getLeaveSummary,
  forwardLeaveToDirector,
  forwardLeaveToDirectorByHOD,
  rejectLeaveByAdmin,
  rejectLeaveByHOD,
  rejectLeaveByDirector,
  requestLeaveRollback,
} from "../controller/leavecontroller.js";
import { authRole } from "../middelware/roleAuth.js";
import authTeacher from "../middelware/teacherAuth.js";

const leaveRouter = express.Router();

leaveRouter.post("/leaves/apply", authTeacher, applyLeave);
leaveRouter.post("/leaves/apply-staff", authTeacher, applyStaffLeave);
leaveRouter.post("/leaves/apply-compoff-credit", authTeacher, applyCompoffCredit);
leaveRouter.post("/leaves/apply-staff-compoff-credit", authTeacher, applyStaffCompoffCredit);
leaveRouter.get("/leaves/my-requests", authTeacher, getMyLeaveRequests);
leaveRouter.get("/leaves/my-balance", authTeacher, getMyLeaveBalance);
leaveRouter.put("/leaves/:id/rollback-request", authTeacher, requestLeaveRollback);

// HOD Routes
leaveRouter.get("/leaves/hod/pending", authTeacher, getHODPendingLeaves);
leaveRouter.put("/leaves/hod/:id/forward", authTeacher, forwardLeaveToDirectorByHOD);
leaveRouter.put("/leaves/hod/:id/reject", authTeacher, rejectLeaveByHOD);

leaveRouter.get("/leaves/admin/pending", authRole("ADMIN"), getAdminPendingLeaves);
leaveRouter.post("/leaves/admin/semester", authRole("ADMIN"), createSemester);
leaveRouter.get("/leaves/admin/semesters", authRole("ADMIN", "DIRECTOR"), getSemesters);
leaveRouter.put(
  "/leaves/admin/:id/forward",
  authRole("ADMIN"),
  forwardLeaveToDirector
);
leaveRouter.put("/leaves/admin/:id/reject", authRole("ADMIN"), rejectLeaveByAdmin);
leaveRouter.post(
  "/leaves/admin/close-semester",
  authRole("ADMIN"),
  closeSemesterAndCarryForwardEl
);

leaveRouter.get(
  "/leaves/director/pending",
  authRole("DIRECTOR"),
  getDirectorPendingLeaves
);

leaveRouter.get(
  "/leaves/records",
  authTeacher,
  getLeaveRecords
);
leaveRouter.put(
  "/leaves/director/:id/approve",
  authRole("DIRECTOR"),
  approveLeaveByDirector
);
leaveRouter.put(
  "/leaves/director/:id/reject",
  authRole("DIRECTOR"),
  rejectLeaveByDirector
);
leaveRouter.post(
  "/leaves/director/assign/teachers",
  authRole("DIRECTOR"),
  assignLeavesToAllTeachers
);
leaveRouter.post(
  "/leaves/director/assign/teacher/email",
  authRole("DIRECTOR"),
  assignLeavesToTeacherByEmail
);
leaveRouter.post(
  "/leaves/director/assign/staff",
  authRole("DIRECTOR"),
  assignLeavesToAllStaff
);
leaveRouter.post(
  "/leaves/director/assign/staff/email",
  authRole("DIRECTOR"),
  assignLeavesToStaffByEmail
);

leaveRouter.get(
  "/leaves/department/:department",
  authRole("ADMIN", "DIRECTOR"),
  getDepartmentLeaves
);
leaveRouter.get(
  "/leaves/teacher/:teacherId",
  authTeacher,
  getTeacherLeaves
);
leaveRouter.get("/leaves/summary", authRole("ADMIN", "DIRECTOR"), getLeaveSummary);

export { leaveRouter };
