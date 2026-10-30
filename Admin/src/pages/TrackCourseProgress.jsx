import { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  Printer,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { backendUrl } from "@/App";

const escapeHtml = (value) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const clampPercentage = (value) =>
  Math.min(100, Math.max(0, Number(value) || 0));

const getSubjectProgress = (chapters) =>
  chapters?.length
    ? Math.round(
        chapters.reduce(
          (total, chapter) => total + clampPercentage(chapter.progress),
          0
        ) / chapters.length
      )
    : 0;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
    const d = new Date(dateString);
    return isNaN(d.getTime())
      ? dateString
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  } catch {
    return dateString;
  }
};

const formatUpdateDay = (dateString, fallbackDate) => {
  const target = dateString || fallbackDate;
  if (!target) return "-";
  try {
    const d = new Date(target);
    if (isNaN(d.getTime())) return "-";
    const dayName = d.toLocaleDateString("en-GB", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${dayName}, ${formattedDate}`;
  } catch {
    return "-";
  }
};

const formatUpdateTime = (dateString, fallbackDate) => {
  const target = dateString || fallbackDate;
  if (!target) return "";
  try {
    const d = new Date(target);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

const normalizeSemesterName = (val) => {
  if (!val) return "";
  const s = String(val).trim();
  const match = s.match(
    /^(Ist|IInd|IIIrd|IVth|Vth|VIth|VIIth|VIIIth|1st|2nd|3rd|4th|5th|6th|7th|8th)(\s*semester)?/i
  );
  if (!match) return s;
  const numMap = {
    "1st": "Ist",
    "2nd": "IInd",
    "3rd": "IIIrd",
    "4th": "IVth",
    "5th": "Vth",
    "6th": "VIth",
    "7th": "VIIth",
    "8th": "VIIIth",
  };
  const rawPrefix = match[1].toLowerCase();
  const semPrefix =
    numMap[rawPrefix] ||
    (match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase());
  const romanMap = {
    ist: "Ist",
    iind: "IInd",
    iiird: "IIIrd",
    ivth: "IVth",
    vth: "Vth",
    vith: "VIth",
    viith: "VIIth",
    viiith: "VIIIth",
  };
  const standardized = romanMap[semPrefix.toLowerCase()] || semPrefix;
  return `${standardized} Semester`;
};

const getSubjectSemester = (subject, fallbackSemester) => {
  if (subject?.semester) return normalizeSemesterName(subject.semester);
  const checkStr = `${subject?.code || ""} ${subject?.name || ""}`;
  const prefixMatch = checkStr.match(
    /\b(Ist|IInd|IIIrd|IVth|Vth|VIth|VIIth|VIIIth)[\s_-]/i
  );
  if (prefixMatch) {
    return normalizeSemesterName(prefixMatch[1]);
  }
  return normalizeSemesterName(fallbackSemester) || "General";
};

const getSemestersForYear = (year) => {
  switch (year) {
    case "Ist":
      return ["Ist Semester", "IInd Semester"];
    case "IInd":
      return ["IIIrd Semester", "IVth Semester"];
    case "IIIrd":
      return ["Vth Semester", "VIth Semester"];
    case "IVth":
      return ["VIIth Semester", "VIIIth Semester"];
    default:
      return [
        "Ist Semester",
        "IInd Semester",
        "IIIrd Semester",
        "IVth Semester",
        "Vth Semester",
        "VIth Semester",
        "VIIth Semester",
        "VIIIth Semester",
      ];
  }
};

function TrackCourseProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDean =
    location.pathname.startsWith("/dean") ||
    (!localStorage.getItem("directorToken") && Boolean(localStorage.getItem("deanToken")));

  const [filters, setFilters] = useState({
    year: "IIIrd",
    semester: "",
    batch: "",
    section: "A",
  });
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("all");
  const [courseProgress, setCourseProgress] = useState(null);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const availableSemesters = useMemo(() => {
    const subjects = courseProgress?.subjects || [];
    const set = new Set();
    if (courseProgress?.semester) {
      set.add(getSubjectSemester(null, courseProgress.semester));
    }
    subjects.forEach((subj) => {
      const sem = getSubjectSemester(subj, courseProgress?.semester);
      if (sem) set.add(sem);
    });
    return Array.from(set).filter(Boolean);
  }, [courseProgress]);

  const filteredSubjects = useMemo(() => {
    const subjects = courseProgress?.subjects || [];
    if (!selectedSemesterFilter || selectedSemesterFilter === "all") {
      return subjects;
    }
    return subjects.filter(
      (subj) =>
        getSubjectSemester(subj, courseProgress?.semester).toLowerCase() ===
        selectedSemesterFilter.toLowerCase()
    );
  }, [courseProgress, selectedSemesterFilter]);

  const overallProgress = useMemo(() => {
    const subjects = filteredSubjects;
    return subjects.length
      ? Math.round(
          subjects.reduce(
            (total, subject) => total + getSubjectProgress(subject.chapters),
            0
          ) / subjects.length
        )
      : 0;
  }, [filteredSubjects]);

  const selectedSubject = useMemo(
    () =>
      filteredSubjects.find((subject) => subject.code === selectedSubjectCode) ||
      filteredSubjects[0] ||
      null,
    [filteredSubjects, selectedSubjectCode]
  );

  const selectedSubjectStats = useMemo(() => {
    const chapters = selectedSubject?.chapters || [];
    let completedCount = 0;
    let pendingCount = 0;
    let totalLecturesNeeded = 0;

    chapters.forEach((ch) => {
      if (clampPercentage(ch.progress) >= 100) {
        completedCount++;
      } else {
        pendingCount++;
        totalLecturesNeeded += Number(ch.lecturesRequired) || 0;
      }
    });

    return {
      total: chapters.length,
      completed: completedCount,
      pending: pendingCount,
      totalLecturesNeeded,
    };
  }, [selectedSubject]);

  const trackProgress = async () => {
    if (!filters.batch.trim() || !filters.section.trim()) {
      toast.error("Enter both batch and section.");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const adminLikeToken =
        localStorage.getItem("deanToken") ||
        localStorage.getItem("directorToken") ||
        localStorage.getItem("adminToken");

      const response = await axios.get(backendUrl + "/api/course-progress", {
        params: {
          year: filters.year,
          batch: filters.batch,
          section: filters.section,
          semester: filters.semester || undefined,
        },
        headers: {
          admintoken: adminLikeToken || null,
        },
      });
      const savedProgress = response.data.courseProgress;
      setCourseProgress(savedProgress);
      const initialSem = filters.semester
        ? getSubjectSemester(null, filters.semester)
        : "all";
      setSelectedSemesterFilter(initialSem);
      setSelectedSubjectCode(savedProgress.subjects?.[0]?.code || "");
    } catch (error) {
      setCourseProgress(null);
      toast.error(
        error.response?.data?.message || "Unable to load course progress."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = (filterSem = selectedSemesterFilter) => {
    if (!courseProgress) {
      toast.error("Please load course progress first.");
      return;
    }

    const popupWindow = window.open("", "_blank", "width=1150,height=850");
    if (!popupWindow) {
      toast.error("Popup blocked! Please allow popups to print the report.");
      return;
    }

    const allSubjects = courseProgress.subjects || [];
    const activeSem = filterSem || "all";

    let totalChaptersCount = 0;
    let completedChaptersCount = 0;
    let pendingChaptersCount = 0;
    let totalLecturesNeeded = 0;

    allSubjects.forEach((subj) => {
      (subj.chapters || []).forEach((ch) => {
        totalChaptersCount++;
        if (clampPercentage(ch.progress) >= 100) {
          completedChaptersCount++;
        } else {
          pendingChaptersCount++;
          totalLecturesNeeded += Number(ch.lecturesRequired) || 0;
        }
      });
    });

    const printDate = new Date().toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const subjectsHtml = allSubjects.map((subject, sIdx) => {
      const subjSem = getSubjectSemester(subject, courseProgress.semester);
      const subjProgress = getSubjectProgress(subject.chapters);
      const chapters = subject.chapters || [];
      const updatingTeacher =
        subject.teacherName ||
        subject.teacher?.name ||
        "";
      let subjCompleted = 0;
      let subPending = 0;
      let subLecRequired = 0;

      chapters.forEach((ch) => {
        if (clampPercentage(ch.progress) >= 100) {
          subjCompleted++;
        } else {
          subPending++;
          subLecRequired += Number(ch.lecturesRequired) || 0;
        }
      });

      const chapterRows = chapters.length
        ? chapters.map((ch, cIdx) => {
            const isDone = clampPercentage(ch.progress) >= 100;
            const statusHtml = isDone
              ? `<span class="badge badge-done">&#10003; Done</span>`
              : `<span class="badge badge-pending">&#9202; In Progress</span>`;

            const expectedDateText = !isDone
              ? (ch.expectedDate ? `<span class="date-badge">${escapeHtml(formatDate(ch.expectedDate))}</span>` : `<span class="text-muted">-</span>`)
              : `<span class="text-muted">-</span>`;

            const lecturesRequiredText = !isDone
              ? (ch.lecturesRequired ? `<strong>${escapeHtml(ch.lecturesRequired)}</strong> lec` : `<span class="text-muted">0</span>`)
              : `<span class="text-muted">-</span>`;

            const updatedDayText = formatUpdateDay(ch.lastUpdated, courseProgress.updatedAt || courseProgress.createdAt);
            const updatedTimeText = formatUpdateTime(ch.lastUpdated, courseProgress.updatedAt || courseProgress.createdAt);

            return `
              <tr>
                <td class="text-center">${cIdx + 1}</td>
                <td class="font-semibold">${escapeHtml(ch.name)}</td>
                <td class="text-center">${statusHtml}</td>
                <td>
                  <div class="progress-cell">
                    <span class="progress-pct">${clampPercentage(ch.progress)}%</span>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill ${isDone ? "fill-green" : "fill-blue"}" style="width: ${clampPercentage(ch.progress)}%;"></div>
                    </div>
                  </div>
                </td>
                <td class="text-center">${expectedDateText}</td>
                <td class="text-center">${lecturesRequiredText}</td>
                <td class="update-cell">
                  <span class="day-text">${escapeHtml(updatedDayText)}</span>
                  ${updatedTimeText ? `<span class="time-text">${escapeHtml(updatedTimeText)}</span>` : ""}
                </td>
              </tr>
            `;
          }).join("")
        : `<tr><td colspan="7" class="text-center text-muted" style="padding: 10px;">No chapters recorded for this subject.</td></tr>`;

      return `
        <div class="subject-card" data-semester="${escapeHtml(subjSem)}" data-code="${escapeHtml(subject.code)}">
          <div class="subject-card-header">
            <div class="subject-left">
              <span class="subject-tag">Subj ${sIdx + 1}</span>
              <strong class="subject-title">${escapeHtml(subject.name)}</strong>
              <span class="subject-code">(${escapeHtml(subject.code)})</span>
              <span class="subj-sem-tag">${escapeHtml(subjSem)}</span>
              ${updatingTeacher ? `
                <span class="subject-teacher-badge">
                  <span class="teacher-icon">&#128100;</span>
                  <span class="teacher-label">Updating Teacher:</span>
                  <strong class="teacher-name">${escapeHtml(updatingTeacher)}</strong>
                </span>
              ` : ""}
            </div>
            <div class="subject-right">
              <div class="subject-progress-wrap">
                <span class="subject-progress-label">Progress:</span>
                <strong class="subject-progress-val">${subjProgress}%</strong>
                <div class="progress-bar-bg subject-bar">
                  <div class="progress-bar-fill ${subjProgress === 100 ? "fill-green" : "fill-blue"}" style="width: ${subjProgress}%;"></div>
                </div>
              </div>
              <div class="subject-stats-pills">
                <span class="subj-pill">Chapters: <strong>${chapters.length}</strong></span>
                <span class="subj-pill pill-done">&#10003; <strong>${subjCompleted}</strong></span>
                <span class="subj-pill pill-pending">&#9202; <strong>${subPending}</strong></span>
                ${subLecRequired > 0 ? `<span class="subj-pill pill-req">Needed: <strong>${subLecRequired}</strong> lec</span>` : ""}
              </div>
            </div>
          </div>
          <table class="chapters-table">
            <thead>
              <tr>
                <th style="width: 26px; text-align: center;">#</th>
                <th>Chapter Name</th>
                <th style="width: 82px; text-align: center;">Status</th>
                <th style="width: 108px;">Progress</th>
                <th style="width: 90px; text-align: center;">Expected Date</th>
                <th style="width: 72px; text-align: center;">Lectures Req.</th>
                <th style="width: 125px;">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${chapterRows}
            </tbody>
          </table>
        </div>
      `;
    }).join("");

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Course Progress Report - ${escapeHtml(courseProgress.section)} (${escapeHtml(courseProgress.year)} Year, Batch ${escapeHtml(courseProgress.batch)})</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #f8fafc;
            color: #0f172a;
            padding: 12px 14px;
            font-size: 11px;
            line-height: 1.35;
          }
          .no-print {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 8px 14px;
            margin-bottom: 10px;
            gap: 12px;
            flex-wrap: wrap;
          }
          .no-print-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .no-print-label {
            font-size: 11.5px;
            font-weight: 700;
            color: #0369a1;
          }
          .report-filter-select {
            padding: 4px 10px;
            font-size: 11.5px;
            border-radius: 4px;
            border: 1px solid #0284c7;
            background: #ffffff;
            color: #0f172a;
            font-weight: 700;
            outline: none;
            cursor: pointer;
          }
          .btn {
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
            padding: 6px 14px;
            border-radius: 4px;
            border: none;
            transition: all 0.2s;
          }
          .btn-primary {
            background: #0284c7;
            color: #ffffff;
          }
          .btn-primary:hover {
            background: #0369a1;
          }
          .btn-secondary {
            background: #ffffff;
            color: #475569;
            border: 1px solid #cbd5e1;
            margin-left: 6px;
          }

          /* COMPACT REPORT HEADER */
          .report-header {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 9px;
          }
          .report-header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .institution-name {
            font-size: 9.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #0284c7;
            display: block;
          }
          .report-title {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.2;
          }
          .report-class-badge {
            font-size: 11px;
            color: #475569;
            margin-top: 1px;
          }
          .report-progress-card {
            text-align: right;
            min-width: 140px;
          }
          .progress-card-title {
            font-size: 9.5px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 2px;
          }
          .progress-card-metric {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
          }
          .progress-val {
            font-size: 17px;
            font-weight: 800;
            color: #0284c7;
          }
          .header-bar {
            width: 75px;
          }

          .report-meta-strip {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            font-size: 10.5px;
          }
          .meta-group-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .meta-col {
            display: flex;
            gap: 4px;
            align-items: center;
          }
          .meta-k {
            color: #64748b;
            font-weight: 600;
          }
          .meta-v {
            color: #0f172a;
            font-weight: 700;
          }
          .meta-stats-group {
            display: flex;
            align-items: center;
            gap: 5px;
            flex-wrap: wrap;
          }
          .stat-chip {
            font-size: 10px;
            padding: 1.5px 6px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            color: #334155;
          }
          .stat-chip.chip-blue { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
          .stat-chip.chip-green { background: #ecfdf5; border-color: #a7f3d0; color: #065f46; }
          .stat-chip.chip-amber { background: #fffbeb; border-color: #fde68a; color: #92400e; }
          .stat-chip.chip-req { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }

          /* SUBJECT CARD */
          .subject-card {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 5px;
            margin-bottom: 9px;
            overflow: hidden;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .subject-card-header {
            background: #f8fafc;
            border-bottom: 1px solid #cbd5e1;
            padding: 5px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .subject-left {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }
          .subject-tag {
            background: #0284c7;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
            text-transform: uppercase;
          }
          .subject-title {
            font-size: 12.5px;
            font-weight: 700;
            color: #0f172a;
          }
          .subject-code {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
          }
          .subj-sem-tag {
            background: #e0f2fe;
            color: #0369a1;
            font-size: 9.5px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 3px;
            border: 1px solid #bae6fd;
            white-space: nowrap;
          }
          .subject-teacher-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            font-size: 10px;
            padding: 1.5px 7px;
            border-radius: 4px;
            margin-left: 2px;
          }
          .subject-teacher-badge .teacher-icon {
            font-size: 10px;
          }
          .subject-teacher-badge .teacher-label {
            color: #15803d;
            font-weight: 600;
          }
          .subject-teacher-badge .teacher-name {
            color: #14532d;
            font-weight: 700;
          }

          .subject-right {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .subject-progress-wrap {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .subject-progress-label {
            font-size: 10.5px;
            font-weight: 600;
            color: #475569;
          }
          .subject-progress-val {
            font-size: 11.5px;
            font-weight: 800;
            color: #0284c7;
          }
          .subject-bar {
            width: 55px;
          }
          .subject-stats-pills {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .subj-pill {
            font-size: 9.5px;
            padding: 1px 4.5px;
            border-radius: 3px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #475569;
          }
          .subj-pill.pill-done { background: #ecfdf5; border-color: #a7f3d0; color: #065f46; }
          .subj-pill.pill-pending { background: #fffbeb; border-color: #fde68a; color: #92400e; }
          .subj-pill.pill-req { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }

          /* CHAPTERS TABLE */
          .chapters-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
          }
          .chapters-table th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            padding: 4px 6px;
            border-bottom: 1px solid #cbd5e1;
            border-right: 1px solid #e2e8f0;
            text-align: left;
          }
          .chapters-table th:last-child {
            border-right: none;
          }
          .chapters-table td {
            padding: 3.5px 6px;
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #f1f5f9;
            color: #1e293b;
            vertical-align: middle;
          }
          .chapters-table td:last-child {
            border-right: none;
          }
          .chapters-table tbody tr:nth-child(even) {
            background: #fbfcfe;
          }
          .chapters-table tr:last-child td {
            border-bottom: none;
          }

          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-semibold { font-weight: 600; }
          .text-muted { color: #94a3b8; font-size: 10px; }

          /* PROGRESS BAR */
          .progress-cell {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .progress-pct {
            font-weight: 700;
            font-size: 10.5px;
            min-width: 28px;
            text-align: right;
            color: #1e293b;
          }
          .progress-bar-bg {
            flex: 1;
            height: 5px;
            background: #e2e8f0;
            border-radius: 9999px;
            overflow: hidden;
            min-width: 35px;
          }
          .progress-bar-fill {
            height: 100%;
            border-radius: 9999px;
          }
          .fill-green { background: #059669; }
          .fill-blue { background: #0284c7; }

          /* BADGES */
          .badge {
            display: inline-block;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 9.5px;
            font-weight: 600;
            white-space: nowrap;
          }
          .badge-done { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
          .badge-pending { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

          .date-badge {
            display: inline-block;
            padding: 1px 4px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 3px;
            font-weight: 600;
            font-size: 10px;
            color: #334155;
          }

          .update-cell {
            font-size: 10px;
            line-height: 1.2;
          }
          .day-text {
            font-weight: 600;
            color: #1e293b;
            display: block;
          }
          .time-text {
            font-size: 9.5px;
            color: #64748b;
            display: block;
          }

          .report-footer {
            text-align: center;
            margin-top: 10px;
            font-size: 9.5px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
          }

          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
            .report-header, .subject-card {
              box-shadow: none !important;
              border: 1px solid #cbd5e1 !important;
            }
            @page {
              margin: 8mm 6mm;
              size: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div class="no-print-left">
            <span class="no-print-label">&#128197; Filter by Semester:</span>
            <select id="reportSemesterSelect" class="report-filter-select" onchange="filterReportSemester(this.value)">
              <option value="all">All Semesters (${allSubjects.length} subjects)</option>
              ${availableSemesters.map(sem => {
                const count = allSubjects.filter(s => getSubjectSemester(s, courseProgress.semester).toLowerCase() === sem.toLowerCase()).length;
                return `<option value="${escapeHtml(sem)}" ${activeSem.toLowerCase() === sem.toLowerCase() ? "selected" : ""}>${escapeHtml(sem)} (${count} subject${count === 1 ? "" : "s"})</option>`;
              }).join("")}
            </select>
          </div>
          <div class="no-print-actions">
            <button class="btn btn-primary" onclick="window.print()">Print Report</button>
            <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
          </div>
        </div>

        <div class="report-header">
          <div class="report-header-top">
            <div>
              <span class="institution-name">Academic Syllabus Tracking &amp; Management</span>
              <h1 class="report-title">Course Progress Report</h1>
              <div class="report-class-badge">
                <strong>${escapeHtml(courseProgress.section)}</strong> Section &bull;
                <strong>${escapeHtml(courseProgress.year)} Year</strong> &bull;
                Batch: <strong>${escapeHtml(courseProgress.batch)}</strong> &bull;
                <span id="reportSemBadge">Sem: <strong id="reportSemSubtitle">${escapeHtml(activeSem === "all" ? (courseProgress.semester || "All Semesters") : activeSem)}</strong></span>
              </div>
            </div>
            <div class="report-progress-card">
              <div class="progress-card-title">Overall Course Progress</div>
              <div class="progress-card-metric">
                <span class="progress-val" id="reportOverallProgVal">${overallProgress}%</span>
                <div class="progress-bar-bg header-bar">
                  <div id="reportOverallProgBar" class="progress-bar-fill ${overallProgress === 100 ? "fill-green" : "fill-blue"}" style="width: ${overallProgress}%;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="report-meta-strip">
            <div class="meta-group-left">
              <div class="meta-col">
                <span class="meta-k">Generated:</span>
                <span class="meta-v">${escapeHtml(printDate)}</span>
              </div>
            </div>
            <div class="meta-stats-group">
              <span class="stat-chip chip-blue"><strong id="statTotalSubjects">${allSubjects.length}</strong> Subjects</span>
              <span class="stat-chip"><strong id="statTotalChapters">${totalChaptersCount}</strong> Chapters</span>
              <span class="stat-chip chip-green">&#10003; <strong id="statDoneChapters">${completedChaptersCount}</strong> Done</span>
              <span class="stat-chip chip-amber">&#9202; <strong id="statPendingChapters">${pendingChaptersCount}</strong> Pending</span>
              <span class="stat-chip chip-req">&#128337; <strong id="statLecturesReq">${totalLecturesNeeded}</strong> Lectures Req.</span>
            </div>
          </div>
        </div>

        <div id="reportNoSubjectsMsg" style="display: none; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 25px; text-align: center; color: #64748b; font-size: 13px; margin: 15px 0;">
          No subjects found for the selected semester in this course record.
        </div>

        ${subjectsHtml}

        <div class="report-footer">
          Course Progress Report generated on ${escapeHtml(printDate)}.
        </div>

        <script>
          const subjectData = ${JSON.stringify(
            allSubjects.map(s => ({
              code: s.code,
              semester: getSubjectSemester(s, courseProgress.semester),
              progress: getSubjectProgress(s.chapters),
              totalChapters: (s.chapters || []).length,
              completedChapters: (s.chapters || []).filter(c => clampPercentage(c.progress) >= 100).length,
              pendingChapters: (s.chapters || []).filter(c => clampPercentage(c.progress) < 100).length,
              lecturesNeeded: (s.chapters || []).reduce((acc, c) => clampPercentage(c.progress) < 100 ? acc + (Number(c.lecturesRequired) || 0) : acc, 0)
            }))
          )};

          function filterReportSemester(selectedSem) {
            const cards = document.querySelectorAll('.subject-card');
            let visCount = 0;
            let sumProg = 0;
            let totChap = 0;
            let doneChap = 0;
            let pendChap = 0;
            let lecReq = 0;

            cards.forEach(card => {
              const cardSem = card.getAttribute('data-semester');
              const match = !selectedSem || selectedSem === 'all' || (cardSem && cardSem.toLowerCase() === selectedSem.toLowerCase());
              if (match) {
                card.style.display = '';
                visCount++;
                const cardCode = card.getAttribute('data-code');
                const d = subjectData.find(item => item.code === cardCode);
                if (d) {
                  sumProg += d.progress;
                  totChap += d.totalChapters;
                  doneChap += d.completedChapters;
                  pendChap += d.pendingChapters;
                  lecReq += d.lecturesNeeded;
                }
              } else {
                card.style.display = 'none';
              }
            });

            const avgProg = visCount > 0 ? Math.round(sumProg / visCount) : 0;
            
            const progVal = document.getElementById('reportOverallProgVal');
            const progBar = document.getElementById('reportOverallProgBar');
            if (progVal) progVal.textContent = avgProg + '%';
            if (progBar) {
              progBar.style.width = avgProg + '%';
              progBar.className = 'progress-bar-fill ' + (avgProg === 100 ? 'fill-green' : 'fill-blue');
            }

            const semTitle = document.getElementById('reportSemSubtitle');
            if (semTitle) {
              semTitle.textContent = selectedSem && selectedSem !== 'all' ? selectedSem : 'All Semesters';
            }

            const statSubj = document.getElementById('statTotalSubjects');
            if (statSubj) statSubj.textContent = visCount;

            const statTotCh = document.getElementById('statTotalChapters');
            if (statTotCh) statTotCh.textContent = totChap;

            const statDoneCh = document.getElementById('statDoneChapters');
            if (statDoneCh) statDoneCh.textContent = doneChap;

            const statPendCh = document.getElementById('statPendingChapters');
            if (statPendCh) statPendCh.textContent = pendChap;

            const statLecReq = document.getElementById('statLecturesReq');
            if (statLecReq) statLecReq.textContent = lecReq;

            const noSubjMsg = document.getElementById('reportNoSubjectsMsg');
            if (noSubjMsg) {
              noSubjMsg.style.display = visCount === 0 ? 'block' : 'none';
            }
          }

          window.onload = function() {
            const initialSem = ${JSON.stringify(activeSem)};
            if (initialSem && initialSem !== 'all') {
              filterReportSemester(initialSem);
            }
          };
        </script>
      </body>
      </html>
    `;

    popupWindow.document.write(reportHtml);
    popupWindow.document.close();
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              {isDean ? "Dean Monitor" : "Director Monitor"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Course Progress
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review faculty syllabus progress by class and batch.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {courseProgress ? (
              <button
                type="button"
                onClick={() => handlePrintReport(selectedSemesterFilter)}
                className="inline-flex items-center justify-center gap-2 rounded bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 transition shadow-sm"
              >
                <Printer className="h-4 w-4" />
                Print Report {selectedSemesterFilter !== "all" ? `(${selectedSemesterFilter})` : ""}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate(isDean ? "/dean" : "/director")}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </header>

        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-700" />
            <h2 className="text-base font-semibold text-slate-900">
              Find Course Progress
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1.15fr_1fr_1fr_auto]">
            <label className="text-sm font-medium text-slate-700">
              Year
              <select
                value={filters.year}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    year: event.target.value,
                    semester: "",
                  }))
                }
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600"
              >
                <option>Ist</option>
                <option>IInd</option>
                <option>IIIrd</option>
                <option>IVth</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Semester
              <select
                value={filters.semester}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    semester: event.target.value,
                  }))
                }
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600"
              >
                <option value="">All Semesters</option>
                {getSemestersForYear(filters.year).map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Batch
              <input
                value={filters.batch}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    batch: event.target.value.replace(/\D/g, ""),
                  }))
                }
                inputMode="numeric"
                placeholder="e.g. 2023"
                className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-600"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Section
              <input
                value={filters.section}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    section: event.target.value.toUpperCase(),
                  }))
                }
                maxLength={6}
                placeholder="e.g. A"
                className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-cyan-600"
              />
            </label>
            <button
              type="button"
              onClick={trackProgress}
              disabled={loading}
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {loading ? "Loading..." : "Track Progress"}
            </button>
          </div>
        </section>

        {courseProgress ? (
          <section className="mt-5 border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-cyan-50 text-cyan-700">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {courseProgress.section} | {courseProgress.year} Year | Batch{" "}
                    {courseProgress.batch}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Semester:{" "}
                    <strong className="font-semibold text-slate-700">
                      {selectedSemesterFilter !== "all"
                        ? selectedSemesterFilter
                        : courseProgress.semester || "All Semesters"}
                    </strong>{" "}
                    | Updated by:{" "}
                    <strong className="font-semibold text-slate-700">
                      {courseProgress.teacher?.name || "Faculty"}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-52">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>
                      {selectedSemesterFilter !== "all"
                        ? `${selectedSemesterFilter} Progress`
                        : "Overall Progress"}
                    </span>
                    <span>{overallProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden bg-slate-200 rounded-full">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: String(overallProgress) + "%" }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrintReport(selectedSemesterFilter)}
                  className="inline-flex items-center justify-center gap-1.5 rounded bg-cyan-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-800 transition shadow-sm"
                  title="Print all subjects and chapters course progress report"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Report {selectedSemesterFilter !== "all" ? `(${selectedSemesterFilter})` : ""}
                </button>
              </div>
            </div>

            {(courseProgress.subjects || []).length ? (
              <div className="mt-4">
                {/* Semester quick filter pills */}
                {availableSemesters.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                        Filter Semester:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSemesterFilter("all");
                          if (courseProgress.subjects?.[0]) {
                            setSelectedSubjectCode(courseProgress.subjects[0].code);
                          }
                        }}
                        className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                          selectedSemesterFilter === "all"
                            ? "bg-cyan-700 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        All Semesters ({courseProgress.subjects?.length || 0})
                      </button>
                      {availableSemesters.map((sem) => {
                        const count = (courseProgress.subjects || []).filter(
                          (s) =>
                            getSubjectSemester(s, courseProgress.semester).toLowerCase() ===
                            sem.toLowerCase()
                        ).length;
                        return (
                          <button
                            key={sem}
                            type="button"
                            onClick={() => {
                              setSelectedSemesterFilter(sem);
                              const firstMatch = (courseProgress.subjects || []).find(
                                (s) =>
                                  getSubjectSemester(s, courseProgress.semester).toLowerCase() ===
                                  sem.toLowerCase()
                              );
                              if (firstMatch) setSelectedSubjectCode(firstMatch.code);
                            }}
                            className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                              selectedSemesterFilter.toLowerCase() === sem.toLowerCase()
                                ? "bg-cyan-700 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {sem} ({count})
                          </button>
                        );
                      })}
                    </div>
                    {selectedSemesterFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSemesterFilter("all");
                          if (courseProgress.subjects?.[0]) {
                            setSelectedSubjectCode(courseProgress.subjects[0].code);
                          }
                        }}
                        className="text-xs font-medium text-cyan-700 hover:underline"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                )}

                {filteredSubjects.length > 0 ? (
                  <>
                    <label className="block max-w-md text-sm font-medium text-slate-700">
                      Subject
                      <select
                        value={selectedSubjectCode}
                        onChange={(event) => setSelectedSubjectCode(event.target.value)}
                        className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600"
                      >
                        {filteredSubjects.map((subject) => {
                          const updatingTeacher =
                            subject.teacherName ||
                            subject.teacher?.name ||
                            "";
                          const sSem = getSubjectSemester(subject, courseProgress.semester);
                          return (
                            <option key={subject.code} value={subject.code}>
                              [{sSem}] {subject.name} ({subject.code})
                              {updatingTeacher ? ` - Updating Teacher: ${updatingTeacher}` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    {selectedSubject ? (
                      <article className="mt-4 border border-slate-200">
                        <div className="grid gap-3 bg-slate-50 px-4 py-3 sm:grid-cols-[minmax(200px,1fr)_minmax(220px,0.7fr)] sm:items-center">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-cyan-700 shrink-0" />
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">
                                {selectedSubject.name}
                              </h3>
                              <p className="text-xs text-slate-500">
                                <span className="mr-2 inline-block rounded bg-cyan-100 px-1.5 py-0.5 text-[11px] font-semibold text-cyan-800">
                                  {getSubjectSemester(selectedSubject, courseProgress.semester)}
                                </span>
                                {selectedSubject.code}
                                <span className="mx-2 text-slate-300">|</span>
                                Updating Teacher:{" "}
                                <strong className="font-semibold text-slate-700">
                                  {selectedSubject.teacherName ||
                                    selectedSubject.teacher?.name ||
                                    "Not Assigned"}
                                </strong>
                              </p>
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 flex justify-between text-xs text-slate-500">
                              <span>Subject Progress</span>
                              <span>
                                {getSubjectProgress(selectedSubject.chapters)}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden bg-slate-200">
                              <div
                                className="h-full bg-emerald-600"
                                style={{
                                  width:
                                    String(getSubjectProgress(selectedSubject.chapters)) +
                                    "%",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                    {/* Summary row for pending chapters & lectures required */}
                    {selectedSubject.chapters?.length ? (
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs">
                        <span className="font-semibold text-slate-600 mr-1">Summary:</span>
                        <span className="rounded bg-cyan-50 px-2 py-0.5 border border-cyan-200 text-cyan-900 font-medium">
                          Updating Teacher:{" "}
                          <strong>
                            {selectedSubject.teacherName ||
                              selectedSubject.teacher?.name ||
                              "Not Assigned"}
                          </strong>
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 border border-slate-200 text-slate-700">
                          Total Chapters: <strong>{selectedSubjectStats.total}</strong>
                        </span>
                        <span className="rounded bg-emerald-50 px-2 py-0.5 border border-emerald-200 text-emerald-800">
                          Completed: <strong>{selectedSubjectStats.completed}</strong>
                        </span>
                        <span className="rounded bg-amber-50 px-2 py-0.5 border border-amber-200 text-amber-800">
                          Pending: <strong>{selectedSubjectStats.pending}</strong>
                        </span>
                        <span className="rounded bg-blue-50 px-2 py-0.5 border border-blue-200 text-blue-800 font-medium">
                          Total Lectures Required: <strong>{selectedSubjectStats.totalLecturesNeeded}</strong>
                        </span>
                      </div>
                    ) : null}

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600">
                          <tr>
                            <th className="px-4 py-3 w-10">#</th>
                            <th className="px-4 py-3">Chapter</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3">Progress</th>
                            <th className="px-4 py-3">Expected Date to Cover</th>
                            <th className="px-4 py-3 text-center">Lectures Required</th>
                            <th className="px-4 py-3">Last Updated Day</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(selectedSubject.chapters || []).map((chapter, index) => {
                            const isCompleted = clampPercentage(chapter.progress) >= 100;
                            return (
                              <tr
                                key={chapter.name + "-" + index}
                                className="hover:bg-slate-50/60 transition"
                              >
                                <td className="px-4 py-3 text-xs font-medium text-slate-500">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                  {chapter.name}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {isCompleted ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="h-3 w-3" /> Completed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                                      <Clock className="h-3 w-3" /> In Progress
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-10 text-right text-xs font-bold text-slate-700">
                                      {clampPercentage(chapter.progress)}%
                                    </span>
                                    <div className="h-2 flex-1 min-w-16 max-w-28 overflow-hidden bg-slate-200 rounded-full">
                                      <div
                                        className={`h-full transition-all ${
                                          isCompleted ? "bg-emerald-600" : "bg-cyan-600"
                                        }`}
                                        style={{
                                          width:
                                            String(clampPercentage(chapter.progress)) +
                                            "%",
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {!isCompleted ? (
                                    chapter.expectedDate ? (
                                      <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 border border-slate-200">
                                        <Calendar className="h-3.5 w-3.5 text-cyan-700" />
                                        {formatDate(chapter.expectedDate)}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        <AlertCircle className="h-3 w-3" /> Not specified
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {!isCompleted ? (
                                    chapter.lecturesRequired ? (
                                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200">
                                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                                        {chapter.lecturesRequired} lecture
                                        {Number(chapter.lecturesRequired) === 1 ? "" : "s"}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400">0 / Not set</span>
                                    )
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                      <Calendar className="h-3.5 w-3.5 text-cyan-700 shrink-0" />
                                      {formatUpdateDay(
                                        chapter.lastUpdated,
                                        courseProgress?.updatedAt || courseProgress?.createdAt
                                      )}
                                    </span>
                                    {formatUpdateTime(
                                      chapter.lastUpdated,
                                      courseProgress?.updatedAt || courseProgress?.createdAt
                                    ) ? (
                                      <span className="text-[11px] text-slate-500 pl-5">
                                        {formatUpdateTime(
                                          chapter.lastUpdated,
                                          courseProgress?.updatedAt || courseProgress?.createdAt
                                        )}
                                      </span>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {!selectedSubject.chapters?.length ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-4 py-5 text-center text-sm text-slate-500"
                              >
                                No chapters added for this subject.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </article>
                ) : null}
              </>
            ) : (
              <div className="border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No subjects found for semester{" "}
                <strong>{selectedSemesterFilter}</strong>.
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSemesterFilter("all")}
                    className="rounded bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800"
                  >
                    Show All Semesters
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No subjects have been added yet.
          </div>
        )}
      </section>
    ) : null}


        {searched && !loading && !courseProgress ? (
          <div className="mt-5 border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No saved course progress exists for the selected class.
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default TrackCourseProgress;
