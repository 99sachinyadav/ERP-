import mongoose from "mongoose";

const   specialStudentSchema = new mongoose.Schema({

       name:{
        type:String,
        required:true,
       },
       section:{
        type:String,
        required:true
       
     },
     Year:{
        type:String,
        required:true
     },
     Batch:{
        type:String,
        required:true
    },
    rollno:{
        type:String,
        required:true,
    },

    Remarks:{
        type:String,
        required:true
    },
      
      Date:{
        type:Date,
        required:true
      }
    },{timestamps:true})

export const SpecialStudent = mongoose.model('SpecialStudent',specialStudentSchema)




