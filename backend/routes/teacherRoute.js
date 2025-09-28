import express from "express"
import { attendancebyTeacher, getAttendanceofAllStudent, registerTeacher, teacherLogin, updateTeacherInSection } from "../controller/teacherconroller.js";
import { adminAuth } from "../middelware/adminAuth.js";
import  authTeacher from "../middelware/teacherAuth.js";
import { addSubjects } from "../controller/sectioncontroller.js";
import { getAllStudentBySection } from "../controller/studentcontroller.js";
import { sendEmailStudent } from "../config/resend.js";
 

const teacherRouter = express.Router();

teacherRouter.post('/registerTeacher',adminAuth,registerTeacher)
teacherRouter.post('/loginTeacher',teacherLogin)
teacherRouter.post('/markAttendance',authTeacher,attendancebyTeacher);
teacherRouter.put('/updateTeacher',adminAuth,updateTeacherInSection)
teacherRouter.get('/getattandanceStudent',authTeacher,getAttendanceofAllStudent);
teacherRouter.post('/addSubjects',adminAuth,addSubjects);
teacherRouter.get('/gelStudentBySection',authTeacher,getAllStudentBySection)
teacherRouter.post("/send-email", authTeacher,sendEmailStudent);
export {teacherRouter}
