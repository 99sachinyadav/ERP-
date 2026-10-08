import { Section } from "../model/sectionmodel.js";
import { Teacher } from "../model/teachermodel.js";
import { Staff } from "../model/staffmodel.js";
import { generateToken, hashpasssword } from "./studentcontroller.js";

import { Student } from "../model/studentmodel.js";
import { CourseProgress } from "../model/courseprogressmodel.js";
 import bcrypt from "bcryptjs";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log(name,email,password)
    if (!name || !email || !password) {
      throw new Error("please enter the full details");
    }
    let trimedemail = email.toLowerCase().trim();
    const emailQuery = new RegExp(`^${escapeRegex(trimedemail)}$`, "i");
    const existingStaff = await Staff.findOne({ email: emailQuery });
    if (existingStaff) {
      throw new Error("This email is already registered as staff");
    }

    const ExistedTeacher = await Teacher.findOne({
      $or: [{ email: emailQuery }, { password: password }],
    });
    if (ExistedTeacher) {
      throw new Error("Faculty already exists");
    }

    const hashedPassword = await hashpasssword(password);
    const teacher = await Teacher.create({
      name: name,
      email: trimedemail,
      password: hashedPassword,
      // section:SectionExist._id,
    });

    const teacherToken = generateToken(teacher._id);

    // const newsection = await Section.findOne({name:section});
    // if (!newsection) {
    //     return res.status(404).json({ success: false, message: "Section not found" });
    // }
    // //same thing in secton controller
    //     if (!newsection.teacher) {
    //         newsection.teacher = teacher._id;
    //     } else {
    //         return res.status(400).json({ success: false, message: "Section already has a teacher assigned" });
    //     }
    //     await newsection.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Teacher saved successfully ",
        teacherToken,
      });
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ sucess: false, message: error.message });
  }
};

const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("email or password is missing");
    }
    let trimedemail = email.toLowerCase().trim();
     trimedemail = new RegExp(`^${escapeRegex(trimedemail)}$`, "i");
    // console.log(email, password);
    const findTeacher = await Teacher.findOne({
      $or: [{ email: trimedemail }],
    }).select("+password").populate("section");
    if (!findTeacher) {
      throw new Error("faculty does not exist");
    }
    const ispasswordMatched = await bcrypt.compare(
      password,
      findTeacher.password
    );

    if (!ispasswordMatched) {
      throw new Error("Invalid Password");
    }

    const refeshTeacherToken = generateToken(findTeacher._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      refeshTeacherToken,
      findTeacher,
    });
  } catch (error) {
    console.log(error);
    return res.status(402).json({ sucess: false, message: error.message });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error("please enter the full details");
    }
    let trimedemail = email.toLowerCase().trim();
    const emailQuery = new RegExp(`^${escapeRegex(trimedemail)}$`, "i");
    const ExistedTeacher = await Teacher.findOne({ email: emailQuery });
    if (ExistedTeacher) {
      throw new Error("This email is already registered as a teacher");
    }

    const ExistedStaff = await Staff.findOne({ email: emailQuery });
    if (ExistedStaff) {
      throw new Error("Staff member already exists");
    }

    const hashedPassword = await hashpasssword(password);
    const staff = await Staff.create({
      name: name,
      email: trimedemail,
      password: hashedPassword,
      
    });

    const staffToken = generateToken(staff._id);

    return res
      .status(201)
      .json({
        success: true,
        message: "Staff registered successfully",
        staffToken,
      });
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ sucess: false, message: error.message });
  }
};

const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("email or password is missing");
    }
    let trimedemail = email.toLowerCase().trim();
    trimedemail = new RegExp(`^${escapeRegex(trimedemail)}$`, "i");
    const findStaff = await Staff.findOne({ email: trimedemail });
    if (!findStaff) {
      throw new Error("staff member does not exist");
    }
    const ispasswordMatched = await bcrypt.compare(
      password,
      findStaff.password
    );
    if (!ispasswordMatched) {
      throw new Error("Invalid Password");
    }

    const refeshStaffToken = generateToken(findStaff._id);
    const staffData = findStaff.toObject();
    delete staffData.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      refeshStaffToken,
      refeshTeacherToken: refeshStaffToken,
      findStaff: staffData,
      findTeacher: staffData,
    });
  } catch (error) {
    console.log(error);
    return res.status(402).json({ sucess: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(403)
        .json({ sucess: false, message: "please enter full details" });
    }
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const adminToken = generateToken(
        process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
      );
      return res
        .status(200)
        .json({ sucess: true, message: "admin login sucessfully", adminToken });
    } else {
      return res
        .status(401)
        .json({ sucess: false, message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(203).json({ sucess: false, message: error.message });
  }
};

const deanLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(403)
        .json({ sucess: false, message: "please enter full details" });
    }
    if (
      email === process.env.DEAN_EMAIL &&
      password === process.env.DEAN_PASSWORD
    ) {
      const deanToken = generateToken(
        process.env.DEAN_EMAIL + process.env.DEAN_PASSWORD
      );
      return res
        .status(200)
        .json({ sucess: true, message: "dean login sucessfully", adminToken: deanToken });
    } else {
      return res
        .status(401)
        .json({ sucess: false, message: "Invalid dean credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(203).json({ sucess: false, message: error.message });
  }
};

const directorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(403)
        .json({ sucess: false, message: "please enter full details" });
    }
    if (
      email === process.env.DIRECTOR_EMAIL &&
      password === process.env.DIRECTOR_PASSWORD
    ) {
      const directorToken = generateToken(
        process.env.DIRECTOR_EMAIL + process.env.DIRECTOR_PASSWORD
      );
      return res
        .status(200)
        .json({
          sucess: true,
          message: "director login sucessfully",
          adminToken: directorToken,
        });
    } else {
      return res
        .status(401)
        .json({ sucess: false, message: "Invalid director credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(203).json({ sucess: false, message: error.message });
  }
};

//DONE
const attendancebyTeacher = async (req, res) => {
  try {
    const { subject, rollno, date, noofLecAttended, totalnoLec, teacherId ,adminID ,year,batch,semester} =
      req.body;
    // console.log(subject, rollno, date, noofLecAttended , totalnoLec,teacherId)
    let { section } = req.body;
    section = section.toUpperCase();
    //
    // console.log(adminID)
     // console.log(subject, rollno, date, noofLecAttended, totalnoLec, section, year, batch, semester);
    if (!subject || !rollno || !date || !noofLecAttended || !totalnoLec || !section || !year || !batch || !semester) {
      return res
        .status(403)
        .json({ sucess: false, message: "kindly fill you full details" });
    }
  
    // console.log(totalnoLec, noofLecAttended);
    // console.log(Number(totalnoLec) < Number(noofLecAttended));

    if (Number(totalnoLec) < Number(noofLecAttended)) {
      return res
        .status(401)
        .json({
          sucess: false,
          message:
            "Total No of lecture schould be greater then noofLecAttended",
        });
    }
    const findStudent = await Student.findOne({ rollno: rollno });
    if (!findStudent) {
      return res
        .status(401)
        .json({ sucess: false, message: "student not found" });
    }
    const findTeacherbyAuth = await Teacher.findOne({ _id: teacherId });
    if (!findTeacherbyAuth) {
      return res
        .status(401)
        .json({ sucess: false, message: "Teacher   not found in database " });
    }
    const MySubject =    subject + "_" + section+ year+ "_" + batch  ;
    // console.log(MySubject)
    if(!findTeacherbyAuth.subjects.includes(MySubject)){
      return res
      .status(401)
      .json({ sucess: false, message: "subject not assigned to faculty" });
    }

    const sectionName =
      findStudent.section.toUpperCase() + findStudent.year + "_" + findStudent.batch;
      // console.log(sectionName)
    const findSection = await Section.findOne({ name: sectionName });
    if (!findSection) {
      return res
        .status(401)
        .json({
          sucess: false,
          message: "section assigned to student not found",
        });
    }
    // if (findSection.teacher.toString() !== findTeacherbyAuth?._id.toString() && !adminID) {
    //   return res
    //     .status(401)
    //     .json({
    //       sucess: false,
    //       message: "faculty not assigned to this section",
    //     });
    // }
    const dateObject = new Date(date);
    const dateKey = (d) => new Date(d).toISOString().slice(0, 10);
    const targetDateKey = dateKey(dateObject);
    if (!findStudent.subjects.includes(subject)) {
      return res
        .status(401)
        .json({ sucess: false, message: "subject not assigned to student" });
    }
    let updated = false;

    for (let record of findStudent.attendance) {
      // record.subject is an array
      let subj = record.subject.find(
        (s) => s.name === subject && dateKey(s.date) === targetDateKey
      );
      if (subj) {
        // Edit for the same date: replace values instead of accumulating
        subj.noofLecAttended = Number(noofLecAttended);
        subj.totalnoLec = Number(totalnoLec);
        updated = true;
        break;
      }
    }
    if (!updated) {
      // Check if subject exists with a different date in any attendance record
      let subjectAdded = false;
      for (let record of findStudent.attendance) {
        let subj = record.subject.find((s) => s.name === subject);
        if (subj) {
          // Add new date entry for the same subject in the same subject array
          record.subject.push({
            name: subject,
            date: dateObject,
            noofLecAttended: Number(noofLecAttended),
            totalnoLec: Number(totalnoLec),
          });
          subjectAdded = true;
          break;
        }
      }
      if (!subjectAdded) {
        // If subject not found at all, push a new attendance record
        findStudent.attendance.push({
          subject: [
            {
              name: subject,
              date: dateObject,
              noofLecAttended: Number(noofLecAttended),
              totalnoLec: Number(totalnoLec),
            },
          ],
        });
      }
    }

    await findStudent.save();
    return res
      .status(200)
      .json({
        sucess: true,
        message: "attendance updated successfully",
        findStudent,
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ sucess: false, message: error.message });
  }
};

const updateTeacherInSection = async (req, res) => {
  try {
    const {  year, batch, newteacheremail } = req.body;
  
     let{section} = req.body;

      section=section.toUpperCase();
        // console.log(section, year, batch, newteacheremail);
    if (!section || !year || !batch || !newteacheremail) {
      return res
        .status(403)
        .json({ sucess: false, message: "kindly fill full details" });
    }
    const ExistedTeacher = await Teacher.findOne({
      $or: [{ email: newteacheremail }],
    });
    if (!ExistedTeacher) {
      return res
        .status(401)
        .json({ sucess: false, message: "faculty not exist" });
    }
    const SectionName = section + year + "_" + batch;
    const SectionExist = await Section.findOne({
      name: SectionName,
      year: year,
      batch: batch,
    });
    if (!SectionExist) {
      return res
        .status(401)
        .json({ sucess: false, message: "section is not available" });
    }
    const previousTeacher = await Teacher.findById(SectionExist.teacher);
    previousTeacher.section = previousTeacher.section.filter(
      (sectionId) => sectionId.toString() !== SectionExist._id.toString()
    );
    await previousTeacher.save();

    SectionExist.teacher = ExistedTeacher._id;
    await SectionExist.save();

    if (!ExistedTeacher.section.includes(SectionExist._id)) {
      ExistedTeacher.section.push(SectionExist._id);
      await ExistedTeacher.save();
    }

    return res
      .status(200)
      .json({
        sucess: true,
        message: "teacher updated in section successfully",
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ sucess: false, message: error.message });
  }
};

const getAllTeacher = async (req, res) => {
  try {
    const findAllTeacher = await Teacher.find({})
      .select("-password")
      .populate("section");
    if (!findAllTeacher) {
      return res
        .status(401)
        .json({ sucess: false, message: "no teacher is registered now" });
    }

    const teachersWithCurrentSubjects = findAllTeacher.map((teacher) => {
      const teacherData = teacher.toObject();
      teacherData.section = (teacherData.section || []).map((section) => {
        const semesterPrefix = `${section.semester}_`;
        return {
          ...section,
          subjects: (section.subjects || []).filter((subject) =>
            String(subject || "").startsWith(semesterPrefix)
          ),
        };
      });
      return teacherData;
    });

    return res
      .status(200)
      .json({
        sucess: true,
        message: "all teacher fetched sucessfully",
        findAllTeacher: teachersWithCurrentSubjects,
      });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ sucess: false, message: error.message });
  }
};

const getTeacherAssignments = async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) {
      return res
        .status(403)
        .json({ sucess: false, message: "teacher id is missing" });
    }

    const teacher = await Teacher.findById(teacherId).select(
      "name email subjects section"
    );
    if (!teacher) {
      return res
        .status(404)
        .json({ sucess: false, message: "Teacher not found" });
    }

    const assignedSections = await Section.find({
      _id: { $in: teacher.section || [] },
    }).select("name semester year batch");

    return res.status(200).json({
      sucess: true,
      message: "teacher assignments fetched successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
      },
      subjects: teacher.subjects || [],
      sections: assignedSections,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ sucess: false, message: error.message });
  }
};
// by this route we can get all the attendance of all student in a particular section with student data
const getAttendanceofAllStudent = async (req, res) => {
  try {
    const { section, year, batch } = req.body;
    if (!section || !year || !batch) {
      return res
        .status(403)
        .json({ sucess: false, message: "kindly fill you full details" });
    }
    const SectionName = section.toUpperCase() + year + "_" + batch;
    const SectionExist = await Section.findOne({
      name: SectionName,
      year: year,
      batch: batch,
    });
    if (!SectionExist) {
      return res
        .status(401)
        .json({ sucess: false, message: "section is not available" });
    }
    const SectionStudent = await Promise.all(
      SectionExist.students.map((studentId) =>
        Student.findById(studentId).select("-password").populate("attendance")
      )
    );

    return res
      .status(200)
      .json({
        sucess: true,
        message: "all student attendance fetched successfully",
        SectionStudent,
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ sucess: false, message: error.message });
  }
};

// Any teacher assigned to the subject for the given section-year-batch can upload or update marks
const uploadMarks = async (req, res) => {
  try {
    const {
      teacherId,
      adminID,
      rollno,
      section,
      year,
      batch,
      semester,
      subject,
      exam,
      obtainedMarks,
      totalMarks,
    } = req.body;

    if (adminID && !teacherId) {
      return res
        .status(403)
        .json({ sucess: false, message: "Only assigned teacher can upload marks" });
    }

    if (
      !teacherId ||
      !rollno ||
      !section ||
      !year ||
      !batch ||
      !semester ||
      !subject ||
      !exam ||
      obtainedMarks === undefined
    ) {
      return res.status(403).json({
        sucess: false,
        message: "Please fill all required details for marks",
      });
    }

    const normalizedSubject = String(subject || "").trim();
    const normalizedYear = String(year || "").trim();
    const normalizedBatch = String(batch || "").trim();
    const normalizedExam = String(exam || "").trim().toUpperCase();
    const upperSection = section.toUpperCase().trim();
    const sectionName = upperSection + normalizedYear + "_" + normalizedBatch;

    const [teacher, sectionDoc, student] = await Promise.all([
      Teacher.findById(teacherId),
      Section.findOne({ name: sectionName, year: normalizedYear, batch: normalizedBatch }),
      Student.findOne({ rollno: rollno }),
    ]);

    if (!teacher) {
      return res
        .status(401)
        .json({ sucess: false, message: "Teacher not found" });
    }

    if (!sectionDoc) {
      return res
        .status(401)
        .json({ sucess: false, message: "Section not found with these details" });
    }

    // Same assignment format used in attendance check: <subject>_<section><year>_<batch>
    const assignedSubjectKey = `${normalizedSubject}_${sectionName}`;
    const isAssignedSubject = Array.isArray(teacher.subjects)
      ? teacher.subjects.some(
          (item) => String(item || "").trim() === assignedSubjectKey
        )
      : false;

    if (!isAssignedSubject) {
      return res.status(403).json({
        sucess: false,
        message: "You are not assigned to upload marks for this subject and section",
      });
    }

    if (!student) {
      return res
        .status(401)
        .json({ sucess: false, message: "Student not found with this roll number" });
    }

    if (!student.subjects.includes(normalizedSubject)) {
      return res.status(401).json({
        sucess: false,
        message: "Subject not assigned to this student",
      });
    }

    const numObtained = Number(obtainedMarks);

    if (Number.isNaN(numObtained)) {
      return res.status(401).json({
        sucess: false,
        message: "Obtained marks must be a valid number",
      });
    }

    if (!["ST1", "ST2", "PUT"].includes(normalizedExam)) {
      return res.status(401).json({
        sucess: false,
        message: "Invalid exam type",
      });
    }

    const maxTotal = normalizedExam === "PUT" ? 70 : 50;
    const hasTotalMarks =
      totalMarks !== undefined &&
      totalMarks !== null &&
      String(totalMarks).trim() !== "";
    let parsedTotalMarks = maxTotal;

    if (hasTotalMarks) {
      parsedTotalMarks = Number(totalMarks);
      if (Number.isNaN(parsedTotalMarks) || parsedTotalMarks <= 0) {
        return res.status(401).json({
          sucess: false,
          message: "Total marks must be a valid positive number",
        });
      }

      if (parsedTotalMarks > maxTotal) {
        return res.status(401).json({
          sucess: false,
          message: `Total marks cannot be more than ${maxTotal} for ${normalizedExam}`,
        });
      }
    }

    if (numObtained < 0 || numObtained > parsedTotalMarks) {
      return res.status(401).json({
        sucess: false,
        message: `Marks are not in valid range for ${normalizedExam}. Max allowed is ${parsedTotalMarks}`,
      });
    }

    const existing = student.marks.find(
      (m) =>
        m.exam === normalizedExam &&
        m.semester === semester &&
        m.subject === normalizedSubject
    );

    if (existing) {
      existing.obtainedMarks = numObtained;
      existing.totalMarks = parsedTotalMarks;
    } else {
      student.marks.push({
        exam: normalizedExam,
        semester,
        subject: normalizedSubject,
        obtainedMarks: numObtained,
        totalMarks: parsedTotalMarks,
      });
    }

    await student.save();

    return res.status(200).json({
      sucess: true,
      message: "Marks uploaded successfully",
      marks: student.marks,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ sucess: false, message: error.message });
  }
};


const   getStaff = async (req,res)=>{
     try {

    const staffMembers = await Staff.find({}).select("-password");
    if (!staffMembers || staffMembers.length === 0) {
      return res.status(404).json({ success: false, message: "No staff members found" });
    }
    return res.status(200).json({ success: true, staffMembers ,message: "Staff members fetched successfully" });
     }
  catch (error) {
    console.log(error);
    return res.status(401).json({ sucess: false, message: error.message });
  }

}





const mark_or_updateactivityattendence = async (req,res)=>{
  try {
    const {
      subject,
      rollno,
      noofLec,
      noofLecAttended,
      teacherId,
      year,
      batch,
      semester,
    } = req.body;
    const section = String(req.body.section || "").toUpperCase().trim();
    const lectureCount = Number(noofLec ?? noofLecAttended);

    if (
      !subject ||
      !rollno ||
      !teacherId ||
      !section ||
      !year ||
      !batch ||
      !semester ||
      (noofLec === undefined && noofLecAttended === undefined)
    ) {
      return res
        .status(400)
        .json({ sucess: false, message: "Please fill all required details" });
    }

    if (!Number.isInteger(lectureCount) || lectureCount < 0) {
      return res.status(400).json({
        sucess: false,
        message: "Number of attended lectures must be a non-negative whole number",
      });
    }

    const normalizedSubject = String(subject).trim();
    const normalizedYear = String(year).trim();
    const normalizedBatch = String(batch).trim();
    const sectionName = `${section}${normalizedYear}_${normalizedBatch}`;
    const assignedSubjectKey = `${normalizedSubject}_${sectionName}`;

    const [findStudent, findTeacherbyAuth] = await Promise.all([
      Student.findOne({ rollno }),
      Teacher.findById(teacherId),
    ]);

    if (!findStudent) {
      return res
        .status(404)
        .json({ sucess: false, message: "Student not found" });
    }

    if (!findTeacherbyAuth) {
      return res
        .status(404)
        .json({ sucess: false, message: "Teacher not found" });
    }

    if (!findTeacherbyAuth.subjects.includes(assignedSubjectKey)) {
      return res.status(403).json({
        sucess: false,
        message: "Subject is not assigned to this teacher",
      });
    }

    if (
      findStudent.section.toUpperCase() !== section ||
      String(findStudent.year) !== normalizedYear ||
      String(findStudent.batch) !== normalizedBatch ||
      String(findStudent.semester) !== String(semester)
    ) {
      return res.status(400).json({
        sucess: false,
        message: "Student does not belong to the selected section",
      });
    }

    if (!findStudent.subjects.includes(normalizedSubject)) {
      return res.status(400).json({
        sucess: false,
        message: "Subject is not assigned to this student",
      });
    }

    let activityAttendance;
    for (const record of findStudent.activityattendance) {
      activityAttendance = record.subject.find(
        (entry) =>
          String(entry.name).toLowerCase() === normalizedSubject.toLowerCase()
      );
      if (activityAttendance) {
        break;
      }
    }

    if (activityAttendance) {
      activityAttendance.name = normalizedSubject;
      activityAttendance.noofLec = lectureCount;
      activityAttendance.lastmodified = new Date();
    } else {
      findStudent.activityattendance.push({
        subject: [
          {
            name: normalizedSubject,
            noofLec: lectureCount,
            lastmodified: new Date(),
          },
        ],
      });
      activityAttendance =
        findStudent.activityattendance.at(-1).subject.at(-1);
    }

    await findStudent.save();

    return res.status(200).json({
      sucess: true,
      message: "Activity attendance saved successfully",
      activityattendance: activityAttendance,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

const saveCourseProgress = async (req, res) => {
  try {
    const { year, section, batch, semester, subjects } = req.body;
    const normalizedYear = String(year || "").trim();
    const normalizedSection = String(section || "").trim().toUpperCase();
    const normalizedBatch = String(batch || "").trim();
    const normalizedSemester = String(semester || "").trim();

    if (
      !normalizedYear ||
      !normalizedSection ||
      !normalizedBatch ||
      !normalizedSemester
    ) {
      return res.status(400).json({
        sucess: false,
        message: "Year, section, batch, and semester are required",
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        sucess: false,
        message: "Add at least one subject before saving course progress",
      });
    }

    const normalizedSubjects = subjects.map((subject) => ({
      name: String(subject?.name || "").trim(),
      code: String(subject?.code || "").trim().toUpperCase(),
      chapters: (subject?.chapters || []).map((chapter) => ({
        name: String(chapter?.name || "").trim(),
        progress: Math.min(100, Math.max(0, Number(chapter?.progress) || 0)),
      })),
    }));

    if (
      normalizedSubjects.some(
        (subject) =>
          !subject.name ||
          !subject.code ||
          subject.chapters.some((chapter) => !chapter.name)
      )
    ) {
      return res.status(400).json({
        sucess: false,
        message: "Every subject and chapter must have a name",
      });
    }

    const courseProgress = await CourseProgress.findOneAndUpdate(
      {
        year: normalizedYear,
        section: normalizedSection,
        batch: normalizedBatch,
      },
      {
        $set: {
          subjects: normalizedSubjects,
          semester: normalizedSemester,
          teacher: req.body.teacherId,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      sucess: true,
      message: "Course progress saved successfully",
      courseProgress,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        sucess: false,
        message: "Course progress already exists for this section, year, and batch",
      });
    }
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

const saveCourseProgressSubject = async (req, res) => {
  try {
    const { year, section, batch, semester, subject } = req.body;
    const normalizedYear = String(year || "").trim();
    const normalizedSection = String(section || "").trim().toUpperCase();
    const normalizedBatch = String(batch || "").trim();
    const normalizedSemester = String(semester || "").trim();

    if (!normalizedYear || !normalizedSection || !normalizedBatch || !normalizedSemester) {
      return res.status(400).json({
        sucess: false,
        message: "Year, section, batch, and semester are required",
      });
    }

    const normalizedSubject = {
      name: String(subject?.name || "").trim(),
      code: String(subject?.code || "").trim().toUpperCase(),
      chapters: Array.isArray(subject?.chapters)
        ? subject.chapters.map((chapter) => ({
            name: String(chapter?.name || "").trim(),
            progress: Math.min(100, Math.max(0, Number(chapter?.progress) || 0)),
          }))
        : [],
    };

    if (
      !normalizedSubject.name ||
      !normalizedSubject.code ||
      normalizedSubject.chapters.some((chapter) => !chapter.name)
    ) {
      return res.status(400).json({
        sucess: false,
        message: "Subject name, code, and every chapter name are required",
      });
    }

    let courseProgress = await CourseProgress.findOne({
      year: normalizedYear,
      section: normalizedSection,
      batch: normalizedBatch,
    });

    if (courseProgress) {
      const subjectIndex = courseProgress.subjects.findIndex(
        (existingSubject) =>
          existingSubject.code.toUpperCase() === normalizedSubject.code
      );

      if (subjectIndex >= 0) {
        courseProgress.subjects[subjectIndex] = normalizedSubject;
      } else {
        courseProgress.subjects.push(normalizedSubject);
      }

      courseProgress.semester = normalizedSemester;
      courseProgress.teacher = req.body.teacherId;
      await courseProgress.save();
    } else {
      courseProgress = await CourseProgress.create({
        year: normalizedYear,
        section: normalizedSection,
        batch: normalizedBatch,
        semester: normalizedSemester,
        teacher: req.body.teacherId,
        subjects: [normalizedSubject],
      });
    }

    return res.status(200).json({
      sucess: true,
      message: "Subject progress saved successfully",
      courseProgress,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        sucess: false,
        message: "Course progress already exists for this section, year, and batch",
      });
    }
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const normalizedYear = String(req.query.year || "").trim();
    const normalizedSection = String(req.query.section || "").trim().toUpperCase();
    const normalizedBatch = String(req.query.batch || "").trim();

    if (!normalizedYear || !normalizedSection || !normalizedBatch) {
      return res.status(400).json({
        sucess: false,
        message: "Year, section, and batch are required",
      });
    }

    const courseProgress = await CourseProgress.findOne({
      year: normalizedYear,
      section: normalizedSection,
      batch: normalizedBatch,
    }).populate("teacher", "name email");

    if (!courseProgress) {
      return res.status(404).json({
        sucess: false,
        message: "No course progress found for this section, year, and batch",
      });
    }

    return res.status(200).json({ sucess: true, courseProgress });
  } catch (error) {
    return res.status(500).json({ sucess: false, message: error.message });
  }
};



export {
  registerTeacher,
  registerStaff,
  staffLogin,
  teacherLogin,
  adminLogin,
  deanLogin,
  directorLogin,
  attendancebyTeacher,
  updateTeacherInSection,
  getAllTeacher,
  getTeacherAssignments,
  getAttendanceofAllStudent,
  uploadMarks,
  getStaff,
  mark_or_updateactivityattendence,
  saveCourseProgress,
  saveCourseProgressSubject,
  getCourseProgress
};
