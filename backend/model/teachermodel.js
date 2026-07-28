
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
        unique:true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address",
        ],
        
    },
    section: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true }],
    subjects: [{ type: String }],
    department: {
        type: String,
        enum: ["AIML/CSE/IT", "ECE/EN", "APPLIED/STAFF", "ADMINISTRATOR"],
        // required: true,
        // default: "STAFF"
    },
    role: {
        type: String,
        enum: ["Faculty", "HOD",'STAFF'],
        // default: "Faculty"

    }


    
},{timestamps:true})

export const Teacher = mongoose.model('Teacher',teacherSchema)
