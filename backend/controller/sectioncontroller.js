import {Section} from "../model/sectionmodel.js";

const Sectionregister = async (req,res)=>{
   try {
    const {section ,year,teacher} = req.body
    if(!section ||!year ){
        return res.status(401).json({sucess:false,message:'section data is not available'})
    }
    const sectionExist = await Section.findOne({ name: section });
    if (sectionExist) {
        return res.status(401).json({ success: false, message: "Section already exists" });
    }
    
    const newsection = await Section.create({
        name:section,
        Year:year,
        teacher:teacher,
    })
    
    res.status(200).json({sucess:true,message:'user saved sucessfully',newsection})

}
catch (error) {
    console.log(error.message);
    res.json({sucess:false,message:error.message})
}

}

export  {Sectionregister}