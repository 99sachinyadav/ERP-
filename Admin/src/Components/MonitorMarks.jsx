import React from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";
import ModuleState from "./ui/module-state";
import { useNavigate } from "react-router-dom";

const EXAMS = ["ST1", "ST2", "PUT"];

const getMarksForExam = (student, exam, semester) => {
  const marks = Array.isArray(student?.marks) ? student.marks : [];
  return marks.filter(
    (mark) =>
      String(mark?.exam || "").toUpperCase() === exam &&
      (!semester || mark?.semester === semester)
  );
};

const getExamTotals = (student, exam, semester) => {
  const examMarks = getMarksForExam(student, exam, semester);
  return examMarks.reduce(
    (acc, mark) => ({
      obtained: acc.obtained + Number(mark?.obtainedMarks || 0),
      total: acc.total + Number(mark?.totalMarks || 0),
    }),
    { obtained: 0, total: 0 }
  );
};

const formatTotal = ({ obtained, total }) => {
  if (!total) return "-";
  return `${obtained}/${total}`;
};

const escapeHtml = (value) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getAvailableMarkSemesters = (students, currentSemester) => {
  const semesters = new Set();
  if (currentSemester) semesters.add(currentSemester);
  students.forEach((student) => {
    (student?.marks || []).forEach((mark) => {
      if (mark?.semester) semesters.add(mark.semester);
    });
  });
  return Array.from(semesters);
};

const MonitorMarks = () => {
  const [popupStudent, setPopupStudent] = useState(null);
  const [section, setsection] = useState("");
  const [year, setyear] = useState("");
  const [batch, setbatch] = useState("");
  const [students, setstudents] = useState([]);
  const [semester, setsemester] = useState("");
  const [sectionSubjects, setSectionSubjects] = useState([]);
  const [selectedMarksSemester, setSelectedMarksSemester] = useState("");
  const [selectedExam, setSelectedExam] = useState("ST1");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const adminLikeToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("deanToken") ||
    localStorage.getItem("directorToken");

  const availableMarkSemesters = getAvailableMarkSemesters(students, semester);
  const activeMarksSemester = selectedMarksSemester || semester;

  const getSubjectsToShow = (student) => {
    const all =
      sectionSubjects && sectionSubjects.length > 0
        ? sectionSubjects
        : student?.subjects || [];
    return all.filter((s) => {
      if (!s) return false;
      if (!activeMarksSemester) return true;
      return (
        String(s).startsWith(`${activeMarksSemester}_`) ||
        String(s).startsWith(activeMarksSemester)
      );
    });
  };

  const findMarkFor = (student, exam, sem, subjectName) => {
    const marks = Array.isArray(student?.marks) ? student.marks : [];
    const exact = marks.find((m) => {
      const sameExam =
        String(m?.exam || "").toUpperCase() === String(exam || "").toUpperCase();
      const sameSem = !sem || m?.semester === sem;
      const subj = String(m?.subject || "").trim();
      const name = String(subjectName || "").trim();
      return sameExam && sameSem && subj === name;
    });
    return exact || null;
  };

  const getAllSubjectsForStudent = (student, sem) => {
    const subjectList = [];
    const seen = new Set();

    const allBase =
      sectionSubjects && sectionSubjects.length > 0
        ? sectionSubjects
        : student?.subjects || [];
    const filteredBase = allBase.filter((s) => {
      if (!s) return false;
      if (!sem) return true;
      return (
        String(s).startsWith(`${sem}_`) || String(s).startsWith(sem)
      );
    });

    filteredBase.forEach((s) => {
      const trimmed = String(s || "").trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        subjectList.push(trimmed);
      }
    });

    const marks = Array.isArray(student?.marks) ? student.marks : [];
    marks.forEach((m) => {
      if (!sem || m?.semester === sem) {
        const subj = String(m?.subject || "").trim();
        if (subj && !seen.has(subj)) {
          seen.add(subj);
          subjectList.push(subj);
        }
      }
    });

    return subjectList;
  };

  const openMarksPopup = (student, exam) => {
    setPopupStudent(student);
    setSelectedExam(exam);
  };

  const marksReportStyles = `
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
    .no-print-actions { display: flex; gap: 8px; }
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
    .report-title { text-align: center; margin-bottom: 14px; }
    .report-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .report-title p { font-size: 12px; color: #64748b; margin-top: 2px; }
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
      gap: 10px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .stat-pill {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .stat-total { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .stat-distinction { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .stat-first { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
    .stat-pass { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
    .stat-low { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

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
    .student-card.card-low { border-color: #fca5a5; }
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
    .student-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    .father-name { color: #475569; font-size: 12px; }
    .father-name .label { font-weight: 600; color: #64748b; }

    .student-marks-summary { display: flex; align-items: center; gap: 8px; }
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
    .marks-counts { font-size: 11px; font-weight: 500; opacity: 0.85; }
    .marks-tag {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 700;
      padding-left: 2px;
    }

    /* Marks Table */
    .marks-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .marks-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .marks-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .marks-table tr:nth-child(even) td { background: #fcfcfd; }
    .marks-table tr.row-sub-low td { background: #fef2f2; }
    .marks-table tr:last-child td { border-bottom: none; }

    .col-sn { width: 4%; text-align: center; color: #64748b; }
    .col-sub { width: 34%; font-weight: 600; color: #0f172a; }
    .col-exam { width: 15%; text-align: center; }
    .col-total { width: 12%; text-align: center; }
    .col-pct { width: 8%; text-align: center; font-weight: 600; }

    .mark-val { font-weight: 600; }
    .mark-pct { font-size: 10.5px; color: #64748b; margin-top: 1px; }

    .marks-table tfoot td {
      background: #f8fafc !important;
      border-top: 2px solid #cbd5e1;
      font-weight: 700;
      padding: 9px 10px;
      color: #0f172a;
    }
    .marks-table tfoot .total-label {
      text-align: right;
      padding-right: 14px;
      text-transform: uppercase;
      font-size: 11px;
      color: #475569;
    }

    .text-danger { color: #dc2626 !important; }
    .text-success { color: #16a34a !important; }
    .text-primary { color: #2563eb !important; }
    .text-muted { color: #94a3b8; }
    .font-bold { font-weight: 700 !important; }
    .font-semibold { font-weight: 600 !important; }

    .empty-data {
      text-align: center;
      color: #64748b;
      padding: 16px;
      font-style: italic;
    }

    @media print {
      body { background: #ffffff; padding: 0; color: #000000; }
      .no-print { display: none !important; }
      .report-header {
        border: 1px solid #94a3b8;
        margin-bottom: 14px;
        padding: 12px 14px;
        box-shadow: none;
      }
      .meta-grid { background: #f8fafc !important; border: 1px solid #cbd5e1; }
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
      .roll-badge { background: #0f172a !important; color: #ffffff !important; }
      .marks-table th {
        background: #f1f5f9 !important;
        border-bottom: 1px solid #94a3b8;
        color: #000000;
      }
      .marks-table tfoot td {
        border-top: 2px solid #94a3b8;
        background: #f8fafc !important;
      }
      @page {
        size: A4 portrait;
        margin: 10mm 8mm;
      }
    }
  `;

  const getStudentMarksTableData = (student) => {
    const subjects = getAllSubjectsForStudent(student, activeMarksSemester);

    let studentGrandObtained = 0;
    let studentGrandMax = 0;

    const subjectRows =
      subjects.length > 0
        ? subjects
            .map((subj, idx) => {
              let subjObt = 0;
              let subjMax = 0;
              let hasAnyMark = false;

              const examCells = EXAMS.map((exam) => {
                const mark = findMarkFor(
                  student,
                  exam,
                  activeMarksSemester,
                  subj
                );
                if (mark && Number(mark.totalMarks) > 0) {
                  hasAnyMark = true;
                  const obt = Number(mark.obtainedMarks || 0);
                  const max = Number(mark.totalMarks || 0);
                  subjObt += obt;
                  subjMax += max;
                  const pct = ((obt / max) * 100).toFixed(1);
                  return `
                    <td class="col-exam">
                      <div class="mark-val">${obt} / ${max}</div>
                      <div class="mark-pct">(${pct}%)</div>
                    </td>
                  `;
                } else if (mark) {
                  hasAnyMark = true;
                  const obt = Number(mark.obtainedMarks || 0);
                  subjObt += obt;
                  return `
                    <td class="col-exam">
                      <div class="mark-val">${obt}</div>
                    </td>
                  `;
                } else {
                  return `<td class="col-exam text-muted">-</td>`;
                }
              }).join("");

              const subjPct =
                subjMax > 0
                  ? Number(((subjObt / subjMax) * 100).toFixed(2))
                  : null;
              const isSubjLow = subjPct !== null && subjPct < 40;
              const isSubjHigh = subjPct !== null && subjPct >= 75;

              return `
                <tr class="${isSubjLow ? "row-sub-low" : ""}">
                  <td class="col-sn">${idx + 1}</td>
                  <td class="col-sub">${escapeHtml(subj)}</td>
                  ${examCells}
                  <td class="col-total font-semibold">${
                    hasAnyMark && subjMax > 0
                      ? `${subjObt} / ${subjMax}`
                      : hasAnyMark
                      ? `${subjObt}`
                      : "-"
                  }</td>
                  <td class="col-pct ${
                    isSubjLow
                      ? "text-danger font-bold"
                      : isSubjHigh
                      ? "text-success font-bold"
                      : "font-semibold"
                  }">
                    ${subjPct !== null ? `${subjPct.toFixed(2)}%` : "-"}
                  </td>
                </tr>
              `;
            })
            .join("")
        : `<tr><td colspan="${
            EXAMS.length + 4
          }" class="empty-data">No subjects or marks available for this student.</td></tr>`;

    // Exam Totals for student
    const examFooterCells = EXAMS.map((exam) => {
      const totals = getExamTotals(student, exam, activeMarksSemester);
      studentGrandObtained += totals.obtained;
      studentGrandMax += totals.total;
      if (totals.total > 0) {
        const pct = ((totals.obtained / totals.total) * 100).toFixed(1);
        return `
          <td class="col-exam font-bold">
            <div class="mark-val">${totals.obtained} / ${totals.total}</div>
            <div class="mark-pct">(${pct}%)</div>
          </td>
        `;
      }
      return `<td class="col-exam text-muted font-bold">-</td>`;
    }).join("");

    const grandPct =
      studentGrandMax > 0
        ? Number(((studentGrandObtained / studentGrandMax) * 100).toFixed(2))
        : 0;
    const grandPctStr =
      studentGrandMax > 0 ? `${grandPct.toFixed(2)}%` : "N/A";
    const isPass = grandPct >= 40;

    const statusText =
      studentGrandMax === 0
        ? "No Marks"
        : grandPct >= 75
        ? "Distinction (&ge;75%)"
        : grandPct >= 60
        ? "First Div (&ge;60%)"
        : grandPct >= 40
        ? "Pass (&ge;40%)"
        : "Needs Improvement (<40%)";

    const badgeClass =
      studentGrandMax === 0
        ? "badge-neutral"
        : isPass
        ? "badge-success"
        : "badge-danger";

    const cardHtml = `
      <div class="student-card ${studentGrandMax > 0 && !isPass ? "card-low" : ""}">
        <div class="student-card-header">
          <div class="student-main-info">
            <span class="roll-badge">Roll: ${escapeHtml(student?.rollno || "-")}</span>
            <span class="student-name">${escapeHtml(student?.name || "-")}</span>
            <span class="father-name"><span class="label">Father's Name:</span> ${escapeHtml(student?.father_name || "-")}</span>
          </div>
          <div class="student-marks-summary">
            <span class="overall-pill ${badgeClass}">
              Overall: <strong>${escapeHtml(grandPctStr)}</strong>
              ${studentGrandMax > 0 ? `<span class="marks-counts">(${studentGrandObtained}/${studentGrandMax})</span>` : ""}
              <span class="marks-tag">${statusText}</span>
            </span>
          </div>
        </div>
        <table class="marks-table">
          <thead>
            <tr>
              <th class="col-sn">#</th>
              <th class="col-sub">Subject Name</th>
              ${EXAMS.map((exam) => `<th class="col-exam">${escapeHtml(exam)} (Obt / Max)</th>`).join("")}
              <th class="col-total">Total Marks</th>
              <th class="col-pct">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${subjectRows}
          </tbody>
          ${
            subjects.length > 0
              ? `
            <tfoot>
              <tr class="student-total-row">
                <td colspan="2" class="total-label">Aggregate / Total</td>
                ${examFooterCells}
                <td class="col-total font-bold">${studentGrandMax > 0 ? `${studentGrandObtained} / ${studentGrandMax}` : "-"}</td>
                <td class="col-pct font-bold ${studentGrandMax > 0 && !isPass ? "text-danger" : "text-success"}">${escapeHtml(grandPctStr)}</td>
              </tr>
            </tfoot>
          `
              : ""
          }
        </table>
      </div>
    `;

    return {
      cardHtml,
      grandObtained: studentGrandObtained,
      grandMax: studentGrandMax,
      grandPct,
      grandPctStr,
      isPass,
      subjectCount: subjects.length,
    };
  };

  const downloadMarksPdf = (student) => {
    if (!student) return;
    const popupWindow = window.open("", "_blank", "width=950,height=750");
    if (!popupWindow) return;

    const studentMarksData = getStudentMarksTableData(student);
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
          <title>Marks Report - ${escapeHtml(student.name || "Student")}</title>
          <style>
            ${marksReportStyles}
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
              <h1>Student Marks Report</h1>
              <p>Subject-wise Comprehensive Marks Card</p>
            </div>
            <div class="meta-grid">
              <div class="meta-item"><span class="meta-label">Name:</span><span class="meta-value">${escapeHtml(student?.name || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Roll No:</span><span class="meta-value">${escapeHtml(student?.rollno || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Father's Name:</span><span class="meta-value">${escapeHtml(student?.father_name || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Section:</span><span class="meta-value">${escapeHtml(section || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Semester:</span><span class="meta-value">${escapeHtml(activeMarksSemester || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Report Date:</span><span class="meta-value">${escapeHtml(printDate)}</span></div>
            </div>
          </div>

          ${studentMarksData.cardHtml}

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

  const printAllStudentsMarks = () => {
    if (!students.length) return;
    const popupWindow = window.open("", "_blank", "width=1100,height=800");
    if (!popupWindow) return;

    let totalStudentsCount = students.length;
    let distinctionCount = 0;
    let firstDivCount = 0;
    let passCount = 0;
    let needsImproveCount = 0;

    const studentCards = students
      .map((student) => {
        const studentMarksData = getStudentMarksTableData(student);
        const { grandMax, grandPct } = studentMarksData;

        if (grandMax > 0) {
          if (grandPct >= 75) distinctionCount++;
          else if (grandPct >= 60) firstDivCount++;
          else if (grandPct >= 40) passCount++;
          else needsImproveCount++;
        }

        return studentMarksData.cardHtml;
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
          <title>All Students Marks Report</title>
          <style>
            ${marksReportStyles}
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
              <h1>Students Marks Report</h1>
              <p>Subject-wise Detailed Class Marks & Performance Record</p>
            </div>
            <div class="meta-grid">
              <div class="meta-item"><span class="meta-label">Section:</span><span class="meta-value">${escapeHtml(section || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Year:</span><span class="meta-value">${escapeHtml(year || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Batch:</span><span class="meta-value">${escapeHtml(batch || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Semester:</span><span class="meta-value">${escapeHtml(activeMarksSemester || "-")}</span></div>
              <div class="meta-item"><span class="meta-label">Report Date:</span><span class="meta-value">${escapeHtml(printDate)}</span></div>
            </div>
            <div class="stats-bar">
              <span class="stat-pill stat-total">Total Students: ${totalStudentsCount}</span>
              <span class="stat-pill stat-distinction">Distinction (&ge;75%): ${distinctionCount}</span>
              <span class="stat-pill stat-first">1st Div (60-74%): ${firstDivCount}</span>
              <span class="stat-pill stat-pass">Pass (40-59%): ${passCount}</span>
              <span class="stat-pill stat-low">Needs Attention (&lt;40%): ${needsImproveCount}</span>
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
      const responce = await axios.get(backendUrl + "/api/gelStudentBySection", {
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
      });

      if (responce.data.sucess) {
        const sortedStudents = [...(responce.data.findSection.students || [])].sort(
          (a, b) => Number(a.rollno) - Number(b.rollno)
        );
        setstudents(sortedStudents);
        setSectionSubjects(responce.data.findSection.subjects || []);
        setsemester(responce.data.findSection.semester);
        setSelectedMarksSemester(responce.data.findSection.semester || "");
        toast.success(responce.data.message);
      } else {
        setstudents([]);
        setSectionSubjects([]);
        setErrorMessage(responce.data.message || "Unable to fetch students.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Unable to fetch students.";
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
    setSelectedExam("ALL");
  };

  const clearSearch = () => {
    setSearchRoll("");
    setSearchMessage("");
    setPopupStudent(null);
  };
  const popupMarks = popupStudent
    ? selectedExam === "ALL"
      ? (popupStudent.marks || []).filter(
          (mark) => !activeMarksSemester || mark?.semester === activeMarksSemester
        )
      : getMarksForExam(popupStudent, selectedExam, activeMarksSemester)
    : [];
  const popupTotals = popupStudent
    ? getExamTotals(popupStudent, selectedExam, activeMarksSemester)
    : { obtained: 0, total: 0 };

  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Marks Semester
              </label>
              <select
                value={activeMarksSemester}
                onChange={(e) => setSelectedMarksSemester(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {availableMarkSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={printAllStudentsMarks}
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
          <ModuleState type="loading" title="Fetching students" />
        ) : errorMessage ? (
          <ModuleState
            type="error"
            title="Unable to load student data"
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
            title="Track a class to view marks"
            message="Apply filters above and click Track."
          />
        ) : (
          <table className="w-full border-collapse mt-5">
            <thead>
              <tr>
                <th className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-left">
                  Name
                </th>
                <th className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
                  Father&apos;s Name
                </th>
                <th className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center">
                  Roll No
                </th>
                {EXAMS.map((exam) => (
                  <th
                    key={exam}
                    className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2 bg-gray-100 text-center"
                  >
                    {exam} Total
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const st1Total = getExamTotals(student, "ST1", activeMarksSemester);
                const st2Total = getExamTotals(student, "ST2", activeMarksSemester);
                const putTotal = getExamTotals(student, "PUT", activeMarksSemester);

                return (
                  <React.Fragment key={student.rollno}>
                    <tr className={`even:bg-gray-50 ${popupStudent ? "opacity-40" : ""}`}>
                      <td className="border border-gray-300 text-xs sm:text-lg sm:px-4 py-2">
                        {student?.name}
                      </td>
                      <td className="border border-gray-300 text-xs text-wrap sm:text-lg text-center sm:px-4 py-2">
                        {student?.father_name}
                      </td>
                      <td className="border border-gray-300 whitespace-normal max-w-[120px] text-xs text-center">
                        {student?.rollno}
                      </td>
                      <td className="border border-gray-300 text-xs sm:text-sm text-center px-2 py-2">
                        <button
                          onClick={() => openMarksPopup(student, "ST1")}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {formatTotal(st1Total)}
                        </button>
                      </td>
                      <td className="border border-gray-300 text-xs sm:text-sm text-center px-2 py-2">
                        <button
                          onClick={() => openMarksPopup(student, "ST2")}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {formatTotal(st2Total)}
                        </button>
                      </td>
                      <td className="border border-gray-300 text-xs sm:text-sm text-center px-2 py-2">
                        <button
                          onClick={() => openMarksPopup(student, "PUT")}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {formatTotal(putTotal)}
                        </button>
                      </td>
                    </tr>

                    {popupStudent && popupStudent.rollno === student.rollno && (
                      <tr>
                        <td colSpan={6}>
                          <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-40 z-50">
                            <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[90vw]">
                              <h2 className="text-lg font-bold mb-2">
                                Student Marks Details {selectedExam === "ALL" ? "(All Exams)" : `(${selectedExam})`}
                              </h2>
                              <p>
                                <strong>Name:</strong> {popupStudent.name}
                              </p>
                              <p>
                                <strong>Roll No:</strong> {popupStudent.rollno}
                              </p>
                              <p>
                                <strong>Father&apos;s Name:</strong> {popupStudent.father_name}
                              </p>
                              <h3 className="font-semibold mt-4 mb-2">
                                {selectedExam === "ALL"
                                  ? "All Marks"
                                  : `Subject-wise Marks (${selectedExam})`}
                              </h3>

                              {selectedExam === "ALL" ? (
                                popupMarks.length > 0 ? (
                                  <table className="w-full text-xs mb-2">
                                    <thead>
                                      <tr>
                                        <th className="border px-2 py-1">Exam</th>
                                        <th className="border px-2 py-1">Subject</th>
                                        <th className="border px-2 py-1">Obtained</th>
                                        <th className="border px-2 py-1">Total</th>
                                        <th className="border px-2 py-1">Percentage</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {popupMarks.map((mark, i) => {
                                        const obtained = Number(mark?.obtainedMarks || 0);
                                        const total = Number(mark?.totalMarks || 0);
                                        return (
                                          <tr key={`${mark?.subject}-${i}`} className="even:bg-gray-50">
                                            <td className="border px-2 py-1">{mark?.exam || "-"}</td>
                                            <td className="border px-2 py-1">{mark?.subject || "-"}</td>
                                            <td className="border px-2 py-1">{obtained}</td>
                                            <td className="border px-2 py-1">{total}</td>
                                            <td className="border px-2 py-1">
                                              {total ? `${((obtained / total) * 100).toFixed(2)}%` : "-"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div>No marks available for this semester.</div>
                                )
                              ) : (
                                // Single exam view: show all section subjects (or student subjects) and display '-' when mark missing
                                (() => {
                                  const subjects = getSubjectsToShow(popupStudent);
                                  return subjects && subjects.length > 0 ? (
                                    <table className="w-full text-xs mb-2">
                                      <thead>
                                        <tr>
                                          <th className="border px-2 py-1">Subject</th>
                                          <th className="border px-2 py-1">Obtained</th>
                                          <th className="border px-2 py-1">Total</th>
                                          <th className="border px-2 py-1">Percentage</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {subjects.map((subj, i) => {
                                          const mark = findMarkFor(popupStudent, selectedExam, activeMarksSemester, subj);
                                          const obtained = mark ? Number(mark.obtainedMarks || 0) : null;
                                          const total = mark ? Number(mark.totalMarks || 0) : null;
                                          return (
                                            <tr key={`${subj}-${i}`} className="even:bg-gray-50">
                                              <td className="border px-2 py-1">{subj || "-"}</td>
                                              <td className="border px-2 py-1">{obtained !== null ? obtained : "-"}</td>
                                              <td className="border px-2 py-1">{total !== null ? total : "-"}</td>
                                              <td className="border px-2 py-1">{total ? `${((obtained / total) * 100).toFixed(2)}%` : "-"}</td>
                                            </tr>
                                          );
                                        })}
                                        <tr className="bg-blue-50 font-semibold">
                                          <td className="border px-2 py-1 text-right">Total</td>
                                          <td className="border px-2 py-1">{popupTotals.obtained}</td>
                                          <td className="border px-2 py-1">{popupTotals.total}</td>
                                          <td className="border px-2 py-1">{popupTotals.total ? `${((popupTotals.obtained / popupTotals.total) * 100).toFixed(2)}%` : "-"}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div>No marks available for this semester.</div>
                                  );
                                })()
                              )}

                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  className="px-4 py-2 bg-blue-500 text-white rounded"
                                  onClick={() => downloadMarksPdf(popupStudent)}
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

export default MonitorMarks;
