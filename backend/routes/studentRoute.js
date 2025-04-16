import express  from 'express'
import { changeYear, getAllStudent, registerStudent, studentLogin, studentProfile } from '../controller/studentcontroller.js';
import {Sectionregister } from '../controller/sectioncontroller.js';
import { adminAuth } from '../middelware/adminAuth.js';
import { authStudent } from '../middelware/userAuth.js';
import { adminLogin } from '../controller/teacherconroller.js';

const Router = express.Router();


Router.post('/registerStudent',adminAuth,registerStudent);
Router.post('/createSection',adminAuth,Sectionregister)
Router.get('/getProfile',authStudent,studentProfile)
Router.post('/loginStudent',studentLogin)
Router.get('/getStudent',adminAuth,getAllStudent)
Router.post('/changeYear',adminAuth,changeYear)
 


 export {Router}