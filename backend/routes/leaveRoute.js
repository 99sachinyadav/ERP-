import express from "express";
import {
  applyCompoffCredit,
  applyLeave,
  approveLeaveByDirector,
  closeSemesterAndCarryForwardEl,
  createSemester,
  forwardLeaveToDirector,
  getAdminPendingLeaves,
  getDepartmentLeaves,
  getDirectorPendingLeaves,
  getLeaveRecords,
  getLeaveSummary,
  getMyLeaveBalance,
  getMyLeaveRequests,
  getSemesters,
  getTeacherLeaves,
  rejectLeaveByAdmin,
  rejectLeaveByDirector,
} from "../controller/leavecontroller.js";
import { authRole } from "../middelware/roleAuth.js";
import authTeacher from "../middelware/teacherAuth.js";

const leaveRouter = express.Router();

leaveRouter.post("/leaves/apply", authTeacher, applyLeave);
leaveRouter.post("/leaves/apply-compoff-credit", authTeacher, applyCompoffCredit);
leaveRouter.get("/leaves/my-requests", authTeacher, getMyLeaveRequests);
leaveRouter.get("/leaves/my-balance", authTeacher, getMyLeaveBalance);

leaveRouter.get("/leaves/admin/pending", authRole("ADMIN"), getAdminPendingLeaves);
leaveRouter.post("/leaves/admin/semester", authRole("ADMIN"), createSemester);
leaveRouter.get("/leaves/admin/semesters", authRole("ADMIN"), getSemesters);
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
  authRole("ADMIN", "DIRECTOR"),
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

leaveRouter.get(
  "/leaves/department/:department",
  authRole("ADMIN", "DIRECTOR"),
  getDepartmentLeaves
);
leaveRouter.get(
  "/leaves/teacher/:teacherId",
  authRole("ADMIN", "DIRECTOR"),
  getTeacherLeaves
);
leaveRouter.get("/leaves/summary", authRole("ADMIN", "DIRECTOR"), getLeaveSummary);

export { leaveRouter };
