import { SpecialStudent } from "../model/specialstudent.model.js";
import { Section } from "../model/sectionmodel.js";
import { Student } from "../model/studentmodel.js";

const addSpecialStudent = async (req, res) => {
  try {
    const { name, year, batch, rollno, Remarks, Date, studentId, Year, Batch } = req.body;
    let { section } = req.body;

    const normalizedYear = Year ?? year;
    const normalizedBatch = Batch ?? batch;
    const normalizedRemarks = typeof Remarks === "string" && Remarks.trim() !== "" ? Remarks.trim() : "No remark";
    section = typeof section === "string" ? section.toUpperCase() : "";

    console.log(name, normalizedYear, normalizedBatch, rollno, normalizedRemarks, Date, studentId, section);

    if (!name || !section || !normalizedYear || !normalizedBatch || !rollno || !Date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const studentSectionYear = section + normalizedYear + "_" + normalizedBatch;

    const StudentSection = await Section.findOne({ name: studentSectionYear });
    if (!StudentSection) {
      return res.status(404).json({ message: "Section with " + studentSectionYear + " not found" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ sucess: false, message: "Student not found" });
    }

    const existingSpecialStudent = await SpecialStudent.findOne({
      rollno: student.rollno,
    });
    if (existingSpecialStudent) {
      return res.status(400).json({
        message: "Special student with this roll number already exists",
      });
    }

    StudentSection.students = StudentSection.students.filter(
      (studentIdInSection) => studentIdInSection.toString() !== studentId,
    );
    await StudentSection.save();

    const specialStudent = new SpecialStudent({
      name,
      section,
      Year: normalizedYear,
      Batch: normalizedBatch,
      rollno,
      Remarks: normalizedRemarks,
      Date,
    });
    await specialStudent.save();

    return res.status(201).json({
      sucess: true,
      message: "Special student added successfully",
      specialStudent,
    });
  } catch (error) {
    console.error("Error adding special student:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllSpecialStudents = async (req, res) => {
  try {
    const specialStudents = await SpecialStudent.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Special students fetched successfully",
      specialStudents,
    });
  } catch (error) {
    console.error("Error fetching special students:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { addSpecialStudent, getAllSpecialStudents };

