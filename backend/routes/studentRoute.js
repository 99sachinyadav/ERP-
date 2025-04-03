import express  from 'express'
import { registerStudent } from '../controller/studentcontroller.js';
import {Sectionregister } from '../controller/sectioncontroller.js';


const Router = express.Router();


Router.post('/registerStudent',registerStudent);
Router.post('/createSection',Sectionregister)



 export {Router}