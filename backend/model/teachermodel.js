
import mongoose from "mongoose";

const teacherSchema  = new mongoose.Schema({

    name:{
        type:String,
        required:true,
    },
   
     
    password:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true, 
        
    },
    section:[{type:mongoose.Schema.Types.ObjectId, ref:'Section', required:true}],
    subjects:[{type:String}]
},{timestamps:true})

export const Teacher = mongoose.model('Teacher',teacherSchema)