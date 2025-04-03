import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    Year:{
        type:String,
        required:true,
    },
    students:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Student',
        }
    ],
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Teacher',
        
    }
},{timestamps:true})


export const Section = mongoose.model('Section',sectionSchema)