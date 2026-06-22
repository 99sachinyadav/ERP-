import express from 'express'
import 'dotenv/config'
import { connectdb } from './config/dbconnect.js';
import { Router } from './routes/studentRoute.js';
import { teacherRouter } from './routes/teacherRoute.js';
import { adminRouter } from './routes/adminRoute.js';
import { leaveRouter } from './routes/leaveRoute.js';
import  cors from 'cors'
import { setServers } from "node:dns/promises";
import mongoose from "mongoose";

// 1️⃣ Set DNS servers
setServers(["1.1.1.1", "8.8.8.8"]);

 await connectdb()

 const app= express();
 app.use(cors())
 app.use(express.json({ limit: "4mb" })); 
 app.use('/api',Router)
 app.use('/api',teacherRouter)
 app.use('/api',adminRouter)
 app.use('/api',leaveRouter)
 // http://localhost:3000/api/registerStudent

 const port = process.env.PORT||5000;

 
 app.use('/',(req,res)=>{
    res.send("hello server");
 })

app.listen(port,()=>{
   console.log(`app is listning on  the port ${port}`)
})
