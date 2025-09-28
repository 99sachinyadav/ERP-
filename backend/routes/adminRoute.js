
import express  from 'express'   
import { adminLogin, getAllTeacher } from "../controller/teacherconroller.js"
import { adminAuth } from '../middelware/adminAuth.js';
import { updateTeacherPassword ,updateStudentPassword } from '../controller/admincontroller.js';
import { changeSemesterorSection, changeStudentSection } from '../controller/sectioncontroller.js';
import { sendEmail, sendEmailStudent } from '../config/resend.js';

const adminRouter = express.Router()

adminRouter.post('/loginAdmin',adminLogin);
adminRouter.get('/getAllTeacher',adminAuth,getAllTeacher);
adminRouter.put('/updateTeacherPassword',adminAuth, updateTeacherPassword);
adminRouter.put('/updateStudentPassword',adminAuth, updateStudentPassword);
adminRouter.put('/updateSectionorSemester',adminAuth, changeSemesterorSection);
 
adminRouter.put('/changeStudentSection',adminAuth,changeStudentSection)

export {adminRouter}