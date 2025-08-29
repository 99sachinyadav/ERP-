import { Section } from "../model/sectionmodel.js";
import { Student } from "../model/studentmodel.js";
import bcrypt, { genSalt } from "bcrypt";
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
    const {
      name,
      father_name,
      email,
      password,
      rollno,
      year,
      batch,
      dob,
      contactinfo,
      semester,
    } = req.body;
    let { section } = req.body; // Destructure section from req.body
    const { address, phoneNO } = contactinfo || {};
    console.log(name  , father_name,email,password,rollno,section,year,dob,address,semester )
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
      return res
        .status(401)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    } //console.log(phoneNO)
    if (phoneNO && phoneNO.length === 10) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
    } // Check if student exists and convert it to ObjectId
    section = section.toUpperCase(); // Convert section to uppercase
    const existedStudent = await Student.findOne({
      $or: [{ email: email }, { rollno: rollno }],
    });

    if (existedStudent) {
      return res.json({ sucess: false, message: "User already exist" });
    }
    const sectionYear = section + year + "_" + batch;
    // console.log(sectionYear)
    const sectionExist = await Section.findOne({
      name: sectionYear,
      year: year,
      batch: batch,
      
    });
    if (!sectionExist) {
      return res
        .status(401)
        .json({
          success: false,
          message: `Section ${section} not found in year ${year} and batch ${batch}`,
        });
    }
    if(sectionExist.semester !== semester){
      return res
        .status(401)
        .json({
          success: false,
          message: `Section ${section} is not available for semester ${semester}`,
        });
    }

    const student = await Student.create({
      name: name,
      email: email,
      year: year,
      father_name: father_name,
      password: await hashpasssword(password),
      section: section,
      rollno: rollno,
      batch: batch,
      dob: dob,
      semester: semester,

      contactinfo: {
        address: address,
        phoneNo: phoneNO,
      },
    });

    await Section.updateOne(
      { _id: sectionExist._id }, // Ensure the correct section is targeted
      { $push: { students: student._id } } // Push student ID into the student array
    );

    student.subjects = sectionExist.subjects; // Assuming 'subjects' is the array in Section model
    await student.save();

    const studentToken = generateToken(student._id);
    return res
      .status(200)
      .json({ sucess: true, message: "student saved sucessfully", name: student.name, studentToken });
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
    //console.log(year, batch , section)
    section = section.toUpperCase();
    if (!year || !batch || !section) {
      return res
        .status(403)
        .json({ sucess: false, message: "please fill all the details" });
    }
    const Section_Year = section + year + "_" + batch;
    //console.log(Section_Year)
    const findSection = await Section.findOne({ name: Section_Year }).populate(
      "students"
    ).populate("teacher");

    if (!findSection) {
      return res
        .status(401)
        .json({ sucess: false, message: "section not found" });
    }

    return res
      .status(201)
      .json({
        sucess: true,
        message: "student fetched sucessfully",
        findSection,
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
    console.log('DAT:', date, 'studentId:', studentId);

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
        message: "Attendance fetched successfully",
        attendance: arr,
      });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ sucess: false, message: error.message });
    
  }
}

export {
  registerStudent,
  studentLogin,
  hashpasssword,
  generateToken,
  studentProfile,
  getAllStudent,
  changeYear,
  getAllStudentBySection,
  viewAttendance
};
