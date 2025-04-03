import express from "express"
import { registerTeacher } from "../controller/teacherconroller.js";
 

const teacherRouter = express.Router();

teacherRouter.post('/registerTeacher',registerTeacher)
export {teacherRouter}