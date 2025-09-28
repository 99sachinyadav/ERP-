import jwt from 'jsonwebtoken'; 
const authTeacher = (req,res,next)=>{
    try {
        const {teachertoken ,admintoken} = req.headers;
        // console.log(req.headers); // Log the entire headers object to debug
    //    console.log(teachertoken , admintoken)
        if(!teachertoken&& !admintoken ){
          return res.status(402).json({sucess:false,message:"teacher credentials is not available"})
        }
       if(!teachertoken ){
   const adminDecodedToken = jwt.verify(admintoken, process.env.JWT_SECRET);
     if(adminDecodedToken.id!==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
            return res.status(403).json({sucess:false,message:" invalid token"})
         }
        //  console.log("hello")
         req.body.adminID = adminDecodedToken.id;
       } 
       else{
         const decodedToken = jwt.verify(teachertoken, process.env.JWT_SECRET);
         req.body.teacherId = decodedToken.id;
       }
        

        //console.log(decodedToken)
         
        
        next();
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({sucess:false,message:error.message})   
    }
}
 export  default authTeacher;   