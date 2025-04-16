import express from 'express'
import 'dotenv/config'
import { connectdb } from './config/dbconnect.js';
import { Router } from './routes/studentRoute.js';
import { teacherRouter } from './routes/teacherRoute.js';
import { adminRouter } from './routes/adminRoute.js';
import  cors from 'cors'

 connectdb()

 const app= express();
 app.use(cors())
 app.use(express.json()); 
 app.use('/api',Router)
 app.use('/api',teacherRouter)
 app.use('/api',adminRouter)
 // http://localhost:3000/api/registerStudent

 const port = process.env.PORT||5000;

 
 app.use('/',(req,res)=>{
    res.send("hello server ");
 })

app.listen(port,()=>{
   console.log(`app is listning on  the port ${port}`)
})