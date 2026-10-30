import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Info,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import TeacherActionButtons from "@/Components/TeacherActionButtons";
import { backendUrl } from "@/App";

const emptySubject = { name: "", code: "" };
const createId = () =>
  String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8);
const clampPercentage = (value) =>
  Math.min(100, Math.max(0, Number(value) || 0));
const getSubjectProgress = (chapters) =>
  chapters.length
    ? Math.round(
        chapters.reduce(
          (total, chapter) => total + clampPercentage(chapter.progress),
          0
        ) / chapters.length
      )
    : 0;

function CourseProgress() {
  const storageKey =
    "course-progress-" + (localStorage.getItem("teacherToken") || "draft");
  const [academicDetails, setAcademicDetails] = useState({
    year: "IIIrd",
    batch: "",
    semester: "Vth Semester",
    section: "A",
  });
  const [newSubject, setNewSubject] = useState(emptySubject);
  const [subjects, setSubjects] = useState([]);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [savingSubjectId, setSavingSubjectId] = useState("");
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [loadedRecordInfo, setLoadedRecordInfo] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const getAuthHeaders = () => {
    const teacherToken = localStorage.getItem("teacherToken");
    const adminLikeToken =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("deanToken") ||
      localStorage.getItem("directorToken");
    return {
      teachertoken: teacherToken || null,
      admintoken: adminLikeToken || null,
    };
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem(storageKey);
    if (!savedDraft) return;
    try {
      const draft = JSON.parse(savedDraft);
      setAcademicDetails((current) => ({
        ...current,
        ...(draft.academicDetails || {}),
        batch: draft.academicDetails?.batch || "",
        semester: draft.academicDetails?.semester || "Vth Semester",
      }));
      setSubjects(Array.isArray(draft.subjects) ? draft.subjects : []);
      setExpandedSubjectId(draft.expandedSubjectId || null);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const overallProgress = useMemo(
    () =>
      subjects.length
        ? Math.round(
            subjects.reduce(
              (total, subject) => total + getSubjectProgress(subject.chapters),
              0
            ) / subjects.length
          )
        : 0,
    [subjects]
  );

  const updateAcademicDetail = (field, value) => {
    setAcademicDetails((current) => ({ ...current, [field]: value }));
    setHasSearched(false);
  };

  const fetchCourseProgress = async (showToast = true) => {
    const year = String(academicDetails.year || "").trim();
    const batch = String(academicDetails.batch || "").trim();
    const section = String(academicDetails.section || "").trim().toUpperCase();

    if (!batch || !section) {
      if (showToast) {
        toast.error("Please enter both Batch and Section to find course progress.");
      }
      return;
    }

    try {
      setIsLoadingSaved(true);
      setHasSearched(true);
      const response = await axios.get(backendUrl + "/api/course-progress", {
        params: {
          year,
          batch,
          section,
        },
        headers: getAuthHeaders(),
      });

      if (response.data.sucess && response.data.courseProgress) {
        const saved = response.data.courseProgress;
        const normalizedSubjects = (saved.subjects || []).map((subj) => ({
          id: createId(),
          name: subj.name || "",
          code: subj.code || "",
          teacher: subj.teacher || null,
          teacherName: subj.teacher?.name || subj.teacherName || "",
          chapters: (subj.chapters || []).map((ch) => ({
            id: createId(),
            name: ch.name || "",
            progress: clampPercentage(ch.progress),
            expectedDate: ch.expectedDate || "",
            lecturesRequired:
              ch.lecturesRequired !== undefined && ch.lecturesRequired !== null && ch.lecturesRequired !== 0
                ? ch.lecturesRequired
                : "",
            lastUpdated: ch.lastUpdated || "",
          })),
        }));

        setSubjects(normalizedSubjects);
        if (saved.semester) {
          setAcademicDetails((current) => ({
            ...current,
            semester: saved.semester,
          }));
        }
        if (normalizedSubjects.length > 0) {
          setExpandedSubjectId(normalizedSubjects[0].id);
        }

        setLoadedRecordInfo({
          teacherName: saved.teacher?.name || "Faculty",
          teacherEmail: saved.teacher?.email || "",
          updatedAt:
            saved.updatedAt || saved.createdAt || new Date().toISOString(),
          subjectCount: normalizedSubjects.length,
          semester: saved.semester,
        });

        if (showToast) {
          toast.success("Previously saved course progress loaded successfully!");
        }

        localStorage.setItem(
          storageKey,
          JSON.stringify({
            academicDetails: {
              ...academicDetails,
              semester: saved.semester || academicDetails.semester,
            },
            subjects: normalizedSubjects,
            expandedSubjectId: normalizedSubjects[0]?.id || null,
          })
        );
      }
    } catch (error) {
      setLoadedRecordInfo(null);
      if (error.response?.status === 404) {
        if (showToast) {
          toast(
            "No saved course progress found for this class. You can add subjects and chapters below.",
            { icon: "ℹ️" }
          );
        }
      } else {
        if (showToast) {
          toast.error(
            error.response?.data?.message || "Unable to load course progress."
          );
        }
      }
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const addSubject = () => {
    const name = newSubject.name.trim();
    const code = newSubject.code.trim().toUpperCase();
    if (!name || !code) {
      toast.error("Enter both subject name and subject code.");
      return;
    }
    const exists = subjects.some(
      (subject) =>
        subject.name.toLowerCase() === name.toLowerCase() ||
        subject.code.toLowerCase() === code.toLowerCase()
    );
    if (exists) {
      toast.error("This subject is already in the course progress list.");
      return;
    }
    const id = createId();
    setSubjects((current) => [...current, { id, name, code, chapters: [] }]);
    setExpandedSubjectId(id);
    setNewSubject(emptySubject);
    toast.success("Subject added.");
  };

  const updateSubjectChapters = (subjectId, updater) =>
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === subjectId
          ? { ...subject, chapters: updater(subject.chapters) }
          : subject
      )
    );

  const addChapter = (subjectId) =>
    updateSubjectChapters(subjectId, (chapters) => [
      ...chapters,
      {
        id: createId(),
        name: "",
        progress: 0,
        expectedDate: "",
        lecturesRequired: "",
        lastUpdated: new Date().toISOString(),
      },
    ]);

  const updateChapter = (subjectId, chapterId, field, value) =>
    updateSubjectChapters(subjectId, (chapters) =>
      chapters.map((chapter) => {
        if (chapter.id !== chapterId) return chapter;
        let formattedValue = value;
        if (field === "progress") {
          formattedValue = clampPercentage(value);
        } else if (field === "lecturesRequired") {
          formattedValue = value === "" ? "" : Math.max(0, Number(value) || 0);
        }
        return {
          ...chapter,
          [field]: formattedValue,
          lastUpdated: new Date().toISOString(),
        };
      })
    );

  const saveSubjectProgress = async (subject) => {
    if (
      !academicDetails.year ||
      !academicDetails.section.trim() ||
      !academicDetails.batch.trim() ||
      !academicDetails.semester
    ) {
      toast.error("Select year, batch, semester, and section first.");
      return;
    }
    if (!subject.name.trim() || !subject.code.trim()) {
      toast.error("Subject name and code are required.");
      return;
    }
    if (subject.chapters.some((chapter) => !chapter.name.trim())) {
      toast.error("Every chapter needs a name before saving.");
      return;
    }

    try {
      setSavingSubjectId(subject.id);
      const response = await axios.post(
        backendUrl + "/api/course-progress/subject",
        {
          ...academicDetails,
          section: academicDetails.section.trim().toUpperCase(),
          subject,
        },
        { headers: getAuthHeaders() }
      );

      const savedProgress = response.data?.courseProgress;
      const updatedSubj = savedProgress?.subjects?.find(
        (s) => s.code.toUpperCase() === subject.code.toUpperCase()
      );

      const updatedSubjects = subjects.map((s) =>
        s.id === subject.id
          ? {
              ...s,
              teacher: updatedSubj?.teacher || s.teacher,
              teacherName: updatedSubj?.teacherName || s.teacherName || "You",
            }
          : s
      );

      setSubjects(updatedSubjects);

      localStorage.setItem(
        storageKey,
        JSON.stringify({ academicDetails, subjects: updatedSubjects, expandedSubjectId })
      );

      setLoadedRecordInfo((prev) => ({
        ...(prev || {}),
        updatedAt: new Date().toISOString(),
        subjectCount: subjects.length,
        semester: academicDetails.semester,
      }));

      toast.success(
        response.data?.message || `Progress for ${subject.name} saved successfully.`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save subject progress."
      );
    } finally {
      setSavingSubjectId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <TeacherActionButtons />
        </div>
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Academic Workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Syllabus Completion
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Maintain subject chapters and their completion progress.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ClipboardList className="h-4 w-4 text-blue-700" />
            <span>Overall progress: {overallProgress}%</span>
          </div>
        </header>

        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-700" />
              <h2 className="text-base font-semibold text-slate-900">
                Academic Details
              </h2>
            </div>
            {loadedRecordInfo ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Previously Updated Course Loaded
              </span>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm font-medium text-slate-700">
              Year
              <select
                value={academicDetails.year}
                onChange={(event) =>
                  updateAcademicDetail("year", event.target.value)
                }
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option>Ist</option>
                <option>IInd</option>
                <option>IIIrd</option>
                <option>IVth</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Batch
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 2023"
                value={academicDetails.batch}
                onChange={(event) =>
                  updateAcademicDetail(
                    "batch",
                    event.target.value.replace(/\D/g, "")
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchCourseProgress(true);
                  }
                }}
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Semester
              <select
                value={academicDetails.semester}
                onChange={(event) =>
                  updateAcademicDetail("semester", event.target.value)
                }
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option>Ist Semester</option>
                <option>IInd Semester</option>
                <option>IIIrd Semester</option>
                <option>IVth Semester</option>
                <option>Vth Semester</option>
                <option>VIth Semester</option>
                <option>VIIth Semester</option>
                <option>VIIIth Semester</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Section
              <input
                value={academicDetails.section}
                onChange={(event) =>
                  updateAcademicDetail("section", event.target.value.toUpperCase())
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchCourseProgress(true);
                  }
                }}
                placeholder="e.g. A"
                maxLength={6}
                className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <p className="text-xs text-slate-500">
              Enter class details above and click <strong>&quot;Find Previously Updated Course&quot;</strong> to view and edit previously saved progress.
            </p>
            <button
              type="button"
              onClick={() => fetchCourseProgress(true)}
              disabled={isLoadingSaved}
              className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition shadow-sm"
            >
              {isLoadingSaved ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Fetching Course...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" /> Find Previously Updated Course
                </>
              )}
            </button>
          </div>

          {loadedRecordInfo ? (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">
                    Previously saved course progress loaded ({academicDetails.year} Year, Section {academicDetails.section}, Batch {academicDetails.batch} - {academicDetails.semester})
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Last updated by: <strong>{loadedRecordInfo.teacherName}</strong> on{" "}
                    {new Date(loadedRecordInfo.updatedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    | <strong>{loadedRecordInfo.subjectCount} subject(s)</strong> loaded. You can modify chapters below and click &quot;Update Course Progress&quot;.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fetchCourseProgress(true)}
                  disabled={isLoadingSaved}
                  className="inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSaved ? "animate-spin" : ""}`} /> Refresh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubjects([]);
                    setLoadedRecordInfo(null);
                    setHasSearched(false);
                    toast("Cleared subjects. You can start fresh.", { icon: "🧹" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                >
                  Clear / Start Fresh
                </button>
              </div>
            </div>
          ) : hasSearched && !isLoadingSaved ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <div className="flex items-start gap-2.5">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">
                    No previously saved course progress found
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    No record exists for {academicDetails.year} Year, Section {academicDetails.section}, Batch {academicDetails.batch}. You can add subjects and chapters below to create one.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-[1fr_180px_auto]">
            <label className="text-sm font-medium text-slate-700">
              Subject Name
              <input
                value={newSubject.name}
                onChange={(event) =>
                  setNewSubject((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="e.g. Database Management Systems"
                className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Subject Code
              <input
                value={newSubject.code}
                onChange={(event) =>
                  setNewSubject((current) => ({ ...current, code: event.target.value }))
                }
                placeholder="e.g. CSE-501"
                className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-blue-500"
              />
            </label>
            <button
              type="button"
              onClick={addSubject}
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" /> Add Subject
            </button>
          </div>
        </section>

        <section className="mt-5 border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Added Subjects</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add chapters and update completion percentage as work progresses.
              </p>
            </div>
            <span className="text-sm font-medium text-slate-600">
              {subjects.length} subject{subjects.length === 1 ? "" : "s"}
            </span>
          </div>
          {subjects.length === 0 ? (
            <div className="border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
              No subjects added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => {
                const isExpanded = expandedSubjectId === subject.id;
                const progress = getSubjectProgress(subject.chapters);
                return (
                  <article key={subject.id} className="border border-slate-200">
                    <div className="grid gap-3 bg-slate-50 px-4 py-3 md:grid-cols-[minmax(220px,1fr)_minmax(200px,0.7fr)_auto_auto_auto] md:items-center">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 shrink-0 text-blue-700" />
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{subject.name}</h3>
                          <p className="text-xs text-slate-500">
                            {subject.code}
                            {subject.teacherName ? (
                              <span className="ml-2 font-medium text-emerald-700">
                                &bull; Faculty: {subject.teacherName}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>Total Progress</span><span>{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden bg-slate-200">
                          <div
                            className="h-full bg-emerald-600 transition-all"
                            style={{ width: String(progress) + "%" }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveSubjectProgress(subject)}
                        disabled={savingSubjectId === subject.id}
                        className="inline-flex h-9 items-center justify-center gap-2 bg-blue-700 px-3 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingSubjectId === subject.id ? "Saving..." : "Save Subject"}
                      </button>
                      <button
                        type="button"
                        title={isExpanded ? "Collapse chapters" : "Expand chapters"}
                        onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        title="Remove subject"
                        onClick={() => {
                          setSubjects((current) => current.filter((item) => item.id !== subject.id));
                          if (isExpanded) setExpandedSubjectId(null);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center border border-red-200 bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {isExpanded ? (
                      <div className="p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-blue-50/70 border border-blue-100 px-3 py-2 text-xs text-blue-900">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>
                              For incomplete chapters (&lt;100%), specify the <strong>expected completion date</strong> and <strong>no. of lectures required</strong>.
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded">
                            {subject.chapters.filter((c) => clampPercentage(c.progress) < 100).length} chapter(s) pending
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <div className="min-w-[860px]">
                            <div className="grid grid-cols-[36px_minmax(200px,1.4fr)_130px_minmax(110px,0.8fr)_170px_130px_40px] gap-3 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-600 items-center">
                              <span>#</span>
                              <span>Chapter Name</span>
                              <span>Completion (%)</span>
                              <span>Progress Bar</span>
                              <span>Expected Date</span>
                              <span>Lectures Req.</span>
                              <span className="text-center">Action</span>
                            </div>

                            <div className="divide-y divide-slate-200">
                              {subject.chapters.map((chapter, index) => {
                                const isCompleted = clampPercentage(chapter.progress) >= 100;
                                return (
                                  <div
                                    key={chapter.id}
                                    className="grid grid-cols-[36px_minmax(200px,1.4fr)_130px_minmax(110px,0.8fr)_170px_130px_40px] gap-3 py-3 items-center"
                                  >
                                    <span className="text-sm font-medium text-slate-500">{index + 1}</span>
                                    <input
                                      value={chapter.name}
                                      onChange={(event) =>
                                        updateChapter(subject.id, chapter.id, "name", event.target.value)
                                      }
                                      placeholder="Enter chapter name"
                                      className="border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 rounded bg-white"
                                    />
                                    <div className="relative">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={chapter.progress}
                                        onChange={(event) =>
                                          updateChapter(subject.id, chapter.id, "progress", event.target.value)
                                        }
                                        className="w-full border border-slate-300 px-3 py-2 pr-8 text-sm outline-none focus:border-blue-500 rounded bg-white"
                                      />
                                      <span className="pointer-events-none absolute right-3 top-2 text-sm text-slate-500 font-medium">
                                        %
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 flex-1 overflow-hidden bg-slate-200 rounded-full">
                                        <div
                                          className={`h-full transition-all ${
                                            isCompleted ? "bg-emerald-600" : "bg-blue-600"
                                          }`}
                                          style={{
                                            width: String(clampPercentage(chapter.progress)) + "%",
                                          }}
                                        />
                                      </div>
                                      <span className="w-9 text-right text-xs font-medium text-slate-600">
                                        {clampPercentage(chapter.progress)}%
                                      </span>
                                    </div>

                                    {/* Expected Date to cover chapter if not full completed */}
                                    {!isCompleted ? (
                                      <div className="relative">
                                        <input
                                          type="date"
                                          value={chapter.expectedDate || ""}
                                          onChange={(event) =>
                                            updateChapter(subject.id, chapter.id, "expectedDate", event.target.value)
                                          }
                                          className="w-full border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 rounded"
                                          title="Expected date to cover this chapter"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                        <span className="font-medium truncate">Completed</span>
                                      </div>
                                    )}

                                    {/* Number of lectures required if not full completed */}
                                    {!isCompleted ? (
                                      <div className="relative">
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder="e.g. 4"
                                          value={chapter.lecturesRequired ?? ""}
                                          onChange={(event) =>
                                            updateChapter(subject.id, chapter.id, "lecturesRequired", event.target.value)
                                          }
                                          className="w-full border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 rounded"
                                          title="No. of lectures required to cover this chapter"
                                        />
                                      </div>
                                    ) : (
                                      <div className="px-2.5 py-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded text-center font-medium">
                                        N/A (Done)
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      title="Remove chapter"
                                      onClick={() =>
                                        updateSubjectChapters(subject.id, (chapters) =>
                                          chapters.filter((item) => item.id !== chapter.id)
                                        )
                                      }
                                      className="inline-flex h-9 w-9 items-center justify-center text-red-600 hover:bg-red-50 rounded transition"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addChapter(subject.id)}
                          className="mt-4 inline-flex items-center gap-2 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 rounded transition"
                        >
                          <Plus className="h-4 w-4" /> Add Chapter
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default CourseProgress;
