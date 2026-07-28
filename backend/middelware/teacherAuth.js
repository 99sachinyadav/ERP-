import jwt from 'jsonwebtoken'; 
import { Teacher } from '../model/teachermodel.js';
import { Staff } from '../model/staffmodel.js';

const authTeacher = async (req,res,next)=>{
    try {
        const {teachertoken ,admintoken} = req.headers;
        if(!teachertoken&& !admintoken ){
          return res.status(402).json({sucess:false,message:"teacher credentials is not available"})
        }
       if(!teachertoken ){
         const adminDecodedToken = jwt.verify(admintoken, process.env.JWT_SECRET);
         const adminIds = [
           process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD,
           process.env.DEAN_EMAIL + process.env.DEAN_PASSWORD,
           process.env.DIRECTOR_EMAIL + process.env.DIRECTOR_PASSWORD,
         ].filter(Boolean);

         if(!adminIds.includes(adminDecodedToken.id)){
             return res.status(403).json({sucess:false,message:" invalid token"})
          }
          req.body.adminID = adminDecodedToken.id;
        } 
        else{
          const decodedToken = jwt.verify(teachertoken, process.env.JWT_SECRET);
          req.body.teacherId = decodedToken.id;
          
          const isTeacher = await Teacher.exists({ _id: decodedToken.id });
          if (isTeacher) {
            req.body.userType = "Teacher";
          } else {
            const isStaff = await Staff.exists({ _id: decodedToken.id });
            if (isStaff) {
              req.body.userType = "Staff";
            } else {
              return res.status(403).json({sucess:false,message:"invalid teacher or staff token"})
            }
          }
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({sucess:false,message:error.message})   
    }
}
export default authTeacher;
