import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "lastname must contain at least three letters"],
    },

    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    section: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    rollno: {
      type: String,
      required: true,
      unique: true,
    },
    dob: {
      type: String,
      required: true,
    },
    father_name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "other"],
    },
    avtar: {
      type: String,
    },
    batch: {
      type: String,
      required: true,
    },
    subjects: [
      {
        type: String,
        required: true,
      },
    ],
    attendance: [
      {
        subject: [
          {
            name: { type: String, required: true },
            date: { type: Date, required: true },
            noofLecAttended: { type: Number, required: true },
            totalnoLec: { type: Number, required: true },
          },
        ],
      },
    ],
    contactinfo: {
      address: { type: String },
      phoneNo: {
        type: String,
        required: true,
        unique: true,
      },
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);
