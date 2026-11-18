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
    const email = req.body.teacheremail || req.body.email || req.body.staffemail;
    const { department } = req.body;
    if (!email || !department) {
      return res
        .status(400)
        .json({
          sucess: false,
          message: "Email and department are required.",
        });
    }

    const trimmedEmail = String(email).trim();
    const emailRegex = new RegExp(
      `^${trimmedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i"
    );

    let user = await Teacher.findOne({ email: emailRegex });
    let userType = "Teacher";

    if (!user) {
      user = await Staff.findOne({ email: emailRegex });
      userType = "Staff";
    }

    if (!user) {
      return res
        .status(404)
        .json({ sucess: false, message: "Teacher or Staff member not found." });
    }

    // Downgrade any existing Teacher HOD in this department
    const existingTeacherHOD = await Teacher.findOne({ department, role: "HOD" });
    if (
      existingTeacherHOD &&
      (userType !== "Teacher" || String(existingTeacherHOD._id) !== String(user._id))
    ) {
      await Teacher.updateOne(
        { _id: existingTeacherHOD._id },
        {
          $unset: {
            department: "",
            role: "",
          },
        }
      );
    }

    // Downgrade any existing Staff HOD in this department
    const existingStaffHOD = await Staff.findOne({ department, role: "HOD" });
    if (
      existingStaffHOD &&
      (userType !== "Staff" || String(existingStaffHOD._id) !== String(user._id))
    ) {
      await Staff.updateOne(
        { _id: existingStaffHOD._id },
        {
          $set: {
            role: "STAFF",
          },
        }
      );
    }

    // Set this teacher or staff as HOD
    user.role = "HOD";
    user.department = department;
    await user.save();
  console.log("hod assigned")
    return res
      .status(200)
      .json({
        sucess: true,
        message: `${userType} ${user.name} assigned as HOD of ${department}.`,
      });
  } catch (error) {
    console.error("Error assigned HOD:", error);
    return res
      .status(500)
      .json({ sucess: false, message: "Internal server error." });
  }
};

export { updateTeacherPassword, updateStudentPassword, assignHOD ,updateStaffPassword};
