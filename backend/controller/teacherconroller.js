import { Section } from "../model/sectionmodel.js";
import { Teacher } from "../model/teachermodel.js";
import { generateToken, hashpasssword } from "./studentcontroller.js";

import { Student } from "../model/studentmodel.js";
import bcrypt from "bcrypt";

const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log(name,email,password)
    if (!name || !email || !password) {
      throw new Error("please enter the full details");
    }

    const ExistedTeacher = await Teacher.findOne({
      $or: [{ email: email }, { password: password }],
    });
    if (ExistedTeacher) {
      throw new Error("Faculty already exists");
    }

    const hashedPassword = await hashpasssword(password);
    const teacher = await Teacher.create({
      name: name,
      email: email,
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
    console.log(email, password);
    const findTeacher = await Teacher.findOne({
      $or: [{ email: email }],
    }).select("+password");
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
      teacher: {
        id: findTeacher._id,
        name: findTeacher.name,
        email: findTeacher.email,
        Sections: findTeacher.section,
      },
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

//DONE
const attendancebyTeacher = async (req, res) => {
  try {
    const { subject, rollno, date, noofLecAttended, totalnoLec, teacherId ,adminID} =
      req.body;
    // console.log(subject, rollno, date, noofLecAttended , totalnoLec,teacherId)
    if (!subject || !rollno || !date || !noofLecAttended || !totalnoLec) {
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
    if (!findTeacherbyAuth && !adminID) {
      return res
        .status(401)
        .json({ sucess: false, message: "Teacher or admin not found in database " });
    }
    const sectionName =
      findStudent.section + findStudent.year + "_" + findStudent.batch;
    const findSection = await Section.findOne({ name: sectionName });
    if (!findSection) {
      return res
        .status(401)
        .json({
          sucess: false,
          message: "section assigned to student not found",
        });
    }
    if (findSection.teacher.toString() !== findTeacherbyAuth?._id.toString() && !adminID) {
      return res
        .status(401)
        .json({
          sucess: false,
          message: "faculty not assigned to this section",
        });
    }
    const dateObject = new Date(date);
    if (!findStudent.subjects.includes(subject)) {
      return res
        .status(401)
        .json({ sucess: false, message: "subject not assigned to student" });
    }
    let updated = false;

    for (let record of findStudent.attendance) {
      // record.subject is an array
      let subj = record.subject.find(
        (s) =>
          s.name === subject &&
          s.date.toISOString() === dateObject.toISOString()
      );
      if (subj) {
        subj.noofLecAttended += Number(noofLecAttended);
        subj.totalnoLec += Number(totalnoLec);
        updated = true;
        break;
      }
    }
    if (!updated) {
      // Check if subject exists with a different date in any attendance record
      let subjectAdded = false;
      for (let record of findStudent.attendance) {
        let subj = record.subject.find(
          (s) =>
            s.name === subject &&
            s.date.toISOString() !== dateObject.toISOString()
        );
        let subj2 = record.subject.find(
          (s) =>
            s.name === subject &&
            s.date.toISOString() === dateObject.toISOString()
        );
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
        // if(subj2){

        //     subj2.noofLecAttended+=Number(noofLecAttended);
        //     subj2.totalnoLec+=Number(totalnoLec);
        //      subjectAdded = true;
        //     break;
        // }
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
    const { section, year, batch, newteacheremail } = req.body;
    console.log(section, year, batch, newteacheremail);
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
    return res
      .status(200)
      .json({
        sucess: true,
        message: "all teacher fetched sucessfully",
        findAllTeacher,
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
export {
  registerTeacher,
  teacherLogin,
  adminLogin,
  attendancebyTeacher,
  updateTeacherInSection,
  getAllTeacher,
  getAttendanceofAllStudent,
};
