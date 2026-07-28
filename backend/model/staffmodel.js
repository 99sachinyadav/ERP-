import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true, 
        unique: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address",
        ],
    },
    department: {
        type: String,
         enum: ["AIML/CSE/IT", "ECE/EN", "APPLIED/STAFF", "ADMINISTRATOR"],
        
       
    },
    role: {
        type: String,
        default: "STAFF"
    }
}, { timestamps: true });

export const Staff = mongoose.model('Staff', staffSchema);
