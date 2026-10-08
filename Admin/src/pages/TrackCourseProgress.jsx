import { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "@/App";

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

function TrackCourseProgress() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    year: "IIIrd",
    batch: "",
    section: "A",
  });
  const [courseProgress, setCourseProgress] = useState(null);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const overallProgress = useMemo(() => {
    const subjects = courseProgress?.subjects || [];
    return subjects.length
      ? Math.round(
          subjects.reduce(
            (total, subject) => total + getSubjectProgress(subject.chapters),
            0
          ) / subjects.length
        )
      : 0;
  }, [courseProgress]);

  const selectedSubject = useMemo(
    () =>
      (courseProgress?.subjects || []).find(
        (subject) => subject.code === selectedSubjectCode
      ) || null,
    [courseProgress, selectedSubjectCode]
  );

  const trackProgress = async () => {
    if (!filters.batch.trim() || !filters.section.trim()) {
      toast.error("Enter both batch and section.");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const response = await axios.get(backendUrl + "/api/course-progress", {
        params: {
          year: filters.year,
          batch: filters.batch,
          section: filters.section,
        },
        headers: {
          admintoken: localStorage.getItem("directorToken"),
        },
      });
      const savedProgress = response.data.courseProgress;
      setCourseProgress(savedProgress);
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

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Director Monitor
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Course Progress
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review faculty syllabus completion by class and batch.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/director")}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </header>

        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-700" />
            <h2 className="text-base font-semibold text-slate-900">
              Find Course Progress
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="text-sm font-medium text-slate-700">
              Year
              <select
                value={filters.year}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    year: event.target.value,
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
                    Semester: {courseProgress.semester || "-"} | Updated by:{" "}
                    {courseProgress.teacher?.name || "Faculty"}
                  </p>
                </div>
              </div>
              <div className="min-w-52">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Overall Completion</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden bg-slate-200">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: String(overallProgress) + "%" }}
                  />
                </div>
              </div>
            </div>

            {(courseProgress.subjects || []).length ? (
              <div className="mt-4">
                <label className="block max-w-md text-sm font-medium text-slate-700">
                  Subject
                  <select
                    value={selectedSubjectCode}
                    onChange={(event) => setSelectedSubjectCode(event.target.value)}
                    className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600"
                  >
                    {(courseProgress.subjects || []).map((subject) => (
                      <option key={subject.code} value={subject.code}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </label>

                {selectedSubject ? (
                  <article className="mt-4 border border-slate-200">
                    <div className="grid gap-3 bg-slate-50 px-4 py-3 sm:grid-cols-[minmax(200px,1fr)_minmax(220px,0.7fr)] sm:items-center">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-cyan-700" />
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {selectedSubject.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {selectedSubject.code}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>Subject Completion</span>
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
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Chapter</th>
                            <th className="px-4 py-3 text-right font-semibold">
                              Completion
                            </th>
                            <th className="px-4 py-3 font-semibold">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedSubject.chapters || []).map((chapter) => (
                            <tr key={chapter.name} className="border-b border-slate-100 last:border-0">
                              <td className="px-4 py-3 text-slate-700">
                                {chapter.name}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-slate-700">
                                {clampPercentage(chapter.progress)}%
                              </td>
                              <td className="px-4 py-3">
                                <div className="h-2 min-w-28 overflow-hidden bg-slate-200">
                                  <div
                                    className="h-full bg-emerald-600"
                                    style={{
                                      width:
                                        String(clampPercentage(chapter.progress)) +
                                        "%",
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                          {!selectedSubject.chapters?.length ? (
                            <tr>
                              <td colSpan={3} className="px-4 py-5 text-center text-sm text-slate-500">
                                No chapters added for this subject.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </article>
                ) : null}
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
