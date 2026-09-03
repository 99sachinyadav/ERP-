import { hashpasssword } from "./studentcontroller.js";
import { Teacher } from "../model/teachermodel.js";
import { Student } from "../model/studentmodel.js";
import { Staff } from "../model/staffmodel.js";

const updateTeacherPassword = async (req, res) => {
  try {
    const { teacheremail, newPassword } = req.body;
    // console.log(teacheremail ,newPassword)
    // Validate input
    if (!teacheremail || !newPassword) {
      return res
        .status(400)
        .json({
          sucess: false,
          message: "Teacher email or new password are required.",
        });
    }
    if (newPassword.length < 6) {
      return res
        .status(402)
        .json({
          susess: false,
          message: "password must contain atleast 6 Characters",
        });
    }
    // Find the teacher by email
    const teacher = await Teacher.findOne({ email: teacheremail });
    if (!teacher) {
      return res
        .status(404)
        .json({ sucess: false, message: "Teacher not found." });
    }

    // Update the password
    teacher.password = await hashpasssword(newPassword);
    await teacher.save();

    return res
      .status(200)
      .json({ sucess: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating teacher password:", error);
    return res
      .status(500)
      .json({ sucess: false, message: "Internal server error." });
  }
};

const updateStudentPassword = async (req, res) => {
  try {
    const { studentemail, newPassword } = req.body;

    // Validate input
    if (!studentemail || !newPassword) {
      return res
        .status(400)
        .json({
          sucess: false,
          message: "Student email and new password are required.",
        });
    }

    // Find the student by email
    const student = await Student.findOne({ email: studentemail });
    if (!student) {
      return res
        .status(404)
        .json({ sucess: false, message: "Student not found." });
    }
    if (newPassword.length < 6) {
      return res
        .status(402)
        .json({
          susess: false,
          message: "password must contain atleast 6 Characters",
        });
    }

    // Update the password
    student.password = await hashpasssword(newPassword);
    await student.save();

    return res
      .status(200)
      .json({ sucess: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating student password:", error);
    return res
      .status(500)
      .json({ sucess: false, message: "Internal server error." });
  }
};

const updateStaffPassword = async (req,res)=>{
     try {
        const {email, newPassword} = req.body
          if(!email || !newPassword){
            return res.status(400).json({sucess:false, message:"email and new password are required"})
          }
           if (newPassword.length < 6) {
      return res
        .status(402)
        .json({
          susess: false,
          message: "password must contain atleast 6 Characters",
        });
    }
    // Find the staff member by email
    const staff = await Staff.findOne({ email: email });
    if (!staff) {
      return res
        .status(404)
        .json({ sucess: false, message: "Staff member not found." });
    }

    // Update the password
    staff.password = await hashpasssword(newPassword);
    await staff.save();

    return res
      .status(200)
      .json({ sucess: true, message: "Password updated successfully." });

     } catch (error) {
         console.error("Error updating Staff password:", error);
    return res
      .status(500)
      .json({ sucess: false, message: "Internal server error." });
     }
}

const assignHOD = async (req, res) => {
  try {
    const { teacheremail, department } = req.body;
    if (!teacheremail || !department) {
      return res
        .status(400)
        .json({
          sucess: false,
          message: "Teacher email and department are required.",
        });
    }

    const teacher = await Teacher.findOne({ email: teacheremail });
    if (!teacher) {
      return res
        .status(404)
        .json({ sucess: false, message: "Teacher not found." });
    }

    const existingHOD = await Teacher.findOne({ department, role: "HOD" });
    if (existingHOD) {
      // Downgrade the existing HOD to Faculty
      await Teacher.updateOne(
        { _id: existingHOD._id },
        {
          $unset: {
            department: "",
            role: "",
        
          },
        },
      );
      await existingHOD.save();
    }

    // Set this teacher as HOD
    teacher.role = "HOD";
    teacher.department = department;
    await teacher.save();

    // Optionally: downgrade others in the same department?
    // For simplicity, we just assign. If admin assigns multiple, they all get HOD role.
    // But the logic will pick one.

    return res
      .status(200)
      .json({
        sucess: true,
        message: `Teacher ${teacher.name} assigned as HOD of ${department}.`,
      });
  } catch (error) {
    console.error("Error assigned HOD:", error);
    return res
      .status(500)
      .json({ sucess: false, message: "Internal server error." });
  }
};

export { updateTeacherPassword, updateStudentPassword, assignHOD ,updateStaffPassword};
