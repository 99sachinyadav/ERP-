import { Section } from "../model/sectionmodel.js";
import { Student } from "../model/studentmodel.js";
import bcrypt, { genSalt } from "bcrypt"
import jwt from "jsonwebtoken"

const hashpasssword = async (password)=>{
       
        if(!password){
            res.status(403).json({sucess:false,message:'password is not available'});
        }

        const salt = await genSalt(10)
        const hashpasssword = await bcrypt.hash(password,salt);
        //console.log(hashpasssword)
        return hashpasssword;

}

const generateToken = (id)=>{
     const token = jwt.sign({id},process.env.JWT_SECRET);
     return token;
}



const registerStudent = async(req,res)=>{
    try {
        
        const { firstname, lastname,father_name,  email, password, rollno, section, year, dob, gender, contactinfo } = req.body;
    const { address, phoneNO } = contactinfo || {}; 
     //console.log(firstname,lastname , father_name,email,password,rollno,section,year,dob,gender,address )
     if (!firstname  || !email || !password || !rollno || !section || !year || !dob || !gender || !address) {
        return res.status(401).json({ success: false, message: "Please enter the full data" });
    }

     //console.log(phoneNO)

    // Check if section exists and convert it to ObjectId
   
   const existedStudent =  await Student.findOne({
    $or: [{ email: email }, { rollno: rollno }]
    })

    if(existedStudent){
      return   res.json({sucess:false, message:'User already exist'});
    }

    
    const student = await Student.create({
        firstname:firstname,
        lastname:lastname,
        email:email,
        year:year,
        father_name:father_name,
        password: await hashpasssword(password),
        section:section,
        rollno:rollno,
        dob:dob,
        gender:gender,
        contactinfo:{
            address:address,
            phoneNo:phoneNO,
        }
    })

   
    const sectionExist = await Section.findOne({ name: section ,Year:year });
    if (!sectionExist) {
        return res.status(401).json({ success: false, message: `Section ${section} not found in year ${year}`});
    }
    await Section.updateOne(
      { _id: sectionExist._id }, // Ensure the correct section is targeted
      { $push: { students: student._id } } // Push student ID into the student array
    );
    const studentToken = generateToken(student._id)
    res.status(200).json({sucess:true,message:'user saved sucessfully',studentToken})

    } catch (error) {
        console.log(error.message);
        res.json({sucess:false,message:error.message})
    }
}


const studentLogin = async (req,res)=>{
   try {
  
     const {password,email} =req.body
     if(!password || !email){
        return res.status(401).json({sucess:false,message:'password or email is missing'})
     }
      const student = await Student.findOne({
        $or:[{email:email},{password:password}]
      })
      if(!student){
        return res.json({sucess:false,message:'student not found'})
      }
       const isMatch = await bcrypt.compare(password,student.password)

       if(!isMatch){
        return res.json({sucess:false,message:' invalid password'})
       }
       else{
         const refreshToken = generateToken(student._id)
         return res.status(200).json({sucess:true ,message:'login sucessfully ',refreshToken})
       }

    
   } catch (error) {
      console.log(error.message)
      res.json({sucess:false,message:error.message})
   }
}



export {registerStudent,hashpasssword,generateToken}