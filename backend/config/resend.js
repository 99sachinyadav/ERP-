 
import { Resend } from "resend";
import fs from "fs";
import axios from "axios";
import { Teacher } from "../model/teachermodel.js";
import { Section } from "../model/sectionmodel.js";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url"; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// use absolute path
const htmlPath = path.join(__dirname, "Resend.html");
 
const resend = new Resend(process.env.RESEND_API_KEY);
const backendUrl = process.env.BACKEND_URL || "https://erpbackend-pearl.vercel.app";

const getSmtpTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER, // your Gmail address
      pass: process.env.GMAIL_PASS
    }
  });
};

const sendEmail = async (email, name, attendance, fatherName, rollNo, semester, attendancePercent,year) => {
   const subject = `Attendance Alert: ${attendancePercent}% in ${semester}`;
   



  try {

   
 

let htmlTemplate = fs.readFileSync(htmlPath, "utf8");

// Build table rows
const rows = attendance.map(attend => {
  let totalLec = 0;
  let totalAttend = 0;
  let subjectName = "";
  attend.subject &&
    attend.subject.forEach((subj) => {
      if (subj.name.includes(semester)) {
        totalAttend += subj.noofLecAttended || 0;
        totalLec += subj.totalnoLec || 0;
        subjectName = subj.name || "";
      }
    });
  const subjectPercent = ((totalAttend / totalLec) * 100 || 0).toFixed(2);
  const cls = subjectPercent < 75 ? "low" : "high";
    if(totalLec !== 0 && totalAttend !== 0){
        return `<tr>
            <td>${subjectName || "subject"}</td>
            <td  >${ totalAttend || 0}</td>
            <td>${ totalLec || 0}</td>
            <td>${subjectPercent || 0} %</td>
          </tr>`
    };
}).join("\n");

// Build fallback list
 

// Replace placeholders
const html = htmlTemplate
  .replace(/{{student_name}}/g, name)
  .replace(/{{father_name}}/g, fatherName)
  .replace(/{{rollno}}/g, rollNo)
  .replace(/{{course_name}}/g, `BTech semester ${semester} & year ${year}`)
  .replace(/{{attendance_percent}}/g, attendancePercent)
  .replace(/{{required_percent}}/g, "75")
  .replace(/{{records_rows}}/g, rows)
  //  .replace(/{{list}}/g, list)
 
  .replace(/{{sender_name}}/g, "Class counsellor")
  .replace(/{{sender_position}}/g, "Attendance Coordinator")
  .replace(/{{institution_name}}/g, " Raj Kumar Goel Institute of Technology & Management")
  
  .replace(/{{support_email}}/g, "director@rkgitm.ac.in ");
      // console.log("Generated HTML:", html,to ,subject);
    // const response = await resend.emails.send({
    //   from: 'noreply@resend.dev',  // must be a verified email/domain
    //   to:email,
    //   subject,
    //   html : html,
    // });


    
    // Setup SMTP transport
    const transporter = getSmtpTransporter();

    // Send mail
    const response = await transporter.sendMail({
      from: '"RKGITM ERP" <sachin_cs_2023@rkgitm.ac.in>',
      to: email,
      subject,
      html
    });


     return  ({ success: true, data: response });
  } catch (error) {
    console.error("Error sending email:", error);
    return  ({ success: false, error: error.message });
  }
};

const sendPasswordResetCode = async (email, name, code) => {
  const subject = "Password Reset Code";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 8px;">Hello ${name || "Student"}</h2>
      <p style="margin: 0 0 12px;">We received a request to reset your password. Use the code below to continue:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; background: #f3f4f6; padding: 12px 16px; display: inline-block; border-radius: 8px;">
        ${code}
      </div>
      <p style="margin: 12px 0 0;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  try {
    const transporter = getSmtpTransporter();
    const response = await transporter.sendMail({
      from: '"RKGITM ERP" <sy7841846@gmail.com>',
      to: email,
      subject,
      html
    });
    return ({ success: true, data: response });
  } catch (error) {
    console.error("Error sending reset code email:", error);
    return ({ success: false, error: error.message });
  }
};

const sendStudentVerificationCode = async (email, name, code) => {
  const subject = "Student Registration Verification Code";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 8px;">Hello ${name || "Student"}</h2>
      <p style="margin: 0 0 12px;">Use the code below to verify your registration:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; background: #f3f4f6; padding: 12px 16px; display: inline-block; border-radius: 8px;">
        ${code}
      </div>
      <p style="margin: 12px 0 0;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  try {
    const transporter = getSmtpTransporter();
    const response = await transporter.sendMail({
      from: '"RKGITM ERP" <sy7841846@gmail.com>',
      to: email,
      subject,
      html
    });
    return ({ success: true, data: response });
  } catch (error) {
    console.error("Error sending verification code email:", error);
    return ({ success: false, error: error.message });
  }
};

const sendEmailStudent = async (req, res) => {
   try {
       const {year, batch, teacherId} = req.body;
       let {section} = req.body;
        section = section.toUpperCase().trim();
       const teacherToken  = req.headers;
      //  console.log(teacherToken.teachertoken, section, year, batch,teacherId);

        const teacher = await Teacher.findById(teacherId);
        const sectionName=section + year + "_" + batch;
        const sectionfind= await Section.findOne({name:sectionName });
        if(!sectionfind){
          return res.json({success:false,message:"section not found with this details"})
        }
        if(!teacher.section.includes(sectionfind._id)){
          return res .json({success:false,message:"you are not authorized to send email to this section"})
        }

      const responce = await axios.get(
      backendUrl + "/api/gelStudentBySection",
        {
          params: {
            section,
            year,
            batch,
          },
          headers: {
            teachertoken: teacherToken.teachertoken ? teacherToken.teachertoken : null,
          },
        }
      );
      // console.log("my responce",responce.data);
     let students = [];
      let semester = "";
      if (responce.data.sucess) {
      students = responce.data.findSection.students;
        
         semester = responce.data.findSection.semester;
        // Now you can use students, attendance, and semester variables directly
      }
    //  console.log(students, semester);
      if (students && Array.isArray(students)) {
        for (const student of students) {
          // Calculate total lectures and attendance
          let totalLec = 0;
          let totalAttend = 0;
          if (student.attendance) {
            for (const attend of student.attendance) {
              if (Array.isArray(attend.subject)) {
                for (const att of attend.subject) {
                  if (att.name.includes(semester)) {
                    totalAttend += att.noofLecAttended || 0;
                    totalLec += att.totalnoLec || 0;
                  }
                }
              }
            }
          }
          const attendancePercent = ((totalAttend / totalLec) * 100 || 0).toFixed(2);
          // console.log(attendancePercent);
          if (attendancePercent < 75) {
            const response = await sendEmail(
              student?.email,
              student?.name,
              student?.attendance,
              student?.father_name,
              student?.rollno,
              student?.semester,
              attendancePercent,
              student?.year
            );
            //  console.log( student.attendance );
            if (!response.success) {
              return res.status(500).json({ success: false, message: `Failed to send email to ${student?.email}: ${response.error}` });
            }
          }
        }
        res.json({ success: true, message: "Emails sent successfully to all students with low attendance." });
      }
   } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
      
    }



}

 export { sendEmail , sendEmailStudent, sendPasswordResetCode, sendStudentVerificationCode };
