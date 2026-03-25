
import express  from 'express'   
import { adminLogin, deanLogin, directorLogin, getAllTeacher } from "../controller/teacherconroller.js"
import { adminAuth } from '../middelware/adminAuth.js';
import { updateTeacherPassword ,updateStudentPassword } from '../controller/admincontroller.js';
import { changeSemesterorSection, changeStudentSection, removeSubjectFromSection } from '../controller/sectioncontroller.js';
import { sendEmail, sendEmailStudent } from '../config/resend.js';

const adminRouter = express.Router()

adminRouter.post('/loginAdmin',adminLogin);
adminRouter.post('/loginDean',deanLogin);
adminRouter.post('/loginDirector',directorLogin);
adminRouter.get('/getAllTeacher',adminAuth,getAllTeacher);
adminRouter.put('/updateTeacherPassword',adminAuth, updateTeacherPassword);
adminRouter.put('/updateStudentPassword',adminAuth, updateStudentPassword);
adminRouter.put('/updateSectionorSemester',adminAuth, changeSemesterorSection);
 
adminRouter.put('/changeStudentSection',adminAuth,changeStudentSection)
adminRouter.post('/removeSubject',adminAuth,removeSubjectFromSection)

export {adminRouter}
