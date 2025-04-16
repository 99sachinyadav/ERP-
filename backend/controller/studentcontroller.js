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
        
        const { firstname, lastname,father_name,  email, password, rollno, section, year,batch, dob, gender, contactinfo } = req.body;
        const { address, phoneNO } = contactinfo || {}; 
        //console.log(firstname,lastname , father_name,email,password,rollno,section,year,dob,gender,address )
        if (!firstname  || !email || !password || !rollno || !section || !year || !dob || !gender || !address || !batch) {
            return res.status(401).json({ success: false, message: "Please enter the full data" });
        }

     //console.log(phoneNO)

    // Check if student exists and convert it to ObjectId
   
   const existedStudent =  await Student.findOne({
    $or: [{ email: email }, { rollno: rollno }]
    })

    if(existedStudent){
      return   res.json({sucess:false, message:'User already exist'});
    }
    const sectionYear = section+year+"_"+batch;
    console.log(sectionYear)
    const sectionExist = await Section.findOne({ name: sectionYear ,year:year, batch: batch });
    if (!sectionExist) {
        return res.status(401).json({ success: false, message: `Section ${section} not found in year ${year} and batch ${batch}` });  
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
        batch:batch,
        dob:dob,
        gender:gender,
        contactinfo:{
            address:address,
            phoneNo:phoneNO,
        }
    })

    await Section.updateOne(
      { _id: sectionExist._id }, // Ensure the correct section is targeted
      { $push: { students: student._id } } // Push student ID into the student array
    );
    

   
   
    const studentToken = generateToken(student._id)
    return res.status(200).json({sucess:true,message:'user saved sucessfully',studentToken})

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
      }).select('+password');
      if(!student){
        return res.json({sucess:false,message:'student not found'})
      }
      console.log(password);
      console.log(student.password)
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


const studentProfile = async (req,res)=>{
       try {

        const {studentId} = req.body;

          
        if(!studentId){
          return res.status(403).json({sucess:false,message:"student id is missing"})
        }
         const findProfile = await  Student.findById(studentId)

           if(!findProfile){
            return res.status(403).json({sucess:false,message:"student does not exist"})
           }

           return res.status(200).json({sucess:true, message:"student profile fetched successfully", profile: findProfile})
           
        
       } catch (error) {
           console.log(error)
           return res.status(401).json({sucess:false,message:error.mesage})
       }
      }
   
  const getAllStudent = async (req,res)=>{
    try {

        const  findAllstudent = await Student.find({});
        if(!findAllstudent){
          return res.status(401).json({sucess:false,message:"no student is registered now"})
        }
      return res.status(200).json({sucess:true,message:"all student fetched sucessfully",findAllstudent})
      
    } catch (error) {
        console.log(error)
        return res.status(403).json({sucess:false,message:error.message})
    }
  }

  const changeYear = async (req,res)=>{
    try {
      
      const {section, year,batch,newyear} = req.body;
      if(!section || !year || !batch){
        return res.status(401).json({sucess:false,message:"please fill all the details"})
      }
      const sectionYear = section+year+"_"+batch;

      const findSection = await Section.findOne({name:sectionYear,year:year,batch:batch});
      
      if(!findSection){
        return res.status(401).json({sucess:false,message:"section not found"})
      }
      const newSectionName = section+newyear+"_"+batch;

      const updatedSection =findSection.name = newSectionName;
      findSection.year = newyear;
      await findSection.save(); 
      // const updatedStudents = await Student.updateMany(
      //   { section: sectionYear, year: year, batch: batch },
      //   { $set: { year: newyear } })
    const updatedStudents=findSection.students.forEach(async (studentId) => {

          await Student.updateOne({ _id: studentId }, { $set: { year: newyear } });
       })
        return res.status(200).json({sucess:true,message:'year updated successfully',updatedSection,updatedStudents})


        }
     catch (error) {
      console.log(error)
      return res.status(403).json({sucess:false,message:error.message})
    }
  }
  
      

export {registerStudent,studentLogin,hashpasssword,generateToken,studentProfile,getAllStudent,changeYear}