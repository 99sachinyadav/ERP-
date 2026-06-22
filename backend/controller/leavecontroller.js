import { LeaveBalance } from "../model/leavebalancemodel.js";
import { LeaveRequest } from "../model/leaverequestmodel.js";
import { Semester } from "../model/semestermodel.js";
import { Teacher } from "../model/teachermodel.js";

const DEPARTMENTS = ["AIML", "EN", "CSE", "APPLIED", "ADMINISTRATOR", "STAFF"];
const LEAVE_TYPES = ["EL", "CL", "ML", "OD", "COMPOFF"];
const HALF_DAY_MINIMUM_TYPES = ["EL", "COMPOFF"];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

const teacherIdFromRequest = (req) => req.body.teacherId || req.body.teacher;

const getCurrentSemester = async () => {
  const semester = await Semester.findOne({ isCurrent: true, status: "ACTIVE" });
  if (!semester) throw new Error("No active semester found");
  return semester;
};

const getDays = (fromDate, toDate, days) => {
  if (days) return Number(days);

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.floor((end - start) / millisecondsPerDay) + 1;
};

const validateLeaveInput = ({ department, leaveType, fromDate, toDate, days, reason }) => {
  if (!department || !leaveType || !fromDate || !toDate || !reason) {
    return "Please fill all required fields";
  }

  if (!DEPARTMENTS.includes(department)) {
    return "Invalid department";
  }

  if (!LEAVE_TYPES.includes(leaveType)) {
    return "Invalid leave type";
  }

  if (new Date(fromDate) > new Date(toDate)) {
    return "fromDate cannot be after toDate";
  }

  if (!days || days <= 0) {
    return "Leave days must be greater than zero";
  }

  if (HALF_DAY_MINIMUM_TYPES.includes(leaveType) && Number(days) < 0.5) {
    return `${leaveType} leave cannot be less than half day`;
  }

  return "";
};

const normalizeAttachment = (attachment) => {
  if (!attachment) return { attachment: null, error: "" };

  const fileName = String(attachment.fileName || "").trim();
  const mimeType = String(attachment.mimeType || "").trim();
  const rawData = String(attachment.data || "");
  const data = rawData.includes(",") ? rawData.split(",").pop() : rawData;
  const size = Number(attachment.size || 0);

  if (!fileName || !mimeType || !data) {
    return { attachment: null, error: "Attachment details are incomplete" };
  }

  const byteLength = Buffer.byteLength(data, "base64");
  const effectiveSize = size || byteLength;

  if (effectiveSize > MAX_ATTACHMENT_BYTES || byteLength > MAX_ATTACHMENT_BYTES) {
    return { attachment: null, error: "Attachment size cannot be more than 2 MB" };
  }

  return {
    attachment: {
      fileName,
      mimeType,
      size: effectiveSize,
      data,
    },
    error: "",
  };
};

const getBalance = async (teacher, department, semester) => {
  let balance = await LeaveBalance.findOne({
    teacher,
    semester: semester.name,
    academicYear: semester.academicYear,
  });

  if (!balance) {
    balance = await LeaveBalance.create({
      teacher,
      department,
      semester: semester.name,
      academicYear: semester.academicYear,
    });
  }

  return balance;
};

const availableLeave = (balance, leaveType) => {
  const leaveMap = {
    EL: balance.elTotal - balance.elUsed,
    CL: balance.clTotal - balance.clUsed,
    ML: balance.mlTotal - balance.mlUsed,
    COMPOFF: balance.compoffTotal - balance.compoffUsed,
    OD: Number.POSITIVE_INFINITY,
  };

  return leaveMap[leaveType];
};

const useLeaveBalance = (balance, leaveType, days) => {
  if (leaveType === "EL") balance.elUsed += days;
  if (leaveType === "CL") balance.clUsed += days;
  if (leaveType === "ML") balance.mlUsed += days;
  if (leaveType === "OD") balance.odUsed += days;
  if (leaveType === "COMPOFF") balance.compoffUsed += days;
};

const balanceIncrement = (leaveRequest) => {
  if (leaveRequest.requestKind === "COMPOFF_CREDIT") {
    return { compoffTotal: leaveRequest.days };
  }

  const incrementMap = {
    EL: { elUsed: leaveRequest.days },
    CL: { clUsed: leaveRequest.days },
    ML: { mlUsed: leaveRequest.days },
    OD: { odUsed: leaveRequest.days },
    COMPOFF: { compoffUsed: leaveRequest.days },
  };

  return incrementMap[leaveRequest.leaveType] || {};
};

const createSemester = async (req, res) => {
  try {
    const { name, academicYear, startDate, endDate, isCurrent = false } = req.body;

    if (!name || !academicYear || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields" });
    }

    if (isCurrent) {
      await Semester.updateMany({}, { isCurrent: false });
    }

    const semester = await Semester.create({
      name,
      academicYear,
      startDate,
      endDate,
      isCurrent,
    });

    return res.status(201).json({
      success: true,
      message: "Semester created successfully",
      semester,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find({}).sort({
      academicYear: -1,
      createdAt: -1,
    });

    return res.status(200).json({ success: true, semesters });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const applyLeave = async (req, res) => {
  try {
    const teacher = teacherIdFromRequest(req);
    const { department, leaveType, fromDate, toDate, reason } = req.body;
    const days = getDays(fromDate, toDate, req.body.days);
    const { attachment, error: attachmentError } = normalizeAttachment(
      req.body.attachment
    );

    const error = validateLeaveInput({
      department,
      leaveType,
      fromDate,
      toDate,
      days,
      reason,
    });

    if (error) return res.status(400).json({ success: false, message: error });
    if (attachmentError) {
      return res.status(400).json({ success: false, message: attachmentError });
    }

    const teacherExists = await Teacher.findById(teacher).select("_id");
    if (!teacherExists) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const semester = await getCurrentSemester();
    const balance = await getBalance(teacher, department, semester);

    if (availableLeave(balance, leaveType) < days) {
      return res
        .status(400)
        .json({ success: false, message: `${leaveType} balance is not enough` });
    }

    const leaveRequest = await LeaveRequest.create({
      teacher,
      department,
      leaveType,
      requestKind: "LEAVE_USAGE",
      fromDate,
      toDate,
      days,
      reason,
      attachment,
      semester: semester.name,
      academicYear: semester.academicYear,
    });

    return res.status(201).json({
      success: true,
      message: "Leave request sent to admin",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const applyCompoffCredit = async (req, res) => {
  try {
    const teacher = teacherIdFromRequest(req);
    const { department, fromDate, toDate, reason } = req.body;
    const days = getDays(fromDate, toDate, req.body.days);
    const { attachment, error: attachmentError } = normalizeAttachment(
      req.body.attachment
    );

    const error = validateLeaveInput({
      department,
      leaveType: "COMPOFF",
      fromDate,
      toDate,
      days,
      reason,
    });

    if (error) return res.status(400).json({ success: false, message: error });
    if (attachmentError) {
      return res.status(400).json({ success: false, message: attachmentError });
    }

    const teacherExists = await Teacher.findById(teacher).select("_id");
    if (!teacherExists) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const semester = await getCurrentSemester();

    const leaveRequest = await LeaveRequest.create({
      teacher,
      department,
      leaveType: "COMPOFF",
      requestKind: "COMPOFF_CREDIT",
      fromDate,
      toDate,
      days,
      reason,
      attachment,
      semester: semester.name,
      academicYear: semester.academicYear,
    });

    return res.status(201).json({
      success: true,
      message: "Comp off credit request sent to admin",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      teacher: teacherIdFromRequest(req),
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyLeaveBalance = async (req, res) => {
  try {
    const currentSemester = await Semester.findOne({
      isCurrent: true,
      status: "ACTIVE",
    });
    const leaveBalances = await LeaveBalance.find({
      teacher: teacherIdFromRequest(req),
    }).sort({ academicYear: -1, semester: -1 });
    const currentBalance = currentSemester
      ? leaveBalances.find(
          (balance) =>
            balance.semester === currentSemester.name &&
            balance.academicYear === currentSemester.academicYear
        )
      : null;

    return res.status(200).json({
      success: true,
      currentSemester,
      currentBalance,
      leaveBalances,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminPendingLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ status: "PENDING_ADMIN" })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const forwardLeaveToDirector = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    if (leaveRequest.status !== "PENDING_ADMIN") {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for admin" });
    }

    leaveRequest.status = "FORWARDED_TO_DIRECTOR";
    leaveRequest.adminApproval = {
      status: "APPROVED",
      remark: req.body.remark || "",
      actionBy: req.body.adminID || "",
      actionAt: new Date(),
    };

    await leaveRequest.save();

    return res.status(200).json({
      success: true,
      message: "Leave forwarded to director",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectLeaveByAdmin = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    if (leaveRequest.status !== "PENDING_ADMIN") {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for admin" });
    }

    leaveRequest.status = "REJECTED_BY_ADMIN";
    leaveRequest.adminApproval = {
      status: "REJECTED",
      remark: req.body.remark || "",
      actionBy: req.body.adminID || "",
      actionAt: new Date(),
    };

    await leaveRequest.save();

    return res.status(200).json({
      success: true,
      message: "Leave rejected by admin",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDirectorPendingLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      status: "FORWARDED_TO_DIRECTOR",
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getLeaveRecords = async (req, res) => {
  try {
    const { status, department, leaveType, requestKind, search } = req.query;
    const filters = {};

    if (status && status !== "ALL") filters.status = status;
    if (department && department !== "ALL") filters.department = department;
    if (leaveType && leaveType !== "ALL") filters.leaveType = leaveType;
    if (requestKind && requestKind !== "ALL") filters.requestKind = requestKind;

    const leaveRequests = await LeaveRequest.find(filters)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    const normalizedSearch = search?.trim().toLowerCase();
    const filteredRequests = normalizedSearch
      ? leaveRequests.filter((request) => {
          const teacherName = request.teacher?.name?.toLowerCase() || "";
          const teacherEmail = request.teacher?.email?.toLowerCase() || "";
          return (
            teacherName.includes(normalizedSearch) ||
            teacherEmail.includes(normalizedSearch)
          );
        })
      : leaveRequests;

    return res.status(200).json({
      success: true,
      leaveRequests: filteredRequests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const approveLeaveByDirector = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    if (leaveRequest.status !== "FORWARDED_TO_DIRECTOR") {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for director" });
    }

    const balance = await getBalance(leaveRequest.teacher, leaveRequest.department, {
      name: leaveRequest.semester,
      academicYear: leaveRequest.academicYear,
    });

    if (
      leaveRequest.requestKind === "LEAVE_USAGE" &&
      availableLeave(balance, leaveRequest.leaveType) < leaveRequest.days
    ) {
      return res.status(400).json({
        success: false,
        message: `${leaveRequest.leaveType} balance is not enough`,
      });
    }

    leaveRequest.status = "APPROVED";
    leaveRequest.directorApproval = {
      status: "APPROVED",
      remark: req.body.remark || "",
      actionBy: req.body.adminID || "",
      actionAt: new Date(),
    };

    const [updatedBalance] = await Promise.all([
      LeaveBalance.findByIdAndUpdate(
        balance._id,
        { $inc: balanceIncrement(leaveRequest) },
        { new: true }
      ),
      leaveRequest.save(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Leave approved by director",
      leaveRequest,
      balance: updatedBalance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectLeaveByDirector = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    if (leaveRequest.status !== "FORWARDED_TO_DIRECTOR") {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for director" });
    }

    leaveRequest.status = "REJECTED_BY_DIRECTOR";
    leaveRequest.directorApproval = {
      status: "REJECTED",
      remark: req.body.remark || "",
      actionBy: req.body.adminID || "",
      actionAt: new Date(),
    };

    await leaveRequest.save();

    return res.status(200).json({
      success: true,
      message: "Leave rejected by director",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const closeSemesterAndCarryForwardEl = async (req, res) => {
  try {
    const { completedSemesterId, nextSemesterId } = req.body;

    if (!completedSemesterId || !nextSemesterId) {
      return res.status(400).json({
        success: false,
        message: "completedSemesterId and nextSemesterId are required",
      });
    }

    const completedSemester = await Semester.findById(completedSemesterId);
    const nextSemester = await Semester.findById(nextSemesterId);

    if (!completedSemester || !nextSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Semester not found" });
    }

    if (completedSemester._id.equals(nextSemester._id)) {
      return res.status(400).json({
        success: false,
        message: "Completed semester and next semester cannot be same",
      });
    }

    const oldBalances = await LeaveBalance.find({
      semester: completedSemester.name,
      academicYear: completedSemester.academicYear,
    });

    let teachersUpdated = 0;
    const carriedForward = [];

    for (const oldBalance of oldBalances) {
      const remainingEl = Math.max(oldBalance.elTotal - oldBalance.elUsed, 0);

      const nextBalance = await LeaveBalance.findOne({
        teacher: oldBalance.teacher,
        semester: nextSemester.name,
        academicYear: nextSemester.academicYear,
      });

      if (nextBalance) {
        nextBalance.department = oldBalance.department;
        nextBalance.elTotal = 6 + remainingEl;
        nextBalance.clTotal = 6;
        nextBalance.mlTotal = 5;
        nextBalance.compoffTotal = 0;
        nextBalance.compoffUsed = 0;
        await nextBalance.save();
      } else {
        await LeaveBalance.create({
          teacher: oldBalance.teacher,
          department: oldBalance.department,
          semester: nextSemester.name,
          academicYear: nextSemester.academicYear,
          elTotal: 6 + remainingEl,
          elUsed: 0,
          clTotal: 6,
          clUsed: 0,
          mlTotal: 5,
          mlUsed: 0,
          odUsed: 0,
          compoffTotal: 0,
          compoffUsed: 0,
        });
      }

      teachersUpdated += 1;
      carriedForward.push({
        teacher: oldBalance.teacher,
        department: oldBalance.department,
        el: remainingEl,
        compoff: 0,
      });
    }

    completedSemester.status = "COMPLETED";
    completedSemester.isCurrent = false;
    nextSemester.status = "ACTIVE";
    nextSemester.isCurrent = true;

    await Semester.updateMany(
      { _id: { $nin: [completedSemester._id, nextSemester._id] } },
      { isCurrent: false }
    );
    await completedSemester.save();
    await nextSemester.save();

    return res.status(200).json({
      success: true,
      message: "Semester completed and EL carried forward",
      teachersUpdated,
      carriedForward,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartmentLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      department: req.params.department,
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTeacherLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      teacher: req.params.teacherId,
    }).sort({ createdAt: -1 });

    const leaveBalances = await LeaveBalance.find({
      teacher: req.params.teacherId,
    }).sort({ academicYear: -1, semester: -1 });

    return res.status(200).json({ success: true, leaveRequests, leaveBalances });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getLeaveSummary = async (req, res) => {
  try {
    const summary = await LeaveRequest.aggregate([
      {
        $group: {
          _id: {
            department: "$department",
            leaveType: "$leaveType",
            status: "$status",
          },
          requests: { $sum: 1 },
          days: { $sum: "$days" },
        },
      },
      { $sort: { "_id.department": 1, "_id.leaveType": 1 } },
    ]);

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createSemester,
  getSemesters,
  applyLeave,
  applyCompoffCredit,
  getMyLeaveRequests,
  getMyLeaveBalance,
  getAdminPendingLeaves,
  forwardLeaveToDirector,
  rejectLeaveByAdmin,
  getDirectorPendingLeaves,
  getLeaveRecords,
  approveLeaveByDirector,
  rejectLeaveByDirector,
  closeSemesterAndCarryForwardEl,
  getDepartmentLeaves,
  getTeacherLeaves,
  getLeaveSummary,
};
