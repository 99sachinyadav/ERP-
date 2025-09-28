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
    console.log("my",error.message);
    res.json({ sucess: false, message: error.message });
  }
};

const addSubjects = async (req, res) => {
  try {
    let { batch, year, subject ,semester,teacheremail } = req.body;
    let { section } = req.body;
    section = section.toUpperCase().trim();
    batch = batch.trim();
    year = year.trim();
    subject = subject.toUpperCase().trim();
    if (!section || !year || !batch || !subject || !semester || !teacheremail) {
      return res
        .status(401)
        .json({ sucess: false, message: "please fill all the details" });
    }
  
    const yearSection = section + year + "_" + batch;
    // console.log(yearSection);
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

      const teacherExists = await Teacher.findOne({ email: teacheremail });
    if (!teacherExists) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    const subjectWithSemAndYear = sectionFind.semester + "_" + subject+"_"+yearSection;
    teacherExists.subjects = teacherExists.subjects || [];
    if (!teacherExists.subjects.includes(subjectWithSemAndYear)) {
      teacherExists.subjects.push(subjectWithSemAndYear);
      await teacherExists.save();
    }

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

const changeStudentSection =  async (req,res)=>{
    
  try {
     const {year ,batch,newyear,studentId}= req.body;
     let{section,newsection}=req.body;

     section=section.toUpperCase();
     newsection=newsection.toUpperCase();
      // console.log(year ,batch,newyear,studentId,section,newsection)
     if(!year||!batch||!section||!newsection||!newyear||!studentId){
      return res.status(401).json({sucess:false,message:"please fill all the details"});
     }
      
     const sectionyear = section + year + "_" + batch;
  const newSectionYear = newsection + newyear + "_" + batch;

  const currentSection = await Section.findOne({ name: sectionyear });
  const targetSection = await Section.findOne({ name: newSectionYear });

  if (!currentSection || !targetSection) {
    return res.status(404).json({ sucess: false, message: "Section not found" });
  }

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ sucess: false, message: "Student not found" });
  }

  // Remove student from current section
  if (targetSection.students.includes(student._id)) {
    return res.status(400).json({ sucess: false, message: "Student already in the target section" });
  }
  currentSection.students = currentSection.students.filter(
    (id) => id.toString() !== studentId
  );
  await currentSection.save();

   

  // Add student to new section
  
  targetSection.students.push(student._id);
  await targetSection.save();

  // Update student's section and year

  if(Array.isArray(student.subjects)){
     const oldSubjects = currentSection.subjects;
     const newSubjects = targetSection.subjects;
     // Remove old subjects

     console.log("Old Subjects:", oldSubjects);
     console.log("New Subjects:", newSubjects);
     student.subjects = student.subjects.filter(sub => !oldSubjects.includes(sub));
     // Add new subjects
     newSubjects.forEach(sub => {
       if (!student.subjects.includes(sub)) {
         student.subjects.push(sub);
       }
     });

  }
  student.section = newsection;
  student.year = newyear;
  await student.save();

  res.status(200).json({
    sucess: true,
    message: "Student section changed successfully",
  });
   

    
  } catch (error) {
     console.log("hello",error.message)
     return res.status(401).json({sucess:false,message:error.message})
  }


}

export { Sectionregister, addSubjects, changeSemesterorSection ,changeStudentSection};
