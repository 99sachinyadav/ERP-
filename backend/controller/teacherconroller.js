import { Section } from "../model/sectionmodel.js";
import { Teacher } from "../model/teachermodel.js";
import { generateToken,hashpasssword } from "./studentcontroller.js";


const registerTeacher = async (req,res)=>{

    try {
        const {name ,email, password,section}= req.body;
        if(!name ||!email || !password){
            return res.status(403).json({sucess:false,message:"kindly fill you full details"})
        }

        const ExistedTeacher = await Teacher.findOne({
            $or :[{email:email,password:password}]
        })
        if(ExistedTeacher){
            return res.status(401).json({sucess:false,message:"faculty already exist"})
        }
       const hashedPassword = await hashpasssword(password)
        const teacher = await Teacher.create({
            name:name,
            email:email,
            password:hashedPassword
        })

        const teacherToken =  generateToken(teacher._id)

   
     

    const newsection = await Section.findOne({name:section});
    if (!newsection) {
        return res.status(404).json({ success: false, message: "Section not found" });
    }

    if (!newsection.teacher) {
        newsection.teacher = teacher._id;
    } else {
        return res.status(400).json({ success: false, message: "Section already has a teacher assigned" });
    }
    await newsection.save();

    return res.status(201).json({ success: true, message: 'Teacher saved successfully and attached to section', teacherToken });
        
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({sucess:false,message:error.message})
    }
}




export { registerTeacher };