import { LeaveBalance } from "../model/leavebalancemodel.js";
import { LeaveRequest } from "../model/leaverequestmodel.js";
import { Semester } from "../model/semestermodel.js";
import { Teacher } from "../model/teachermodel.js";
import { Staff } from "../model/staffmodel.js";

const DEPARTMENTS = ["AIML/CSE/IT", "ECE/EN", "APPLIED/STAFF", "ADMINISTRATOR"];
const LEAVE_TYPES = [
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

// one doubt
const HALF_DAY_MINIMUM_TYPES = ["EL", "COMPOFF"];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

const teacherIdFromRequest = (req) => req.body.teacherId || req.body.teacher;
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// pass
const getCurrentSemester = async () => {
  const semester = await Semester.findOne({
    isCurrent: true,
    status: "ACTIVE",
  });
  if (!semester) throw new Error("No active semester found");
  return semester;
};
// pass
const getDays = (fromDate, toDate, days) => {
  if (days) return Number(days);

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.floor((end - start) / millisecondsPerDay) + 1;
};
// pass
const validateLeaveInput = ({
  department,
  leaveType,
  fromDate,
  toDate,
  days,
  reason,
}) => {
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

// pass
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

  if (
    effectiveSize > MAX_ATTACHMENT_BYTES ||
    byteLength > MAX_ATTACHMENT_BYTES
  ) {
    return {
      attachment: null,
      error: "Attachment size cannot be more than 2 MB",
    };
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

// pass it find the balace of teache/staff if balance not found it will create a new balance with default values and return it.
const getBalance = async (userId, department, semester, isStaff = false) => {
  const query = isStaff ? { staff: userId } : { teacher: userId };
  let balance = await LeaveBalance.findOne({
    ...query,
    semester: semester.name,
    academicYear: semester.academicYear,
  });
  //  find the leave balance for the respected teacher/staff based on id semester and year. If not found, create a new leave balance with default values for the respected teacher/staff and return it.
  if (!balance) {
    // const sampleQuery = isStaff ? { staff: { $exists: true } } : { teacher: { $exists: true } };
    // const existingSample = await LeaveBalance.findOne({
    //   ...sampleQuery,
    //   semester: semester.name,
    //   academicYear: semester.academicYear,
    // });

    const elTotal = 0;
    const clTotal = 0;
    const mlTotal = 0;
    const odTotal = 0;
    const winterLeaveTotal = 0;
    const summerLeaveTotal = 0;

    balance = await LeaveBalance.create({
      ...query,
      department,
      semester: semester.name,
      academicYear: semester.academicYear,
      elTotal,
      clTotal,
      mlTotal,
      odTotal,
      winterLeaveTotal,
      summerLeaveTotal,
    });
  }

  return balance;
};
// pass gives available leaves
const availableLeave = (balance, leaveType) => {
  const leaveMap = {
    EL: (balance.elTotal || 0) - (balance.elUsed || 0),
    CL: (balance.clTotal || 0) - (balance.clUsed || 0),
    ML: (balance.mlTotal || 0) - (balance.mlUsed || 0),
    COMPOFF: (balance.compoffTotal || 0) - (balance.compoffUsed || 0),
    OD: (balance.odTotal || 0) - (balance.odUsed || 0),
    WINTER_LEAVE:
      (balance.winterLeaveTotal || 0) - (balance.winterLeaveUsed || 0),
    SUMMER_LEAVE:
      (balance.summerLeaveTotal || 0) - (balance.summerLeaveUsed || 0),
    MATERNITY_LEAVE:
      (balance.maternityLeaveTotal || 0) - (balance.maternityLeaveUsed || 0),
    STUDY_LEAVE: (balance.studyLeaveTotal || 0) - (balance.studyLeaveUsed || 0),
    SPECIAL_DISABILITY_LEAVE:
      (balance.specialDisabilityLeaveTotal || 0) -
      (balance.specialDisabilityLeaveUsed || 0),
  };

  return leaveMap[leaveType];
};

// pass add requestedleaves in the used balance of the respected leave type. For example if the leave type is EL and the requested leaves are 2 then it will add 2 in the elUsed of the balance.
const useLeaveBalance = (balance, leaveType, days) => {
  if (leaveType === "EL") balance.elUsed += days;
  if (leaveType === "CL") balance.clUsed += days;
  if (leaveType === "ML") balance.mlUsed += days;
  if (leaveType === "OD") balance.odUsed += days;
  if (leaveType === "WINTER_LEAVE") balance.winterLeaveUsed += days;
  if (leaveType === "SUMMER_LEAVE") balance.summerLeaveUsed += days;
  if (leaveType === "COMPOFF") balance.compoffUsed += days;
  if (leaveType === "MATERNITY_LEAVE") balance.maternityLeaveUsed += days;
  if (leaveType === "STUDY_LEAVE") balance.studyLeaveUsed += days;
  if (leaveType === "SPECIAL_DISABILITY_LEAVE") {
    balance.specialDisabilityLeaveUsed += days;
  }
};

// pass credit back the leave balance when the leave is rejected or rolled back. This function ensures that the used leave count does not go below zero, maintaining data integrity.
const creditLeaveBalance = (balance, leaveType, days) => {
  if (leaveType === "EL")
    balance.elUsed = Math.max((balance.elUsed || 0) - days, 0);
  if (leaveType === "CL")
    balance.clUsed = Math.max((balance.clUsed || 0) - days, 0);
  if (leaveType === "ML")
    balance.mlUsed = Math.max((balance.mlUsed || 0) - days, 0);
  if (leaveType === "OD")
    balance.odUsed = Math.max((balance.odUsed || 0) - days, 0);
  if (leaveType === "WINTER_LEAVE") {
    balance.winterLeaveUsed = Math.max(
      (balance.winterLeaveUsed || 0) - days,
      0,
    );
  }
  if (leaveType === "SUMMER_LEAVE") {
    balance.summerLeaveUsed = Math.max(
      (balance.summerLeaveUsed || 0) - days,
      0,
    );
  }
  if (leaveType === "COMPOFF") {
    balance.compoffUsed = Math.max((balance.compoffUsed || 0) - days, 0);
  }
  if (leaveType === "MATERNITY_LEAVE") {
    balance.maternityLeaveUsed = Math.max(
      (balance.maternityLeaveUsed || 0) - days,
      0,
    );
  }
  if (leaveType === "STUDY_LEAVE") {
    balance.studyLeaveUsed = Math.max((balance.studyLeaveUsed || 0) - days, 0);
  }
  if (leaveType === "SPECIAL_DISABILITY_LEAVE") {
    balance.specialDisabilityLeaveUsed = Math.max(
      (balance.specialDisabilityLeaveUsed || 0) - days,
      0,
    );
  }
};

// pass This function is used to increment the leave balance when a comp off credit request is approved. It checks the type of leave request and returns an object with the appropriate field to increment. For example, if the request is for a comp off credit, it will return an object with the `compoffTotal` field set to the number of days in the request. For other types of leave, it will return an object with the corresponding used leave field incremented by the number of days in the request. If the leave type is not recognized, it returns an empty object.
const balanceIncrement = (leaveRequest) => {
  if (leaveRequest.requestKind === "COMPOFF_CREDIT") {
    return { compoffTotal: leaveRequest.days };
  }

  const incrementMap = {
    EL: { elUsed: leaveRequest.days },
    CL: { clUsed: leaveRequest.days },
    ML: { mlUsed: leaveRequest.days },
    OD: { odUsed: leaveRequest.days },
    WINTER_LEAVE: { winterLeaveUsed: leaveRequest.days },
    SUMMER_LEAVE: { summerLeaveUsed: leaveRequest.days },
    COMPOFF: { compoffUsed: leaveRequest.days },
    MATERNITY_LEAVE: { maternityLeaveUsed: leaveRequest.days },
    STUDY_LEAVE: { studyLeaveUsed: leaveRequest.days },
    SPECIAL_DISABILITY_LEAVE: { specialDisabilityLeaveUsed: leaveRequest.days },
  };

  return incrementMap[leaveRequest.leaveType] || {};
};

// pass function to create a new semester Pass for now
const createSemester = async (req, res) => {
  try {
    const {
      name,
      academicYear,
      startDate,
      endDate,
      isCurrent = false,
    } = req.body;

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

// pass
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

// pass function to apply for leave
const applyLeave = async (req, res) => {
  try {
    const teacher = teacherIdFromRequest(req);
    const { department, leaveType, fromDate, toDate, reason } = req.body;
    const days = getDays(fromDate, toDate, req.body.days);
    const { attachment, error: attachmentError } = normalizeAttachment(
      req.body.attachment,
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

    //   find if the teacher exists in the teacher
    let userExists = await Teacher.findById(teacher).select("_id");
    let isStaff = false;
    if (!userExists) {
      userExists = await Staff.findById(teacher).select("_id");
      // if (!userExists) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
      // }
      // isStaff = true;
    }

    const semester = await getCurrentSemester();
    const balance = await getBalance(teacher, department, semester, isStaff);

    if (availableLeave(balance, leaveType) < days) {
      return res
        .status(400)
        .json({
          success: false,
          message: `${leaveType} balance is not enough`,
        });
    }

    if (department !== "ADMINISTRATOR") {
      // Check if the teacher's department has an HOD
      const departmentHOD = await Teacher.findOne({
        department: department,
        role: "HOD",
      }).select("_id");

      if (!departmentHOD) {
        return res.status(400).json({
          success: false,
          message: "hod not allocated",
        });
      }
    }
    // console.log(department==="ADMINISTRATOR")
    const leaveRequest = await LeaveRequest.create({
      teacher: teacher,
      // staff: isStaff ? teacher : undefined,
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
      status:
        department === "ADMINISTRATOR"
          ? "FORWARDED_TO_DIRECTOR"
          : "PENDING_HOD",
    });
    // Leave request sent to HOD
    return res.status(201).json({
      success: true,
      message:
        department === "ADMINISTRATOR"
          ? "Leave request sent to Director"
          : "Leave request sent to HOD",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const applyCompoffCredit = async (req, res) => {
  try {
    const teacher = teacherIdFromRequest(req);
    const { department, fromDate, toDate, reason } = req.body;
    const days = getDays(fromDate, toDate, req.body.days);
    const { attachment, error: attachmentError } = normalizeAttachment(
      req.body.attachment,
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

    let userExists = await Teacher.findById(teacher).select("_id");
    let isStaff = false;
    if (!userExists) {
      userExists = await Staff.findById(teacher).select("_id");
      if (!userExists) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      isStaff = true;
    }

    const semester = await getCurrentSemester();

    if (department !== "ADMINISTRATOR") {
      // Check if the teacher's department has an HOD
      const departmentHOD = await Teacher.findOne({
        department: department,
        role: "HOD",
      }).select("_id");

      if (!departmentHOD) {
        return res.status(400).json({
          success: false,
          message: "hod not allocated",
        });
      }
    }

    const leaveRequest = await LeaveRequest.create({
      teacher: isStaff ? undefined : teacher,
      staff: isStaff ? teacher : undefined,
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
      status:
        department === "ADMINISTRATOR"
          ? "FORWARDED_TO_DIRECTOR"
          : "PENDING_HOD",
    });

    return res.status(201).json({
      success: true,
      message:
        department === "ADMINISTRATOR"
          ? "Comp off credit request sent to Director"
          : "Comp off credit request sent to HOD",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const applyStaffLeave = async (req, res) => {
  try {
    const staffId = teacherIdFromRequest(req);
    const { leaveType, fromDate, toDate, reason, department } = req.body;
    const days = getDays(fromDate, toDate, req.body.days);
    const { attachment, error: attachmentError } = normalizeAttachment(
      req.body.attachment,
    );

    const error = validateLeaveInput({
      department: department,
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

    const staffExists = await Staff.findById(staffId).select("_id");
    if (!staffExists) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    const semester = await getCurrentSemester();
    const balance = await getBalance(staffId, "STAFF", semester, true);

    if (availableLeave(balance, leaveType) < days) {
      return res
        .status(400)
        .json({
          success: false,
          message: `${leaveType} balance is not enough`,
        });
    }

    if (department !== "ADMINISTRATOR") {
      // Check if the teacher's department has an HOD
      const departmentHOD = await Teacher.findOne({
        department: department,
        role: "HOD",
      }).select("_id");

      if (!departmentHOD) {
        return res.status(400).json({
          success: false,
          message: "hod not allocated",
        });
      }
    }

    const leaveRequest = await LeaveRequest.create({
      staff: staffId,
      department: department,
      leaveType,
      requestKind: "LEAVE_USAGE",
      fromDate,
      toDate,
      days,
      reason,
      attachment,
      semester: semester.name,
      academicYear: semester.academicYear,
      status:
        department === "ADMINISTRATOR"
          ? "FORWARDED_TO_DIRECTOR"
          : "PENDING_HOD",
    });

    return res.status(201).json({
      success: true,
      message: department === "ADMINISTRATOR"
          ? "Leave request sent to Director"
          : "Leave request sent to HOD",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const applyStaffCompoffCredit = async (req, res) => {
  try {
    const staffId = teacherIdFromRequest(req);
    const { fromDate, toDate, reason, department } = req.body;
    const days = getDays(fromDate, toDate, req.body.days);
    const { attachment, error: attachmentError } = normalizeAttachment(
      req.body.attachment,
    );

    const error = validateLeaveInput({
      department: department,
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

    const staffExists = await Staff.findById(staffId).select("_id");
    if (!staffExists) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    const semester = await getCurrentSemester();

    const leaveRequest = await LeaveRequest.create({
      staff: staffId,
      department: department,
      leaveType: "COMPOFF",
      requestKind: "COMPOFF_CREDIT",
      fromDate,
      toDate,
      days,
      reason,
      attachment,
      semester: semester.name,
      academicYear: semester.academicYear,
      status:
        department === "ADMINISTRATOR"
          ? "FORWARDED_TO_DIRECTOR"
          : "PENDING_HOD",
    });

    return res.status(201).json({
      success: true,
      message: department === "ADMINISTRATOR"
          ? "Comp off credit request sent to Director"
          : "Comp off credit request sent to HOD",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  pass
const assignLeaves = async (req, res) => {
  try {
    const {
      target,
      semesterName,
      academicYear,
      el,
      cl,
      ml,
      od,
      winterLeave,
      summerLeave,
      targetEmail,
      maternityLeave,
      studyLeave,
      specialDisabilityLeave,
    } = req.body;

    if (!target || !academicYear || !semesterName) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Target, semester, and academic year are required",
        });
    }

    if (!["teacher", "staff"].includes(target)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid target" });
    }

    const normalizedEmail = String(targetEmail || "")
      .trim()
      .toLowerCase();
    const specialFields = {
      maternityLeaveTotal: maternityLeave,
      studyLeaveTotal: studyLeave,
      specialDisabilityLeaveTotal: specialDisabilityLeave,
    };
    const hasSpecialValues = Object.values(specialFields).some(
      (value) => value !== undefined && value !== null && value !== "",
    );

    if (hasSpecialValues && !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Teacher or staff email is required for special leave allocation",
      });
    }

    const yearSemesters = await Semester.find({ academicYear }).select(
      "name academicYear",
    );
    const semestersToUpdate = yearSemesters.length
      ? yearSemesters
      : [{ name: semesterName, academicYear }];
    let users = [];

    if (normalizedEmail) {
      const Model = target === "teacher" ? Teacher : Staff;
      const otherModel = target === "teacher" ? Staff : Teacher;
      const emailQuery = new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i");
      const user = await Model.findOne({ email: emailQuery });

      if (!user) {
        const otherUser = await otherModel
          .findOne({ email: emailQuery })
          .select("_id");
        const otherTarget = target === "teacher" ? "staff" : "teacher";
        return res.status(404).json({
          success: false,
          message: otherUser
            ? `This email belongs to a ${otherTarget}. Please select ${otherTarget}.`
            : `No ${target} found with this email`,
        });
      }

      users = [user];
    } else {
      users =
        target === "teacher" ? await Teacher.find({}) : await Staff.find({});
    }

    const buildQuery = (userId) =>
      target === "teacher" ? { teacher: userId } : { staff: userId };

    const buildOwner = (userId) =>
      target === "teacher" ? { teacher: userId } : { staff: userId };

    const hasValue = (value) =>
      value !== undefined && value !== null && value !== "";

    const hasSemesterValues = hasValue(el) || hasValue(cl);
    const hasYearlyValues =
      hasValue(ml) ||
      hasValue(od) ||
      hasValue(winterLeave) ||
      hasValue(summerLeave);

    for (const user of users) {
      const selectedQuery = {
        ...buildQuery(user._id),
        semester: semesterName,
        academicYear,
      };

      const selectedSet = {
        department: user.department && user.department,
      };
      const selectedInc = {};
      if (hasValue(el)) selectedInc.elTotal = Number(el);
      if (hasValue(cl)) selectedSet.clTotal = Number(cl);
      if (hasValue(ml)) selectedSet.mlTotal = Number(ml);
      if (hasValue(od)) selectedSet.odTotal = Number(od);
      if (hasValue(winterLeave))
        selectedSet.winterLeaveTotal = Number(winterLeave);
      if (hasValue(summerLeave))
        selectedSet.summerLeaveTotal = Number(summerLeave);
      if (hasValue(maternityLeave)) {
        selectedSet.maternityLeaveTotal = Number(maternityLeave);
      }
      if (hasValue(studyLeave)) {
        selectedSet.studyLeaveTotal = Number(studyLeave);
      }
      if (hasValue(specialDisabilityLeave)) {
        selectedSet.specialDisabilityLeaveTotal = Number(
          specialDisabilityLeave,
        );
      }

      if (hasSemesterValues || hasYearlyValues || hasSpecialValues) {
        const selectedUpdate = {
          $set: selectedSet,
          $setOnInsert: buildOwner(user._id),
        };
        if (Object.keys(selectedInc).length) {
          selectedUpdate.$inc = selectedInc;
        }

        await LeaveBalance.findOneAndUpdate(selectedQuery, selectedUpdate, {
          upsert: true,
          new: true,
        });
      }

      if (hasYearlyValues) {
        for (const semester of semestersToUpdate) {
          const yearlySet = {
            department: user.department && user.department,
          };
          if (hasValue(ml)) yearlySet.mlTotal = Number(ml);
          if (hasValue(od)) yearlySet.odTotal = Number(od);
          if (hasValue(winterLeave))
            yearlySet.winterLeaveTotal = Number(winterLeave);
          if (hasValue(summerLeave))
            yearlySet.summerLeaveTotal = Number(summerLeave);

          await LeaveBalance.findOneAndUpdate(
            {
              ...buildQuery(user._id),
              semester: semester.name,
              academicYear: semester.academicYear,
            },
            { $set: yearlySet, $setOnInsert: buildOwner(user._id) },
            { upsert: true, new: true },
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: normalizedEmail
        ? `Leaves assigned successfully to ${normalizedEmail} for ${semesterName} (${academicYear})`
        : `Leaves assigned successfully to all ${target}s for ${semesterName} (${academicYear})`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const assignLeavesToAllTeachers = async (req, res) => {
  req.body.target = "teacher";
  req.body.targetEmail = "";
  return assignLeaves(req, res);
};

const assignLeavesToTeacherByEmail = async (req, res) => {
  req.body.target = "teacher";
  req.body.targetEmail = req.body.targetEmail || req.body.email;
  return assignLeaves(req, res);
};

const assignLeavesToAllStaff = async (req, res) => {
  req.body.target = "staff";
  req.body.targetEmail = "";
  return assignLeaves(req, res);
};

const assignLeavesToStaffByEmail = async (req, res) => {
  req.body.target = "staff";
  req.body.targetEmail = req.body.targetEmail || req.body.email;
  return assignLeaves(req, res);
};

// pass
const getMyLeaveRequests = async (req, res) => {
  try {
    const userId = teacherIdFromRequest(req);
    const leaveRequests = await LeaveRequest.find({
      $or: [{ teacher: userId }, { staff: userId }],
    })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const getMyLeaveBalance = async (req, res) => {
  try {
    const userId = teacherIdFromRequest(req);
    const currentSemester = await Semester.findOne({
      isCurrent: true,
      status: "ACTIVE",
    });
    const leaveBalances = await LeaveBalance.find({
      $or: [{ teacher: userId }, { staff: userId }],
    })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ academicYear: -1, semester: -1 });
    const currentBalance = currentSemester
      ? leaveBalances.find(
          (balance) =>
            balance.semester === currentSemester.name &&
            balance.academicYear === currentSemester.academicYear,
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

// pass
const getHODPendingLeaves = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res
        .status(400)
        .json({ success: false, message: "Department is required" });
    }
    const leaveRequests = await LeaveRequest.find({
      status: "PENDING_HOD",
      department: department,
    })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const forwardLeaveToDirectorByHOD = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    if (leaveRequest.status !== "PENDING_HOD") {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for HOD" });
    }

    leaveRequest.status = "FORWARDED_TO_DIRECTOR";
    leaveRequest.hodApproval = {
      status: "APPROVED",
      remark: req.body.remark || "",
      actionBy: req.body.teacherId || "",
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

// pass
const rejectLeaveByHOD = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    if (leaveRequest.status !== "PENDING_HOD") {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for HOD" });
    }

    leaveRequest.status = "REJECTED_BY_HOD";
    leaveRequest.hodApproval = {
      status: "REJECTED",
      remark: req.body.remark || "",
      actionBy: req.body.teacherId || "",
      actionAt: new Date(),
    };

    await leaveRequest.save();

    return res.status(200).json({
      success: true,
      message: "Leave rejected by HOD",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const getAdminPendingLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ status: "PENDING_ADMIN" })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// pass
const forwardLeaveToDirector = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
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
// pass
const rejectLeaveByAdmin = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
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

// pass
const getDirectorPendingLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      status: { $in: ["FORWARDED_TO_DIRECTOR", "ROLLBACK_REQUESTED"] },
    })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const requestLeaveRollback = async (req, res) => {
  try {
    const userId = teacherIdFromRequest(req);
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    const ownsLeave =
      String(leaveRequest.teacher || "") === String(userId) ||
      String(leaveRequest.staff || "") === String(userId);

    if (!ownsLeave) {
      return res
        .status(403)
        .json({ success: false, message: "You cannot rollback this leave" });
    }

    if (leaveRequest.status !== "APPROVED") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only approved leaves can be rolled back",
        });
    }

    if (leaveRequest.requestKind !== "LEAVE_USAGE") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only leave usage requests can be rolled back",
        });
    }

    leaveRequest.status = "ROLLBACK_REQUESTED";
    leaveRequest.rollbackReason = req.body.reason || "";
    leaveRequest.rollbackApproval = {
      status: "PENDING",
      remark: "",
      actionBy: "",
      actionAt: undefined,
    };

    await leaveRequest.save();

    return res.status(200).json({
      success: true,
      message: "Rollback request sent to director",
      leaveRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
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
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    const normalizedSearch = search?.trim().toLowerCase();
    const filteredRequests = normalizedSearch
      ? leaveRequests.filter((request) => {
          const userName = (
            request.teacher?.name ||
            request.staff?.name ||
            ""
          ).toLowerCase();
          const userEmail = (
            request.teacher?.email ||
            request.staff?.email ||
            ""
          ).toLowerCase();
          return (
            userName.includes(normalizedSearch) ||
            userEmail.includes(normalizedSearch)
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

// pass
const approveLeaveByDirector = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    if (
      !["FORWARDED_TO_DIRECTOR", "ROLLBACK_REQUESTED"].includes(
        leaveRequest.status,
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for director" });
    }

    const balance = await getBalance(
      leaveRequest.teacher || leaveRequest.staff,
      leaveRequest.department,
      {
        name: leaveRequest.semester,
        academicYear: leaveRequest.academicYear,
      },
      !!leaveRequest.staff,
    );

    if (!balance) {
      return res.status(404).json({
        success: false,
        message: "Leave balance not found",
      });
    }

    if (
      leaveRequest.status === "FORWARDED_TO_DIRECTOR" &&
      leaveRequest.requestKind === "LEAVE_USAGE" &&
      availableLeave(balance, leaveRequest.leaveType) < leaveRequest.days
    ) {
      return res.status(400).json({
        success: false,
        message: `${leaveRequest.leaveType} balance is not enough`,
      });
    }

    const isRollbackApproval = leaveRequest.status === "ROLLBACK_REQUESTED";

    if (isRollbackApproval) {
      creditLeaveBalance(balance, leaveRequest.leaveType, leaveRequest.days);
      leaveRequest.status = "ROLLED_BACK";
      leaveRequest.rollbackApproval = {
        status: "APPROVED",
        remark: req.body.remark || "",
        actionBy: "Director",
        actionAt: new Date(),
      };
    } else {
      leaveRequest.status = "APPROVED";
      leaveRequest.directorApproval = {
        status: "APPROVED",
        remark: req.body.remark || "",
        actionBy: "Director",
        actionAt: new Date(),
      };
    }

    const [updatedBalance] = await Promise.all([
      isRollbackApproval
        ? balance.save()
        : LeaveBalance.findByIdAndUpdate(
            balance._id,
            { $inc: balanceIncrement(leaveRequest) },
            { new: true },
          ),
      leaveRequest.save(),
    ]);
    if (updatedBalance == null) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to update leave balance" });
    }
    return res.status(200).json({
      success: true,
      message: isRollbackApproval
        ? "Leave rollback approved and balance credited"
        : "Leave approved by director",
      leaveRequest,
      balance: updatedBalance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
const rejectLeaveByDirector = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    if (
      !["FORWARDED_TO_DIRECTOR", "ROLLBACK_REQUESTED"].includes(
        leaveRequest.status,
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Leave is not pending for director" });
    }

    if (leaveRequest.status === "ROLLBACK_REQUESTED") {
      leaveRequest.status = "ROLLBACK_REJECTED";
      leaveRequest.rollbackApproval = {
        status: "REJECTED",
        remark: req.body.remark || "",
        actionBy: "Director",
        actionAt: new Date(),
      };
    } else {
      leaveRequest.status = "REJECTED_BY_DIRECTOR";
      leaveRequest.directorApproval = {
        status: "REJECTED",
        remark: req.body.remark || "",
        actionBy: "Director",
        actionAt: new Date(),
      };
    }

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

// pass  one doubt
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
      const ownerQuery = oldBalance.staff
        ? { staff: oldBalance.staff }
        : { teacher: oldBalance.teacher };

      const nextBalance = await LeaveBalance.findOne({
        ...ownerQuery,
        semester: nextSemester.name,
        academicYear: nextSemester.academicYear,
      });

      const isSameYear =
        completedSemester.academicYear === nextSemester.academicYear;

      // if (nextBalance) {
      //   nextBalance.department = oldBalance.department;
      //   nextBalance.elTotal = 5 + remainingEl;
      //   nextBalance.clTotal = 6;
      //   nextBalance.mlTotal = 7;
      //   nextBalance.odTotal = 15;
      //   nextBalance.mlUsed = isSameYear ? oldBalance.mlUsed : 0;
      //   nextBalance.odUsed = isSameYear ? oldBalance.odUsed : 0;
      //   nextBalance.compoffTotal = 0;
      //   nextBalance.compoffUsed = 0;
      //   nextBalance.maternityLeaveTotal = 0;
      //   nextBalance.maternityLeaveUsed = 0;
      //   nextBalance.studyLeaveTotal = 0;
      //   nextBalance.studyLeaveUsed = 0;
      //   nextBalance.specialDisabilityLeaveTotal = 0;
      //   nextBalance.specialDisabilityLeaveUsed = 0;
      //   await nextBalance.save();
      // }
      if (nextBalance) {
        nextBalance.department = oldBalance.department;
        nextBalance.elTotal = remainingEl;
        nextBalance.clTotal = 0;
        nextBalance.mlTotal = isSameYear ? oldBalance.mlTotal : 0;
        nextBalance.odTotal = isSameYear ? oldBalance.odTotal : 0;
        nextBalance.winterLeaveTotal = isSameYear
          ? oldBalance.winterLeaveTotal
          : 0;
        nextBalance.summerLeaveTotal = isSameYear
          ? oldBalance.summerLeaveTotal
          : 0;
        nextBalance.mlUsed = isSameYear ? oldBalance.mlUsed : 0;
        nextBalance.odUsed = isSameYear ? oldBalance.odUsed : 0;
        nextBalance.winterLeaveUsed = isSameYear
          ? oldBalance.winterLeaveUsed
          : 0;
        nextBalance.summerLeaveUsed = isSameYear
          ? oldBalance.summerLeaveUsed
          : 0;
        nextBalance.compoffTotal = 0;
        nextBalance.compoffUsed = 0;
        nextBalance.maternityLeaveTotal = isSameYear
          ? oldBalance.maternityLeaveTotal
          : 0;
        nextBalance.maternityLeaveUsed = isSameYear
          ? oldBalance.maternityLeaveUsed
          : 0;
        nextBalance.studyLeaveTotal = isSameYear
          ? oldBalance.studyLeaveTotal
          : 0;
        nextBalance.studyLeaveUsed = isSameYear ? oldBalance.studyLeaveUsed : 0;
        nextBalance.specialDisabilityLeaveTotal = isSameYear
          ? oldBalance.specialDisabilityLeaveTotal
          : 0;
        nextBalance.specialDisabilityLeaveUsed = isSameYear
          ? oldBalance.specialDisabilityLeaveUsed
          : 0;
        await nextBalance.save();
      } else {
        await LeaveBalance.create({
          ...ownerQuery,
          department: oldBalance.department,
          semester: nextSemester.name,
          academicYear: nextSemester.academicYear,
          elTotal: remainingEl,
          elUsed: 0,
          clTotal: 0,
          clUsed: 0,
          mlTotal: isSameYear ? oldBalance.mlTotal : 0,
          mlUsed: isSameYear ? oldBalance.mlUsed : 0,
          odTotal: isSameYear ? oldBalance.odTotal : 0,
          odUsed: isSameYear ? oldBalance.odUsed : 0,
          winterLeaveTotal: isSameYear ? oldBalance.winterLeaveTotal : 0,
          winterLeaveUsed: isSameYear ? oldBalance.winterLeaveUsed : 0,
          summerLeaveTotal: isSameYear ? oldBalance.summerLeaveTotal : 0,
          summerLeaveUsed: isSameYear ? oldBalance.summerLeaveUsed : 0,
          compoffTotal: 0,
          compoffUsed: 0,
          maternityLeaveTotal: isSameYear ? oldBalance.maternityLeaveTotal : 0,
          maternityLeaveUsed: isSameYear ? oldBalance.maternityLeaveUsed : 0,
          studyLeaveTotal: isSameYear ? oldBalance.studyLeaveTotal : 0,
          studyLeaveUsed: isSameYear ? oldBalance.studyLeaveUsed : 0,
          specialDisabilityLeaveTotal: isSameYear
            ? oldBalance.specialDisabilityLeaveTotal
            : 0,
          specialDisabilityLeaveUsed: isSameYear
            ? oldBalance.specialDisabilityLeaveUsed
            : 0,
        });
      }

      teachersUpdated += 1;
      carriedForward.push({
        teacher: oldBalance.teacher,
        staff: oldBalance.staff,
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
      { isCurrent: false },
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

// pass
const getDepartmentLeaves = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      department: req.params.department,
    })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaveRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// pass
const getTeacherLeaves = async (req, res) => {
  try {
    const userId = req.params.teacherId;
    const leaveRequests = await LeaveRequest.find({
      $or: [{ teacher: userId }, { staff: userId }],
    })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ createdAt: -1 });

    const leaveBalances = await LeaveBalance.find({
      $or: [{ teacher: userId }, { staff: userId }],
    })
      .populate("teacher", "name email")
      .populate("staff", "name email")
      .sort({ academicYear: -1, semester: -1 });

    return res
      .status(200)
      .json({ success: true, leaveRequests, leaveBalances });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// pass
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
  applyStaffLeave,
  applyStaffCompoffCredit,
  requestLeaveRollback,
  assignLeaves,
  assignLeavesToAllTeachers,
  assignLeavesToTeacherByEmail,
  assignLeavesToAllStaff,
  assignLeavesToStaffByEmail,
  getMyLeaveRequests,
  getMyLeaveBalance,
  getAdminPendingLeaves,
  getHODPendingLeaves,
  forwardLeaveToDirector,
  forwardLeaveToDirectorByHOD,
  rejectLeaveByAdmin,
  rejectLeaveByHOD,
  getDirectorPendingLeaves,
  getLeaveRecords,
  approveLeaveByDirector,
  rejectLeaveByDirector,
  closeSemesterAndCarryForwardEl,
  getDepartmentLeaves,
  getTeacherLeaves,
  getLeaveSummary,
};
