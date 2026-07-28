import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    department: {
      type: String,
       
      enum: ["AIML/CSE/IT", "ECE/EN", "APPLIED/STAFF", "ADMINISTRATOR"],
    },
    semester: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    elTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    elUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    clTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    clUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    mlTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    mlUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    odTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    odUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    winterLeaveTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    winterLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    summerLeaveTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    summerLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    compoffTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    compoffUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    maternityLeaveTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    maternityLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    studyLeaveTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    studyLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialDisabilityLeaveTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialDisabilityLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

leaveBalanceSchema.index(
  { teacher: 1, semester: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { teacher: { $type: "objectId" } } }
);

leaveBalanceSchema.index(
  { staff: 1, semester: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { staff: { $type: "objectId" } } }
);

export const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
