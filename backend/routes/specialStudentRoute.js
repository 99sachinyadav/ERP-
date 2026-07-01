import express from "express";
import { addSpecialStudent, getAllSpecialStudents } from "../controller/specialStudentcontroller.js";
import { adminAuth } from "../middelware/adminAuth.js";

const SpecialStudentRouter = express.Router();

SpecialStudentRouter.post("/addSpecialStudent", addSpecialStudent);
SpecialStudentRouter.put("/addSpecialStudent", addSpecialStudent);
SpecialStudentRouter.get("/getAllSpecialStudents", adminAuth, getAllSpecialStudents);

export default SpecialStudentRouter;