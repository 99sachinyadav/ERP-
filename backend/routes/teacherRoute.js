import express from "express"
import { attendancebyTeacher, getAttendanceofAllStudent, registerTeacher, teacherLogin, updateTeacherInSection } from "../controller/teacherconroller.js";
import { adminAuth } from "../middelware/adminAuth.js";
import  authTeacher from "../middelware/teacherAuth.js";
import { addSubjects } from "../controller/sectioncontroller.js";
import { getAllStudentBySection } from "../controller/studentcontroller.js";
 

const teacherRouter = express.Router();

teacherRouter.post('/registerTeacher',adminAuth,registerTeacher)
teacherRouter.post('/loginTeacher',teacherLogin)
teacherRouter.post('/markAttendance',authTeacher,attendancebyTeacher);
teacherRouter.put('/updateTeacher',adminAuth,updateTeacherInSection)
teacherRouter.get('/getattandanceStudent',authTeacher,getAttendanceofAllStudent);
teacherRouter.post('/addSubjects',authTeacher,addSubjects);
teacherRouter.get('/gelStudentBySection',authTeacher,getAllStudentBySection)
export {teacherRouter}