import jwt from 'jsonwebtoken'; 
const authTeacher = (req,res,next)=>{
    try {
        const {teachertoken} = req.headers;
       // console.log(req.headers); // Log the entire headers object to debug
        if(!teachertoken){
          return res.status(402).json({sucess:false,message:"token is not available"})
        }
        const decodedToken = jwt.verify(teachertoken, process.env.JWT_SECRET);

        //console.log(decodedToken)

        req.body.teacherId = decodedToken.id;
        next();
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({sucess:false,message:error.message})   
    }
}
 export  default authTeacher;   