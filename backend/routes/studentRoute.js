import express  from 'express'
import { changeYear, getAllStudent, getAllStudentBySection, registerStudent, studentLogin, studentProfile, viewAttendance, requestStudentPasswordReset, resetStudentPassword } from '../controller/studentcontroller.js';
import {Sectionregister } from '../controller/sectioncontroller.js';
import { adminAuth } from '../middelware/adminAuth.js';
import { authStudent } from '../middelware/userAuth.js';
import { adminLogin } from '../controller/teacherconroller.js';
import upload from '../config/upload.js';
const Router = express.Router();


Router.post('/registerStudent', upload.single('image'),registerStudent);
Router.post('/createSection',adminAuth,Sectionregister)
Router.get('/getProfile',authStudent,studentProfile)
Router.post('/loginStudent',studentLogin)
Router.get('/getStudent',adminAuth,getAllStudent)
Router.post('/changeYear',adminAuth,changeYear)
Router.get('/getStudentAttendance',authStudent,viewAttendance)
Router.post('/requestStudentPasswordReset',requestStudentPasswordReset)
Router.post('/resetStudentPassword',resetStudentPassword)

 


 export {Router}
