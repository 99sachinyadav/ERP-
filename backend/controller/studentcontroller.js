import { Section } from "../model/sectionmodel.js";
import { Teacher } from "../model/teachermodel.js";
import { Student } from "../model/studentmodel.js";
import bcrypt  ,{ genSalt } from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetCode, sendStudentVerificationCode } from "../config/resend.js";
import { StudentVerification } from "../model/studentverificationmodel.js";
 
import jwt from "jsonwebtoken";

const hashpasssword = async (password) => {
  if (!password) {
    res
      .status(403)
      .json({ sucess: false, message: "password is not available" });
  }

  const salt = await genSalt(10);
  const hashpasssword = await bcrypt.hash(password, salt);
  //console.log(hashpasssword)
  return hashpasssword;
};

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET);
  return token;
};

const registerStudent = async (req, res) => {
  try {
    // -----------------------------
    // 📌 FormData does NOT send objects
    // So contactinfo comes flat:
    // req.body.address
    // req.body.phoneNO
    // -----------------------------

    const {
      name,
      father_name,
      email,
      password,
      rollno,
      year,
      batch,
      dob,
      semester
    } = req.body;

    let { section } = req.body;

    // form-data file
    const image1 = req.file;

    // Read contactinfo manually (because formdata cannot send nested object)
    const address = req.body.address;
    const phoneNO = req.body.phoneNO;

    // Convert image to base64
    let imageBase64 = null;
    if (image1) {
      imageBase64 = image1.buffer.toString("base64");
    }

    console.log(
      name,
      father_name,
      email,
      password,
      rollno,
      section,
      year,
      dob,
      address,
      semester,
      imageBase64,
    );

    // -----------------------------
    // VALIDATION – NO CHANGE
    // -----------------------------
    if (
      !name ||
      !email ||
      !password ||
      !rollno ||
      !section ||
      !year ||
      !dob ||
      !address ||
      !batch ||
      !semester
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Please enter the full data" });
    }

    if (password.length < 6) {
      return res.status(401).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (phoneNO && phoneNO.length !== 10) {
      return res.status(401).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    section = section.toUpperCase();

    const existedStudent = await Student.findOne({
      $or: [{ email: email }, { rollno: rollno }],
    });

    if (existedStudent) {
      return res.json({ sucess: false, message: "User already exist" });
    }

    const sectionYear = section + year + "_" + batch;

    const sectionExist = await Section.findOne({
      name: sectionYear,
      year: year,
      batch: batch,
    });

    if (!sectionExist) {
      return res.status(401).json({
        success: false,
        message: `Section ${section} not found in year ${year} and batch ${batch}`,
      });
    }
  //  console.log("hello");
    if (sectionExist.semester !== semester) {
      return res.status(401).json({
        success: false,
        message: `Section ${section} is not available for semester ${semester}`,
      });
    }

    // -----------------------------------
    // 🟢 CREATE STUDENT (logic unchanged)

    // -----------------------------------
    const student = await Student.create({
      name,
      email,
      year,
      father_name,
      password: await hashpasssword(password),
      section,
      rollno,
      batch,
      dob,
      semester,
      avtar: imageBase64,
      contactinfo: {
        address,
        phoneNo: phoneNO,
      },
    });

    await Section.updateOne(
      { _id: sectionExist._id },
      { $push: { students: student._id } }
    );

    student.subjects = sectionExist.subjects;
    await student.save();

    const studentToken = generateToken(student._id);

    res.locals.registrationSuccess = true;
    return res.status(200).json({
      sucess: true,
      message: "student saved successfully",
      name: student.name,
      studentToken,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};


const studentLogin = async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!password || !email) {
      return res
        .status(401)
        .json({ sucess: false, message: "password or email is missing" });
    }
    const student = await Student.findOne({
      $or: [{ email: email }, { password: password }],
    }).select("+password");
    if (!student) {
      return res.json({ sucess: false, message: "student not found" });
    }
    // console.log(password);
    // console.log(student.password)
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.json({ sucess: false, message: " invalid password" });
    } else {
      const refreshToken = generateToken(student._id);
      return res
        .status(200)
        .json({ sucess: true, message: "login sucessfully ",name:student.name, refreshToken });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};

const studentProfile = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res
        .status(403)
        .json({ sucess: false, message: "student id is missing" });
    }
    const findProfile = await Student.findById(studentId);

    if (!findProfile) {
      return res
        .status(403)
        .json({ sucess: false, message: "student does not exist" });
    }

    return res
      .status(200)
      .json({
        sucess: true,
        message: "student profile fetched successfully",
        profile: findProfile,
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ sucess: false, message: error.mesage });
  }
};

const getAllStudent = async (req, res) => {
  try {
    const findAllstudent = await Student.find({});
    if (!findAllstudent) {
      return res
        .status(401)
        .json({ sucess: false, message: "no student is registered now" });
    }
    return res
      .status(200)
      .json({
        sucess: true,
        message: "all student fetched sucessfully",
        findAllstudent,
      });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ sucess: false, message: error.message });
  }
};

const changeYear = async (req, res) => {
  try {
    let { section, year, batch, newyear } = req.body;

    section = section.toUpperCase().trim();
    year = year.trim();
    batch = batch.trim();
    newyear = newyear.trim();
    // console.log(section,year,batch,newyear)
    if (!section || !year || !batch || !newyear) {
      return res
        .status(401)
        .json({ sucess: false, message: "please fill all the details" });
    }
    const sectionYear = section + year + "_" + batch;
    // console.log(sectionYear)

    const findSection = await Section.findOne({
      name: sectionYear,
      year: year,
      batch: batch,
    });

    if (!findSection) {
      return res
        .status(401)
        .json({ sucess: false, message: "section not found" });
    }
    const newSectionName = section + newyear + "_" + batch;

    const updatedSection = (findSection.name = newSectionName);
    findSection.year = newyear;
    await findSection.save();
    // const updatedStudents = await Student.updateMany(
    //   { section: sectionYear, year: year, batch: batch },
    //   { $set: { year: newyear } })
    const updatedStudents = findSection.students.forEach(async (studentId) => {
      await Student.updateOne({ _id: studentId }, { $set: { year: newyear } });
    });
    return res
      .status(200)
      .json({
        sucess: true,
        message: "year updated successfully",
        updatedSection,
        updatedStudents,
      });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ sucess: false, message: error.message });
  }
};

const getAllStudentBySection = async (req, res) => {
  try {
    let { year, batch, section } = req.query;
    // console.log(year, batch , section)
    section = section.toUpperCase();
    if (!year || !batch || !section) {
      return res
        .status(403)
        .json({ sucess: false, message: "please fill all the details" });
    }
    const Section_Year = section + year + "_" + batch;
    //console.log(Section_Year)
    const findSection = await Section.findOne({ name: Section_Year })
      .populate("students")
      .populate("teacher");

    if (!findSection) {
      return res
        .status(401)
        .json({ sucess: false, message: "section not found" });
    }

    const teachers = await Teacher.find({
      subjects: { $elemMatch: { $regex: `${Section_Year}$` } },
    }).select("name email subjects");

    const subjectFaculty = (findSection.subjects || []).map((subjectName) => {
      const subjectKey = `${subjectName}_${Section_Year}`;
      const matchedTeacher = teachers.find((teacher) =>
        Array.isArray(teacher.subjects) && teacher.subjects.includes(subjectKey)
      );
      return {
        subject: subjectName,
        faculty: matchedTeacher
          ? { id: matchedTeacher._id, name: matchedTeacher.name, email: matchedTeacher.email }
          : null,
      };
    });

    return res
      .status(201)
      .json({
        sucess: true,
        message: "students fetched sucessfully",
        findSection,
        subjectFaculty,
      });
  } catch (error) {
    console.log(error);
    return res.json({ sucess: false, message: error.message });
  }
};

const viewAttendance = async (req, res) => {
    

  try {
      
    const { studentId  } = req.body;
    const { date } = req.query;
    // console.log('DAT:', date, 'studentId:', studentId);

    if (!studentId || !date) {
      return res
        .status(403)
        .json({ sucess: false, message: "student id or date is missing" });
    }
    const findProfile = await Student.findById(studentId);

  
    if(!findProfile){
      return res
        .status(403)
        .json({ sucess: false, message: "student does not exist" });
    }
    const formattedDate = new Date(date);
    const arr = [];

      findProfile?.attendance.forEach((item) => {
            item.subject.forEach((subjects)=>{
                 
                const normalizedSubjectDate = new Date(subjects.date).toISOString().slice(0, 10);
                const normalizedFormattedDate = new Date(formattedDate).toISOString().slice(0, 10);
                // console.log(normalizedSubjectDate===normalizedFormattedDate);
              if (normalizedSubjectDate === normalizedFormattedDate) {
               arr.push({
                 subject: subjects.name,
                 totalLecture: subjects.totalnoLec,
                 lectureAttended: subjects.noofLecAttended,
               });
              }
            });
      });

      return res.status(200).json({
        sucess: true,
        semester: findProfile.semester,
        message: "Attendance fetched successfully",
        attendance: arr,
      });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ sucess: false, message: error.message });
    
  }
}

const requestStudentPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ sucess: false, message: "email is required" });
    }

    const student = await Student.findOne({ email }).select("+resetCodeHash +resetCodeExpires");
    if (!student) {
      return res.json({ sucess: false, message: "student not found" });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const salt = await genSalt(10);
    const codeHash = await bcrypt.hash(code, salt);

    student.resetCodeHash = codeHash;
    student.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await student.save();

    const mailResponse = await sendPasswordResetCode(student.email, student.name, code);
    if (!mailResponse.success) {
      return res.status(500).json({ sucess: false, message: "failed to send reset code" });
    }

    return res.json({ sucess: true, message: "reset code sent to email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

const requestStudentVerification = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ sucess: false, message: "email is required" });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const salt = await genSalt(10);
    const codeHash = await bcrypt.hash(code, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await StudentVerification.findOneAndUpdate(
      { email },
      { email, codeHash, expiresAt, name },
      { upsert: true, new: true }
    );

    const mailResponse = await sendStudentVerificationCode(email, name, code);
    if (!mailResponse.success) {
      return res.status(500).json({ sucess: false, message: "failed to send verification code" });
    }

    return res.json({ sucess: true, message: "verification code sent to email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

const registerStudentWithCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ sucess: false, message: "email and verification code are required" });
    }

    const record = await StudentVerification.findOne({ email });
    if (!record) {
      return res
        .status(400)
        .json({ sucess: false, message: "verification request not found" });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await StudentVerification.deleteOne({ email });
      return res
        .status(400)
        .json({ sucess: false, message: "verification code expired" });
    }

    const isMatch = await bcrypt.compare(verificationCode, record.codeHash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ sucess: false, message: "invalid verification code" });
    }

    // Proceed with normal registration
    await registerStudent(req, res);

    if (res.locals.registrationSuccess) {
      await StudentVerification.deleteOne({ email });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

const resetStudentPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ sucess: false, message: "email, code and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ sucess: false, message: "Password must be at least 6 characters" });
    }

    const student = await Student.findOne({ email }).select("+password +resetCodeHash +resetCodeExpires");
    if (!student || !student.resetCodeHash || !student.resetCodeExpires) {
      return res.json({ sucess: false, message: "reset request not found" });
    }

    if (student.resetCodeExpires.getTime() < Date.now()) {
      return res.json({ sucess: false, message: "reset code expired" });
    }

    const isMatch = await bcrypt.compare(code, student.resetCodeHash);
    if (!isMatch) {
      return res.json({ sucess: false, message: "invalid reset code" });
    }

    student.password = await hashpasssword(newPassword);
    student.resetCodeHash = undefined;
    student.resetCodeExpires = undefined;
    await student.save();

    return res.json({ sucess: true, message: "password reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { studentId, email, rollno } = req.body;

    if (!studentId) {
      return res.status(403).json({ sucess: false, message: "student id is missing" });
    }

    const nextEmail = email?.trim();
    const nextRollno = rollno?.trim();

    if (!nextEmail && !nextRollno) {
      return res.status(400).json({ sucess: false, message: "email or rollno is required" });
    }

    if (nextEmail) {
      const emailExists = await Student.findOne({
        email: nextEmail,
        _id: { $ne: studentId },
      });
      if (emailExists) {
        return res.json({ sucess: false, message: "email already in use" });
      }
    }

    if (nextRollno) {
      const rollnoExists = await Student.findOne({
        rollno: nextRollno,
        _id: { $ne: studentId },
      });
      if (rollnoExists) {
        return res.json({ sucess: false, message: "roll number already in use" });
      }
    }

    const updates = {};
    if (nextEmail) updates.email = nextEmail;
    if (nextRollno) updates.rollno = nextRollno;

    const updated = await Student.findByIdAndUpdate(studentId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ sucess: false, message: "student not found" });
    }

    return res.status(200).json({
      sucess: true,
      message: "profile updated successfully",
      profile: updated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export {
  registerStudent,
  requestStudentVerification,
  registerStudentWithCode,
  studentLogin,
  hashpasssword,
  generateToken,
  studentProfile,
  getAllStudent,
  changeYear,
  getAllStudentBySection,
  viewAttendance,
  requestStudentPasswordReset,
  resetStudentPassword,
  updateStudentProfile
};
