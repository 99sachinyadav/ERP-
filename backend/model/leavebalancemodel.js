import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
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
    elTotal: {
      type: Number,
      default: 6,
      min: 0,
    },
    elUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    clTotal: {
      type: Number,
      default: 6,
      min: 0,
    },
    clUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    mlTotal: {
      type: Number,
      default: 5,
      min: 0,
    },
    mlUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    odUsed: {
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
  },
  { timestamps: true }
);

leaveBalanceSchema.index(
  { teacher: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

export const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
