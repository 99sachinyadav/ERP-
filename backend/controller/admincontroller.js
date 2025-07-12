import { hashpasssword } from "./studentcontroller.js";
import {Teacher} from "../model/teachermodel.js";
import {Student} from "../model/studentmodel.js";
const updateTeacherPassword = async (req,res)=>{
    try {
        const { teacheremail, newPassword } = req.body;

        // Validate input
        if (!teacheremail || !newPassword) {
            return res.status(400).json({ message: "Teacher email and new password are required." });
        }

        // Find the teacher by email
        const teacher = await Teacher.findOne({ email: teacheremail });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found." });
        }

        // Update the password
        teacher.password = await hashpasssword(newPassword);
        await teacher.save();

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating teacher password:", error);
        return res.status(500).json({ message: "Internal server error." });
    }

}



    const updateStudentPassword = async (req, res) => {
    try {
        const { studentemail, newPassword } = req.body;

        // Validate input
        if (!studentemail || !newPassword) {
            return res.status(400).json({ message: "Student email and new password are required." });
        }

        // Find the student by email
        const student = await Student.findOne({ email: studentemail });
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Update the password
        student.password = await hashpasssword(newPassword);
        await student.save();

        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating student password:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export { updateTeacherPassword, updateStudentPassword };
