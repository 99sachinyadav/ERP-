import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      minlength: [3, "lastname must contain atleast three letter"],
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
    father_name :{
        type :String,
        required :true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "other"],
    },
    avtar:{
      type:String,
    },
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
