import {Section} from "../model/sectionmodel.js";
import { Teacher } from "../model/teachermodel.js";

const Sectionregister = async (req,res)=>{
   try {
    const {section ,year,batch,teacheremail} = req.body
   // console.log(year)
    if(!section ||!year || !batch){
        return res.status(401).json({sucess:false,message:'please fill all the details'})
    }
    const yearSection= section+year+"_"+batch
    console.log(yearSection)
    const sectionExist = await Section.findOne({
        name: yearSection,
        year: year,
        batch: batch
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
    console.log(newsection) 
    // Optionally, you can also update the teacher's record to include the section
    teacherExists.section = teacherExists.section || [];
    teacherExists.section.push(newsection._id);
    await teacherExists.save();
    
    res.status(200).json({sucess:true,message:'user saved sucessfully',newsection})

}
catch (error) {
    console.log(error.message);
    res.json({sucess:false,message:error.message})
}

}

export  {Sectionregister}