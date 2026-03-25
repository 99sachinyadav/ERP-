import mongoose from "mongoose";

const studentVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    name: { type: String },
  },
  { timestamps: true }
);

export const StudentVerification = mongoose.model(
  "StudentVerification",
  studentVerificationSchema
);
