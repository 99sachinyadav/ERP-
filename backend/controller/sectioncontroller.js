import {Section} from "../model/sectionmodel.js";
import { Teacher } from "../model/teachermodel.js";

const Sectionregister = async (req,res)=>{
   try {
    const { year,batch,teacheremail} = req.body
    let { section } = req.body;
    section=section.toUpperCase().trim();
   // console.log(year)
    if(!section ||!year || !batch){
        return res.status(401).json({sucess:false,message:'please fill all the details'})
    }
    const yearSection= section+year+"_"+batch
    // console.log(yearSection)
    const sectionExist = await Section.findOne({
       name:yearSection,
    });
    //console.log(sectionExist)
    if (sectionExist) {
        return res.status(401).json({ success: false, message: "Section already exists" });
    }
    
    const teacherExists = await Teacher.findOne({email:teacheremail});
    if (!teacherExists) {
        return  res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const newsection = await Section.create({
        name: yearSection,
        year: year,
        batch: batch,
         teacher: teacherExists._id,
    });
    // console.log(newsection) 
    // Optionally, you can also update the teacher's record to include the section
    teacherExists.section = teacherExists.section || [];
    teacherExists.section.push(newsection._id);
    await teacherExists.save();
    
    res.status(200).json({sucess:true,message:'Section created sucessfully',newsection})

}
catch (error) {
    console.log(error.message);
    res.json({sucess:false,message:error.message})
}

}

const addSubjects = async(req,res)=>{
      try {
        let { batch ,year, subject } = req.body
        let { section } = req.body;
        section=section.toUpperCase().trim();
        batch=batch.trim();
        year=year.trim();
        subject=subject.trim();
        if(!section ||!year || !batch || !subject){
            return res.status(401).json({sucess:false,message:'please fill all the details'})
        }
        const yearSection= section+year+"_"+batch
        console.log(yearSection)
          const sectionFind = await Section.findOne({
            name: yearSection,
         
          })

          if(!sectionFind){
           return res.status(203).json({sucess:false,message:"Section not found"})
          }

          const  subjectExists = sectionFind.subjects.find((sub) => sub === subject);
            if (subjectExists) {
                return res.status(401).json({ success: false, message: "Subject already exists" }); 

            }
            sectionFind.subjects.push(subject);
            await sectionFind.save();   
            res.status(200).json({sucess:true,message:'Subject added sucessfully',sectionFind}) 
      } catch (error) { 
        console.log(error.message); 
        res.json({sucess:false,message:error.message})  
      }
}


export  {Sectionregister,addSubjects}