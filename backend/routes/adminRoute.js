
import express  from 'express'   
import { adminLogin, getAllTeacher } from "../controller/teacherconroller.js"
import { adminAuth } from '../middelware/adminAuth.js';

const adminRouter = express.Router()

adminRouter.post('/loginAdmin',adminLogin);
adminRouter.get('/getAllTeacher',adminAuth,getAllTeacher);

export {adminRouter}