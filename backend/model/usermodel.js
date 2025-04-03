
import mongoose from "mongoose";


const  userSchema = new mongoose.Schema({

    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        minlength:[3,'lastname must contain atleast three letter'],
    },

    section:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'Section',
    },

    email:{
     type:String,
     unique:true,
     required:true,
    },

    password:{
        type:String,
        required :true,
    },
    role:{
       type:String,
       enum:['Student' , 'Teacher'],
       default:'Student',
    },

    profile_image:{
      type:String,
    }



},{timestamps:true}) 

export const User = mongoose.model('User', userSchema);

// iq0YQW13irro9KoY

// sy7841846

// mongodb+srv://sy7841846:iq0YQW13irro9KoY@cluster0.jglzv.mongodb.net/