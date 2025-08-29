import { hashpasssword } from "./studentcontroller.js";
import {Teacher} from "../model/teachermodel.js";
import {Student} from "../model/studentmodel.js";
const updateTeacherPassword = async (req,res)=>{
    try {
        const { teacheremail, newPassword } = req.body;
            console.log(teacheremail ,newPassword)
        // Validate input
        if (!teacheremail || !newPassword) {
            return res.status(400).json({sucess:false, message: "Teacher email or new password are required." });
        }
       if(newPassword.length <6){
         return res.status(402).json({susess:false,message:"password must contain atleast 6 Characters"})
       }
        // Find the teacher by email
        const teacher = await Teacher.findOne({ email: teacheremail });
        if (!teacher) {
            return res.status(404).json({sucess:false, message: "Teacher not found." });
        }

        // Update the password
        teacher.password = await hashpasssword(newPassword);
        await teacher.save();

        return res.status(200).json({sucess:true, message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating teacher password:", error);
        return res.status(500).json({sucess:false, message: "Internal server error." });
    }

}



    const updateStudentPassword = async (req, res) => {
    try {
        const { studentemail, newPassword } = req.body;

        // Validate input
        if (!studentemail || !newPassword) {
            return res.status(400).json({sucess:false, message: "Student email and new password are required." });
        }

        // Find the student by email
        const student = await Student.findOne({  email: studentemail });
        if (!student) {
            return res.status(404).json({sucess:false, message: "Student not found." });
        }
        if(newPassword.length <6){
         return res.status(402).json({susess:false,message:"password must contain atleast 6 Characters"})
       }

        // Update the password
        student.password = await hashpasssword(newPassword);
        await student.save();

        return res.status(200).json({sucess:true, message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating student password:", error);
        return res.status(500).json({sucess:false, message: "Internal server error." });
    }
}

export { updateTeacherPassword, updateStudentPassword };
