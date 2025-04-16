import express from "express"
import { attendancebyTeacher, getAttendanceofAllStudent, registerTeacher, teacherLogin, updateTeacherInSection } from "../controller/teacherconroller.js";
import { adminAuth } from "../middelware/adminAuth.js";
import  authTeacher from "../middelware/teacherAuth.js";
 

const teacherRouter = express.Router();

teacherRouter.post('/registerTeacher',adminAuth,registerTeacher)
teacherRouter.post('/loginTeacher',teacherLogin)
teacherRouter.post('/markAttendance',authTeacher,attendancebyTeacher);
teacherRouter.put('/updateTeacher',adminAuth,updateTeacherInSection)
teacherRouter.get('/getattandanceStudent',authTeacher,getAttendanceofAllStudent)
export {teacherRouter}