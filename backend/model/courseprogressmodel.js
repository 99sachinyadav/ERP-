import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    progress: { type: Number, required: true, min: 0, max: 100 },
    expectedDate: { type: String, trim: true, default: "" },
    lecturesRequired: { type: Number, min: 0, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    semester: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    teacherName: { type: String, trim: true },
    chapters: { type: [chapterSchema], default: [] },
  },
  { _id: false }
);

const courseProgressSchema = new mongoose.Schema(
  {
    year: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true, uppercase: true },
    batch: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    subjects: { type: [subjectSchema], default: [] },
  },
  { timestamps: true }
);

courseProgressSchema.index(
  { section: 1, year: 1, batch: 1 },
  { unique: true }
);

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema
);
