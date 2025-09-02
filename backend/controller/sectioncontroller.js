import { Section } from "../model/sectionmodel.js";
import { Teacher } from "../model/teachermodel.js";
import { Student } from "../model/studentmodel.js";
const Sectionregister = async (req, res) => {
  try {
    const { year, batch, teacheremail ,semester } = req.body;
    let { section } = req.body;
    section = section.toUpperCase().trim();
    // console.log(year)
    if (!section || !year || !batch || !semester) {
      return res
        .status(401)
        .json({ sucess: false, message: "please fill all the details" });
    }
    const yearSection = section + year + "_" + batch;
    // console.log(yearSection)
    const sectionExist = await Section.findOne({
      name: yearSection,
    });
    //console.log(sectionExist)
    if (sectionExist) {
      return res
        .status(401)
        .json({ success: false, message: "Section already exists" });
    }

    const teacherExists = await Teacher.findOne({ email: teacheremail });
    if (!teacherExists) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const newsection = await Section.create({
      name: yearSection,
      year: year,
      batch: batch,
      teacher: teacherExists._id,
      semester: semester,
    });
    // console.log(newsection)
    // Optionally, you can also update the teacher's record to include the section
    teacherExists.section = teacherExists.section || [];
    teacherExists.section.push(newsection._id);
    await teacherExists.save();

    res
      .status(200)
      .json({
        sucess: true,
        message: "Section created sucessfully",
        newsection,
      });
  } catch (error) {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};

const addSubjects = async (req, res) => {
  try {
    let { batch, year, subject ,semester } = req.body;
    let { section } = req.body;
    section = section.toUpperCase().trim();
    batch = batch.trim();
    year = year.trim();
    subject = subject.toUpperCase().trim();
    if (!section || !year || !batch || !subject || !semester) {
      return res
        .status(401)
        .json({ sucess: false, message: "please fill all the details" });
    }
    const yearSection = section + year + "_" + batch;
    console.log(yearSection);
    const sectionFind = await Section.findOne({
      name: yearSection,
    }).populate("students");

    if (!sectionFind) {
      return res
        .status(203)
        .json({ sucess: false, message: "Section not found" });
    }
    //  console.log(sectionFind)
    if (sectionFind.semester !== semester) {
       return res
         .status(401)
         .json({ sucess: false, message: "Semester mismatch" });

    }

     const semsubject= sectionFind.semester + "_" + subject;
    const subjectExists = sectionFind.subjects.find((sub) => sub === semsubject);
    if (subjectExists) {
      return res
        .status(401)
        .json({ success: false, message: "Subject already exists" });
    }
    sectionFind.subjects.push(semsubject);
    await sectionFind.save();

    sectionFind.students.forEach((student) => {
      student.subjects.push(semsubject);
      student.save();
    });

    res
      .status(200)
      .json({
        sucess: true,
        message: "Subject added sucessfully",
        sectionFind,
      });
  } catch (error) {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};

const changeSemesterorSection = async (req,res)=>{
  try {
    const { currentSection,currentYear,currentBatch,newSemester,newSection} = req.body;
    if(!currentSection || !currentYear || !currentBatch || !newSemester || !newSection){
      return res
        .status(401)
        .json({ sucess: false, message: "please fill all the details" });
    }

    const yearSection = currentSection + currentYear + "_" + currentBatch;
    const sectionExist = await Section.findOne({ name: yearSection });
    if (!sectionExist) {
      return res
        .status(401)
        .json({ success: false, message: "Section does not exists check details" });
    }
     const updatedsectionname = newSection + currentYear + "_" + currentBatch;
     const alreadyExistedSection = await Section.findOne({ name: updatedsectionname });
     if (alreadyExistedSection && newSection !== currentSection) {
       return res
         .status(401)
         .json({ success: false, message: " Section already exists with the new details please choose another name" });
     }
     sectionExist.name = updatedsectionname;
     sectionExist.semester = newSemester;
     sectionExist.section = newSection;

     await sectionExist.save();
 sectionExist.students.forEach(async (studentId) => {
      await Student.updateOne({ _id: studentId }, { $set: { semester: newSemester, section: newSection } });
 }
)

    
    res
      .status(200)
      .json({
        success: true,
        message: "Section or semester changed successfully",
      });
  } catch (error) {
      console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
}

export { Sectionregister, addSubjects, changeSemesterorSection };
