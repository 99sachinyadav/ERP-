import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
    },

    year: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
      enum: ["Ist", "IInd", "IIIrd", "IVth", "Vth", "VIth", "VIIth", "VIIIth  "],
    },
    subjects: [
      {
        type: String,
        required: true,
        unique: true,
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    batch: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  { timestamps: true }
);

// sectionSchema.index({ name: 1, year: 1 }, { unique: true });

export const Section = mongoose.model("Section", sectionSchema);
