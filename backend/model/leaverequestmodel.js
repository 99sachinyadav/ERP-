import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    remark: {
      type: String,
      trim: true,
      default: "",
    },
    actionBy: {
      type: String,
      trim: true,
      default: "",
    },
    actionAt: {
      type: Date,
    },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
      default: "",
    },
    mimeType: {
      type: String,
      trim: true,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
      min: 0,
    },
    data: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const leaveRequestSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["AIML", "EN", "CSE", "APPLIED", "ADMINISTRATOR", "STAFF"],
    },
    semester: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    leaveType: {
      type: String,
      required: true,
      enum: ["EL", "CL", "ML", "OD", "COMPOFF"],
    },
    requestKind: {
      type: String,
      required: true,
      enum: ["LEAVE_USAGE", "COMPOFF_CREDIT"],
      default: "LEAVE_USAGE",
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    attachment: {
      type: attachmentSchema,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "PENDING_ADMIN",
        "FORWARDED_TO_DIRECTOR",
        "APPROVED",
        "REJECTED_BY_ADMIN",
        "REJECTED_BY_DIRECTOR",
        "CANCELLED",
      ],
      default: "PENDING_ADMIN",
    },
    adminApproval: {
      type: approvalSchema,
      default: () => ({}),
    },
    directorApproval: {
      type: approvalSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ teacher: 1, createdAt: -1 });
leaveRequestSchema.index({ department: 1, status: 1 });
leaveRequestSchema.index({ status: 1, leaveType: 1 });

export const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
