import jwt from "jsonwebtoken"
const authStudent = async (req,res,next)=>{
    try {
       const {token} = req.headers;
        //    console.log(token)
       if(!token){
         return res.status(402).json({sucess:false,message:"token is not available"})
       }
      
       const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
       if(!decodedToken){
        return res.status(403).json({sucess:false,message:"token is not valid"})
       }
        const studentId= decodedToken.id;
        // console.log(studentId);

        req.body.studentId = studentId

        next();
    } catch (error) {
         console.log(error)
         return res.status(401).json({sucess:false,message:error.message})
    }
}

 export {authStudent};