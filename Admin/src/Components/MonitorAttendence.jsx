import React from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { backendUrl } from '@/App';
import ModuleState from "./ui/module-state";
import { useNavigate } from "react-router-dom";

const getAttendanceRowColor = (percentage) => {
  if (percentage >= 1 && percentage < 25) return "bg-red-400";
  if (percentage >= 25 && percentage < 50) return "bg-yellow-300";
  if (percentage >= 50 && percentage < 75) return "bg-green-300";
  if (percentage >= 75) return "bg-white";
  return "";
};

const getAvailableAttendanceSemesters = (students, currentSemester) => {
  const semesters = new Set();
  if (currentSemester) semesters.add(currentSemester);
  students.forEach((student) => {
    (student?.attendance || []).forEach((record) => {
      (record?.subject || []).forEach((subject) => {
        const semesterName = String(subject?.name || "").split("_")[0];
        if (semesterName) semesters.add(semesterName);
      });
    });
  });
  return Array.from(semesters);
};

const dateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getDateRangeLabel = (startDate, endDate) => {
  if (startDate && endDate) return `${startDate} to ${endDate}`;
  if (startDate) return `From ${startDate}`;
  if (endDate) return `Up to ${endDate}`;
  return "All dates";
};

const escapeHtml = (value) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const matchesAttendanceFilter = (subject, semester, startDate, endDate) => {
  const subjectName = String(subject?.name || "");
  const matchesSemester = !semester || subjectName.startsWith(`${semester}_`);
  const subjectDate = dateKey(subject?.date);
  const matchesStartDate = !startDate || subjectDate >= startDate;
  const matchesEndDate = !endDate || subjectDate <= endDate;
  const matchesDate = subjectDate && matchesStartDate && matchesEndDate;
  return matchesSemester && matchesDate;
};

const matchesActivityAttendanceFilter = (
  activitySubject,
  semester,
  startDate,
  endDate
) => {
  const subjectName = String(activitySubject?.name || "");
  const matchesSemester = !semester || subjectName.startsWith(`${semester}_`);
  const lastModifiedDate = dateKey(activitySubject?.lastmodified);
  const matchesStartDate = !startDate || lastModifiedDate >= startDate;
  const matchesEndDate = !endDate || lastModifiedDate <= endDate;
  const matchesDate =
    (!startDate && !endDate) ||
    (lastModifiedDate && matchesStartDate && matchesEndDate);

  return matchesSemester && matchesDate;
};

const getStudentAttendanceSummary = (
  student,
  semester,
  startDate,
  endDate,
  availableSubjects = []
) => {
  const subjects = new Map();
  let totalLec = 0;
  let totalAttend = 0;

  availableSubjects
    .filter((subjectName) => {
      const name = String(subjectName || "");
      return !semester || name.startsWith(`${semester}_`);
    })
    .forEach((subjectName) => {
      subjects.set(subjectName, {
        subjectName,
        totalLec: 0,
        lectureAttend: 0,
        totalAttend: 0,
        activityAttend: 0,
        hasLectureAttendance: false,
        hasActivityAttendance: false,
      });
    });

  (student?.attendance || []).forEach((record) => {
    (record?.subject || []).forEach((subject) => {
      if (!matchesAttendanceFilter(subject, semester, startDate, endDate)) return;

      const subjectName = subject?.name || "N/A";
      const total = Number(subject?.totalnoLec || 0);
      const attended = Number(subject?.noofLecAttended || 0);
      const current = subjects.get(subjectName) || {
        subjectName,
        totalLec: 0,
        lectureAttend: 0,
        totalAttend: 0,
        activityAttend: 0,
        hasLectureAttendance: false,
        hasActivityAttendance: false,
      };

      current.totalLec += total;
      current.lectureAttend += attended;
      current.totalAttend += attended;
      current.hasLectureAttendance = true;
      subjects.set(subjectName, current);
      totalLec += total;
      totalAttend += attended;
    });
  });

  (student?.activityattendance || []).forEach((record) => {
    (record?.subject || []).forEach((activitySubject) => {
      const subjectName = String(activitySubject?.name || "");

      if (
        !subjectName ||
        !matchesActivityAttendanceFilter(
          activitySubject,
          semester,
          startDate,
          endDate
        )
      ) {
        return;
      }

      const activityAttend = Number(activitySubject?.noofLec || 0);
      const current = subjects.get(subjectName) || {
        subjectName,
        totalLec: 0,
        lectureAttend: 0,
        totalAttend: 0,
        activityAttend: 0,
        hasLectureAttendance: false,
        hasActivityAttendance: false,
      };

      current.activityAttend += activityAttend;
      current.totalAttend += activityAttend;
      current.hasActivityAttendance = true;
      subjects.set(subjectName, current);
      totalAttend += activityAttend;
    });
  });

  return {
    totalLec,
    totalAttend,
    subjects: Array.from(subjects.values()),
  };
};

const MonitorAttendence = () => {
  const [popupStudent, setPopupStudent] = useState(null);
  const [section, setsection] = useState("");
  const [year, setyear] = useState("");
  const [batch, setbatch] = useState("");
  const [students, setstudents] = useState([]);
  const [sectionSubjects, setSectionSubjects] = useState([]);
  const [semester, setsemester] = useState("");
  const [selectedAttendanceSemester, setSelectedAttendanceSemester] = useState("");
  const [attendanceStartDate, setAttendanceStartDate] = useState("");
  const [attendanceEndDate, setAttendanceEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const adminLikeToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("deanToken") ||
    localStorage.getItem("directorToken");

  const downloadAttendancePdf = (student) => {
    if (!student) return;
    const popupWindow = window.open("", "_blank", "width=900,height=700");
    if (!popupWindow) return;

    const summary = getStudentAttendanceSummary(
      student,
      activeAttendanceSemester,
      attendanceStartDate,
      attendanceEndDate,
      sectionSubjects.length > 0 ? sectionSubjects : student?.subjects || []
    );
    const subjectRows = summary.subjects
      .map((subject) => {
        const percent =
          subject.totalLec > 0
            ? `${((subject.totalAttend / subject.totalLec) * 100).toFixed(2)}%`
            : "N/A";
        return `
            <tr>
              <td>${subject.subjectName}</td>
              <td>${subject.hasLectureAttendance ? subject.totalLec : "-"}</td>
              <td>${subject.hasLectureAttendance ? subject.lectureAttend : "-"}</td>
              <td>${subject.hasActivityAttendance ? subject.activityAttend : "-"}</td>
              <td>${percent}</td>
            </tr>
          `;
      })
      .join("");

    const html = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 8px; }
            h2 { font-size: 16px; margin-top: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
            .meta { font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>Attendance Report</h1>
          <div class="meta">Name: ${student.name || "-"} | Roll No: ${student.rollno || "-"}</div>
          <div class="meta">Father's Name: ${student.father_name || "-"}</div>
          <div class="meta">Semester: ${activeAttendanceSemester || "-"}</div>
          <div class="meta">Date Range: ${getDateRangeLabel(attendanceStartDate, attendanceEndDate)}</div>
          <h2>Subject-wise Attendance</h2>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total Lectures</th>
                <th>Lectures Attended</th>
                <th>Activity Attendance</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              ${subjectRows || "<tr><td colspan='5'>No attendance data available.</td></tr>"}
            </tbody>
          </table>
        </body>
      </html>
    `;
    popupWindow.document.write(html);
    popupWindow.document.close();
    popupWindow.focus();
    popupWindow.print();
  };

  const printAllStudentsAttendance = () => {
    if (!students.length) return;
    const popupWindow = window.open("", "_blank", "width=1100,height=800");
    if (!popupWindow) return;

    let totalStudentsCount = students.length;
    let eligibleCount = 0;
    let shortageCount = 0;

    const studentCards = students
      .map((student) => {
        const summary = getStudentAttendanceSummary(
          student,
          activeAttendanceSemester,
          attendanceStartDate,
          attendanceEndDate,
          sectionSubjects.length > 0 ? sectionSubjects : student?.subjects || []
        );
        const { totalLec, totalAttend } = summary;
        const attendancePercentage =
          totalLec > 0 ? Number(((totalAttend / totalLec) * 100).toFixed(2)) : 0;
        const attendanceLabel =
          totalLec > 0 ? `${attendancePercentage.toFixed(2)}%` : "N/A";
        const isLowAttendance = totalLec > 0 && attendancePercentage < 75;

        if (totalLec > 0) {
          if (attendancePercentage >= 75) {
            eligibleCount++;
          } else {
            shortageCount++;
          }
        }

        let studentTotalLec = 0;
        let studentLecAttend = 0;
        let studentActAttend = 0;

        summary.subjects.forEach((subj) => {
          if (subj.hasLectureAttendance) {
            studentTotalLec += Number(subj.totalLec || 0);
            studentLecAttend += Number(subj.lectureAttend || 0);
          }
          if (subj.hasActivityAttendance) {
            studentActAttend += Number(subj.activityAttend || 0);
          }
        });

        const subjectRows =
          summary.subjects.length > 0
            ? summary.subjects
                .map((subject, idx) => {
                  const hasLec = subject.hasLectureAttendance;
                  const hasAct = subject.hasActivityAttendance;
                  const subTotalLec = hasLec ? Number(subject.totalLec || 0) : 0;
                  const subTotalAttend = Number(subject.totalAttend || 0);
                  const subPercentage =
                    subTotalLec > 0
                      ? Number(((subTotalAttend / subTotalLec) * 100).toFixed(2))
                      : null;
                  const subPercentageStr =
                    subPercentage !== null
                      ? `${subPercentage.toFixed(2)}%`
                      : "N/A";
                  const isSubLow = subPercentage !== null && subPercentage < 75;

                  return `
                  <tr class="${isSubLow ? "row-sub-low" : ""}">
                    <td class="col-sn">${idx + 1}</td>
                    <td class="col-sub">${escapeHtml(subject.subjectName)}</td>
                    <td class="col-num">${hasLec ? escapeHtml(subject.totalLec) : "-"}</td>
                    <td class="col-num">${hasLec ? escapeHtml(subject.lectureAttend) : "-"}</td>
                    <td class="col-num">${hasAct ? escapeHtml(subject.activityAttend) : "-"}</td>
                    <td class="col-pct ${isSubLow ? "text-danger font-bold" : ""}">${escapeHtml(subPercentageStr)}</td>
                    <td class="col-status">
                      ${
                        subPercentage === null
                          ? '<span class="status-pill pill-neutral">-</span>'
                          : isSubLow
                          ? '<span class="status-pill pill-danger">Shortage</span>'
                          : '<span class="status-pill pill-success">Eligible</span>'
                      }
                    </td>
                  </tr>
                `;
                })
                .join("")
            : `<tr><td colspan="7" class="empty-data">No attendance records found for this student.</td></tr>`;

        return `
          <div class="student-card ${isLowAttendance ? "card-low" : ""}">
            <div class="student-card-header">
              <div class="student-main-info">
                <span class="roll-badge">Roll: ${escapeHtml(student?.rollno || "-")}</span>
                <span class="student-name">${escapeHtml(student?.name || "-")}</span>
                <span class="father-name"><span class="label">Father's Name:</span> ${escapeHtml(student?.father_name || "-")}</span>
              </div>
              <div class="student-attendance-summary">
                <span class="overall-pill ${totalLec === 0 ? "badge-neutral" : isLowAttendance ? "badge-danger" : "badge-success"}">
                  Overall: <strong>${escapeHtml(attendanceLabel)}</strong>
                  ${totalLec > 0 ? `<span class="attendance-counts">(${totalAttend}/${totalLec} Lectures)</span>` : ""}
                  <span class="attendance-tag">${totalLec === 0 ? "No Data" : isLowAttendance ? "Shortage (<75%)" : "Eligible"}</span>
                </span>
              </div>
            </div>
            <table class="subject-table">
              <thead>
                <tr>
                  <th class="col-sn">#</th>
                  <th class="col-sub">Subject Name</th>
                  <th class="col-num">Total Lectures</th>
                  <th class="col-num">Lectures Attended</th>
                  <th class="col-num">Activity Attendance</th>
                  <th class="col-pct">Attendance %</th>
                  <th class="col-status">Status</th>
                </tr>
              </thead>
              <tbody>
                ${subjectRows}
              </tbody>
              ${
                summary.subjects.length > 0
                  ? `
                <tfoot>
                  <tr class="student-total-row">
                    <td colspan="2" class="total-label">Aggregate / Total</td>
                    <td class="col-num">${studentTotalLec}</td>
                    <td class="col-num">${studentLecAttend}</td>
                    <td class="col-num">${studentActAttend}</td>
                    <td class="col-pct ${isLowAttendance ? "text-danger font-bold" : "text-success font-bold"}">${escapeHtml(attendanceLabel)}</td>
                    <td class="col-status">
                      ${
                        totalLec === 0
                          ? '<span class="status-pill pill-neutral">-</span>'
                          : isLowAttendance
                          ? '<span class="status-pill pill-danger">Shortage</span>'
                          : '<span class="status-pill pill-success">Eligible</span>'
                      }
                    </td>
                  </tr>
                </tfoot>
              `
                  : ""
              }
            </table>
          </div>
        `;
      })
      .join("");

    const printDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>All Students Attendance Report</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              padding: 24px;
              color: #1e293b;
              background: #f8fafc;
              font-size: 12px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              margin-bottom: 20px;
              padding: 12px 16px;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .no-print-actions {
              display: flex;
              gap: 8px;
            }
            .btn {
              padding: 8px 16px;
              font-size: 13px;
              font-weight: 600;
              border-radius: 6px;
              cursor: pointer;
              border: none;
              transition: all 0.15s ease;
            }
            .btn-primary { background: #059669; color: #ffffff; }
            .btn-primary:hover { background: #047857; }
            .btn-secondary { background: #e2e8f0; color: #334155; }
            .btn-secondary:hover { background: #cbd5e1; }
            .helper-text { font-size: 12px; color: #64748b; }

            .report-header {
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 18px 20px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            }
            .report-title {
              text-align: center;
              margin-bottom: 14px;
            }
            .report-title h1 {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .report-title p {
              font-size: 12px;
              color: #64748b;
              margin-top: 2px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 10px 16px;
              padding: 12px 16px;
              background: #f1f5f9;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              font-size: 12px;
            }
            .meta-item { display: flex; gap: 6px; }
            .meta-label { font-weight: 700; color: #475569; }
            .meta-value { color: #0f172a; font-weight: 500; }

            .stats-bar {
              display: flex;
              gap: 12px;
              margin-top: 14px;
              flex-wrap: wrap;
            }
            .stat-pill {
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .stat-total { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
            .stat-eligible { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
            .stat-shortage { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

            /* Student Card */
            .student-card {
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              margin-bottom: 20px;
              overflow: hidden;
              page-break-inside: avoid;
              break-inside: avoid;
              box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            }
            .student-card.card-low {
              border-color: #fca5a5;
            }
            .student-card-header {
              background: #f8fafc;
              border-bottom: 1px solid #cbd5e1;
              padding: 10px 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;
            }
            .student-card.card-low .student-card-header {
              background: #fff5f5;
              border-bottom-color: #fca5a5;
            }
            .student-main-info {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
              font-size: 12px;
            }
            .roll-badge {
              background: #1e293b;
              color: #ffffff;
              font-weight: 700;
              font-size: 11px;
              padding: 3px 8px;
              border-radius: 4px;
              letter-spacing: 0.5px;
            }
            .student-name {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
            }
            .father-name {
              color: #475569;
              font-size: 12px;
            }
            .father-name .label {
              font-weight: 600;
              color: #64748b;
            }

            .student-attendance-summary {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .overall-pill {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .badge-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .badge-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
            .badge-neutral { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
            .attendance-counts { font-size: 11px; font-weight: 500; opacity: 0.85; }
            .attendance-tag {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              font-weight: 700;
              padding-left: 2px;
            }

            /* Subject Table */
            .subject-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            .subject-table th {
              background: #f1f5f9;
              color: #334155;
              font-weight: 700;
              text-align: left;
              padding: 8px 12px;
              border-bottom: 1px solid #cbd5e1;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .subject-table td {
              padding: 7px 12px;
              border-bottom: 1px solid #e2e8f0;
              color: #1e293b;
            }
            .subject-table tr:nth-child(even) td {
              background: #fcfcfd;
            }
            .subject-table tr.row-sub-low td {
              background: #fef2f2;
            }
            .subject-table tr:last-child td {
              border-bottom: none;
            }
            .col-sn { width: 5%; text-align: center; color: #64748b; }
            .col-sub { width: 37%; font-weight: 600; color: #0f172a; }
            .col-num { width: 14%; text-align: center; }
            .col-pct { width: 15%; text-align: center; font-weight: 600; }
            .col-status { width: 15%; text-align: center; }
            
            .subject-table tfoot td {
              background: #f8fafc !important;
              border-top: 2px solid #cbd5e1;
              font-weight: 700;
              padding: 9px 12px;
              color: #0f172a;
            }
            .subject-table tfoot .total-label {
              text-align: right;
              padding-right: 16px;
              text-transform: uppercase;
              font-size: 11px;
              color: #475569;
            }

            .status-pill {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .pill-success { background: #dcfce7; color: #15803d; }
            .pill-danger { background: #fee2e2; color: #b91c1c; }
            .pill-neutral { background: #f1f5f9; color: #64748b; }

            .text-danger { color: #dc2626 !important; }
            .text-success { color: #16a34a !important; }
            .font-bold { font-weight: 700 !important; }

            .empty-data {
              text-align: center;
              color: #64748b;
              padding: 16px;
              font-style: italic;
            }

            @media print {
              body {
                background: #ffffff;
                padding: 0;
                color: #000000;
              }
              .no-print {
                display: none !important;
              }
              .report-header {
                border: 1px solid #94a3b8;
                margin-bottom: 14px;
                padding: 12px 14px;
                box-shadow: none;
              }
              .meta-grid {
                background: #f8fafc !important;
                border: 1px solid #cbd5e1;
              }
              .student-card {
                border: 1px solid #94a3b8;
                margin-bottom: 16px;
                box-shadow: none;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .student-card-header {
                background: #f1f5f9 !important;
                border-bottom: 1px solid #94a3b8;
              }
              .roll-badge {
                background: #0f172a !important;
                color: #ffffff !important;
              }
              .subject-table th {
                background: #f1f5f9 !important;
                border-bottom: 1px solid #94a3b8;
                color: #000000;
              }
              .subject-table tfoot td {
                border-top: 2px solid #94a3b8;
                background: #f8fafc !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm 8mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <span class="helper-text">
              Tip: Click "Print Report" to print or save as PDF. Background graphics enabled is recommended.
            </span>
            <div class="no-print-actions">
              <button class="btn btn-primary" onclick="window.print()">Print Report</button>
              <button class="btn btn-secondary" onclick="window.close()">Close</button>
            </div>
          </div>

          <div class="report-header">
            <div class="report-title">
              <h1>Students Attendance Report</h1>
              <p>Subject-wise Detailed Class Attendance Record</p>
            </div>
            <div class="meta-grid">
              <div class="meta-item"><span class="meta-label">Section:</span><span class="meta-value">${escapeHtml(section || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Year:</span><span class="meta-value">${escapeHtml(year || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Batch:</span><span class="meta-value">${escapeHtml(batch || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Semester:</span><span class="meta-value">${escapeHtml(activeAttendanceSemester || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Date Range:</span><span class="meta-value">${escapeHtml(getDateRangeLabel(attendanceStartDate, attendanceEndDate))}</span></div>
              <div class="meta-item"><span class="meta-label">Report Date:</span><span class="meta-value">${escapeHtml(printDate)}</span></div>
            </div>
            <div class="stats-bar">
              <span class="stat-pill stat-total">Total Students: ${totalStudentsCount}</span>
              <span class="stat-pill stat-eligible">Eligible (&ge;75%): ${eligibleCount}</span>
              <span class="stat-pill stat-shortage">Shortage (&lt;75%): ${shortageCount}</span>
            </div>
          </div>

          ${studentCards}

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    popupWindow.document.write(html);
    popupWindow.document.close();
  };

  const getStudent = async () => {
    setLoading(true);
    setErrorMessage("");
    setHasSearched(true);
    setSearchMessage("");
    try {
      // console.log(localStorage.getItem("teacherToken"));
      const responce = await axios.get(
        backendUrl + "/api/gelStudentBySection",
        {
          params: {
            section,
            year,
            batch,
          },
          headers: {
            teachertoken: localStorage.getItem("teacherToken")
              ? localStorage.getItem("teacherToken")
              : null,
            admintoken: adminLikeToken ? adminLikeToken : null,
          },
        }
      );
      // console.log(responce.data);
      if (responce.data.sucess) {
        const sortedStudents = [...(responce.data.findSection.students || [])].sort(
          (a, b) => Number(a.rollno) - Number(b.rollno)
        );
        setstudents(sortedStudents);
        setSectionSubjects(responce.data.findSection.subjects || []);
        setsemester(responce.data.findSection.semester);
        setSelectedAttendanceSemester(responce.data.findSection.semester || "");
        toast.success(responce.data.message);
      } else {
        setstudents([]);
        setSectionSubjects([]);
        setErrorMessage(responce.data.message || "Unable to fetch students.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Unable to fetch students.";
      console.log(msg);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchMessage("");
    const roll = String(searchRoll || "").trim();
    if (!roll) {
      setSearchMessage("Enter a roll number to search.");
      return;
    }
    const found = students.find(
      (student) => String(student?.rollno || "").trim() === roll
    );
    if (!found) {
      setPopupStudent(null);
      setSearchMessage("No student found with this roll number.");
      return;
    }
    setPopupStudent(found);
  };

  const clearSearch = () => {
    setSearchRoll("");
    setSearchMessage("");
    setPopupStudent(null);
  };
  const availableAttendanceSemesters = getAvailableAttendanceSemesters(
    students,
    semester
  );
  const activeAttendanceSemester = selectedAttendanceSemester || semester;
  const navigate = useNavigate();
  return (
    <div className={`flex flex-col  `}>
      <div
        className={`grid grid-cols-4 items-center justify-items-center border border-gray-300 gap-4 p-4 bg-white ${
          popupStudent ? " bg-black opacity-40 " : ""
        } rounded-lg shadow-md`}
      >
        <input
          value={section}
          onChange={(e) => setsection(e.target.value)}
          placeholder="Enter your Section"
          type="text"
          className="border border-gray-300 rounded sm:w-40 px-3 w-20 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <select
          value={year}
          onChange={(e) => setyear(e.target.value)}
          className="border border-gray-300 rounded sm:w-40 w-20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="Ist">1st Year</option>
          <option value="IInd">2nd Year</option>
          <option value="IIIrd">3rd Year</option>
          <option value="IVth">4th Year</option>
        </select>
       
        <input
          value={batch}
          onChange={(e) => setbatch(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter Starting year here"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          className="border border-gray-300 rounded sm:w-40 w-20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={() => getStudent()}
          disabled={loading}
          className="px-2 py-2 rounded-lg text-lg font-semibold text-white bg-blue-500 w-20 sm:w-40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Track"}
        </button>
      </div>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              placeholder="Search by roll no"
              type="text"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition md:w-64"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={clearSearch}
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <i className="ri-arrow-left-line text-base"></i>
            Back
          </button>
        </div>
        {searchMessage ? (
          <p className="mt-2 text-sm text-slate-600">{searchMessage}</p>
        ) : null}
        {hasSearched && students.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">
                Attendance Semester
              </label>
              <select
                value={activeAttendanceSemester}
                onChange={(e) => setSelectedAttendanceSemester(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {availableAttendanceSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                value={attendanceStartDate}
                max={attendanceEndDate || undefined}
                onChange={(e) => setAttendanceStartDate(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">
                End Date
              </label>
              <input
                type="date"
                value={attendanceEndDate}
                min={attendanceStartDate || undefined}
                onChange={(e) => setAttendanceEndDate(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setAttendanceStartDate("");
                setAttendanceEndDate("");
              }}
              className="self-end rounded border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              All Dates
            </button>
            {attendanceStartDate || attendanceEndDate ? (
              <span className="self-end text-sm text-slate-500">
                Showing data {getDateRangeLabel(attendanceStartDate, attendanceEndDate)}
              </span>
            ) : null}
            </div>
            <button
              onClick={printAllStudentsAttendance}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <i className="ri-printer-line text-base"></i>
              Print
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-5">
        {loading ? (
          <ModuleState type="loading" title="Fetching attendance" />
        ) : errorMessage ? (
          <ModuleState
            type="error"
            title="Unable to load attendance"
            message={errorMessage}
            actionLabel="Retry"
            onAction={getStudent}
          />
        ) : hasSearched && students.length === 0 ? (
          <ModuleState
            type="empty"
            title="No students found"
            message="Try a different section, year, or batch."
          />
        ) : !hasSearched ? (
          <ModuleState
            type="empty"
            title="Track a class to view attendance"
            message="Apply filters above and click Track."
          />
        ) : (
      <table className="w-full border-collapse mt-5">
        <thead>
          <tr>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">
              Name
            </th>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">
              Attendance
            </th>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
              Father's Name
            </th>
            <th className="border border-gray-300   text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
              ROLL NO
            </th>
          </tr>
        </thead>
        <tbody>
          {students &&
            students.map((student) => {
              const { totalLec, totalAttend } = getStudentAttendanceSummary(
                student,
                activeAttendanceSemester,
                attendanceStartDate,
                attendanceEndDate
              );
              const attendancePercentage =
                totalLec > 0 ? Number(((totalAttend / totalLec) * 100).toFixed(2)) : 0;

              return (
                <React.Fragment key={student.rollno}>
                  <tr
                    onClick={() => setPopupStudent(student)}
                    className={`${getAttendanceRowColor(attendancePercentage)} ${
                      popupStudent && popupStudent ? "opacity-40" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                      {student?.name}
                    </td>
                    <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                      {totalLec > 0
                        ? `${((totalAttend / totalLec) * 100).toFixed(2)}%`
                        : "N/A"}
                    </td>
                    <td className="border border-gray-300 text-xs text-wrap sm:text-lg text-center sm:px-4 py-2">
                      {student?.father_name}
                    </td>
                    <td className="border border-gray-300 whitespace-normal max-w-[120px] text-xs">
                      {student?.rollno}
                    </td>
                  </tr>
                  {popupStudent && popupStudent.rollno === student.rollno && (
                    <tr>
                      <td colSpan={4}>
                        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-40 z-50">
                          <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[90vw]">
                            <h2 className="text-lg font-bold mb-2">
                              Student Attendance Details
                            </h2>
                            <p>
                              <strong>Name:</strong> {popupStudent.name}
                            </p>
                            <p>
                              <strong>Roll No:</strong> {popupStudent.rollno}
                            </p>
                            <p>
                              <strong>Father's Name:</strong>{" "}
                              {popupStudent.father_name}
                            </p>
                            <h3 className="font-semibold mt-4 mb-2">
                              Subject-wise Attendance ({activeAttendanceSemester || "N/A"})
                              {attendanceStartDate || attendanceEndDate
                                ? ` - ${getDateRangeLabel(attendanceStartDate, attendanceEndDate)}`
                                : ""}
                            </h3>
                            {(() => {
                              const summary = getStudentAttendanceSummary(
                                popupStudent,
                                activeAttendanceSemester,
                                attendanceStartDate,
                                attendanceEndDate,
                                sectionSubjects.length > 0
                                  ? sectionSubjects
                                  : popupStudent?.subjects || []
                              );
                              return summary.subjects.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr>
                                        <th className="border px-2 py-1">Subject</th>
                                        <th className="border px-2 py-1">Total Lectures</th>
                                        <th className="border px-2 py-1">Lectures Attended</th>
                                        <th className="border px-2 py-1">Activity Attendance</th>
                                        <th className="border px-2 py-1">Attendance %</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {summary.subjects.map((subject) => {
                                        const attendancePercent =
                                          subject.totalLec > 0
                                            ? (subject.totalAttend / subject.totalLec) * 100
                                            : 0;
                                        return (
                                          <tr
                                            key={subject.subjectName}
                                            className={
                                              subject.totalLec > 0 && attendancePercent < 75
                                                ? "bg-red-400"
                                                : "even:bg-gray-50"
                                            }
                                          >
                                            <td className="border px-2 py-1">
                                              {subject.subjectName || "N/A"}
                                            </td>
                                            <td className="border px-2 py-1">
                                              {subject.hasLectureAttendance
                                                ? subject.totalLec
                                                : "-"}
                                            </td>
                                            <td className="border px-2 py-1">
                                              {subject.hasLectureAttendance
                                                ? subject.lectureAttend
                                                : "-"}
                                            </td>
                                            <td className="border px-2 py-1">
                                              {subject.hasActivityAttendance
                                                ? subject.activityAttend
                                                : "-"}
                                            </td>
                                            <td className="border px-2 py-1">
                                              {subject.totalLec > 0
                                                ? attendancePercent.toFixed(2) + "%"
                                                : "N/A"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div>No attendance data available.</div>
                              );
                            })()}
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={() => downloadAttendancePdf(popupStudent)}
                              >
                                Download PDF
                              </button>
                              <button
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded"
                                onClick={() => setPopupStudent(null)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
        )}
      </div>
    </div>
  );
};

export default MonitorAttendence;
