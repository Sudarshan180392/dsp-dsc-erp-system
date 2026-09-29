"use client";

import { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  course_name: string;
  batch_name?: string;
  start_date: string;
  target_end_date: string;
  total_weeks: number;
  assigned_subject: string;
  faculty_id?: string;
}

interface SyllabusTopic {
  id?: string;
  topic_name: string;
  estimated_classes: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export default function UpdateProgressPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [syllabusTopics, setSyllabusTopics] = useState<SyllabusTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // Form Fields
  const [classesPlanned, setClassesPlanned] = useState<number>(4);
  const [classesTaken, setClassesTaken] = useState<number>(4);
  const [completedPct, setCompletedPct] = useState<number>(10);
  const [topicsCoveredText, setTopicsCoveredText] = useState<string>("");
  const [nextWeekPlan, setNextWeekPlan] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchSyllabusAndLogs(selectedCourseId, selectedWeek);
    }
  }, [selectedCourseId, selectedWeek]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/faculty/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch courses", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyllabusAndLogs = async (courseId: string, weekNo: number) => {
    try {
      // 1. Fetch syllabus topics for this faculty
      const sylRes = await fetch(`/api/faculty/syllabus?courseId=${courseId}`);
      if (sylRes.ok) {
        const sylData = await sylRes.json();
        const tops = sylData.topics || [];
        setSyllabusTopics(tops);

        // Pre-fill completed topics
        const completedIds = tops.filter((t: any) => t.status === "COMPLETED").map((t: any) => t.id || t.topic_name);
        setSelectedTopicIds(completedIds);
      }

      // 2. Fetch existing log for this week if already submitted
      const logRes = await fetch(`/api/faculty/logs?course_id=${courseId}&week_no=${weekNo}`);
      if (logRes.ok) {
        const logs = await logRes.json();
        if (logs && logs.length > 0) {
          const log = logs[0];
          setClassesPlanned(log.classes_planned ?? 4);
          setClassesTaken(log.classes_taken ?? 4);
          setCompletedPct(Number(log.completed_pct) || 0);
          setTopicsCoveredText(log.topics_covered || "");
          setNextWeekPlan(log.next_week_plan || "");
          setRemarks(log.remarks || "");
        } else {
          // Reset to sensible defaults for new week
          setClassesPlanned(4);
          setClassesTaken(4);
          setTopicsCoveredText("");
          setNextWeekPlan("");
          setRemarks("");
        }
      }
    } catch (e) {
      console.error("Failed to load syllabus/logs", e);
    }
  };

  const handleTopicCheck = (topic: SyllabusTopic) => {
    const key = topic.id || topic.topic_name;
    const isCurrentlyChecked = selectedTopicIds.includes(key);
    let newSelected: string[];

    if (isCurrentlyChecked) {
      newSelected = selectedTopicIds.filter((id) => id !== key);
    } else {
      newSelected = [...selectedTopicIds, key];
    }

    setSelectedTopicIds(newSelected);

    // Auto-calculate suggested completion %
    if (syllabusTopics.length > 0) {
      const calculated = ((newSelected.length / syllabusTopics.length) * 100).toFixed(1);
      setCompletedPct(parseFloat(calculated));
    }

    // Auto-append checked topic names to topics covered
    const checkedTopicNames = syllabusTopics
      .filter((t) => newSelected.includes(t.id || t.topic_name))
      .map((t) => t.topic_name);
    
    setTopicsCoveredText(checkedTopicNames.join(", "));
  };

  const calculateWeekDateRange = (startDateStr: string, weekNo: number) => {
    if (!startDateStr) return "";
    const start = new Date(startDateStr);
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (weekNo - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setSubmitting(true);
    setStatusMessage(null);

    const dateRange = calculateWeekDateRange(selectedCourse.start_date, selectedWeek);
    const dates = dateRange.split("–");
    const weekStartDate = dates[0] ? new Date(dates[0].trim()).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    const weekEndDate = dates[1] ? new Date(dates[1].trim()).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/faculty/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: selectedCourse.id,
          faculty_id: selectedCourse.faculty_id,
          subject: selectedCourse.assigned_subject,
          week_no: selectedWeek,
          week_start_date: weekStartDate,
          week_end_date: weekEndDate,
          topics_covered: topicsCoveredText,
          classes_planned: classesPlanned,
          classes_taken: classesTaken,
          completed_pct: completedPct,
          next_week_plan: nextWeekPlan,
          remarks: remarks,
          completed_topic_ids: selectedTopicIds.filter((id) => !id.startsWith("template-")),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit progress");
      }

      setStatusMessage({
        text: `Week ${selectedWeek} progress saved successfully! Master Academic Dashboard and Peer Matrix updated.`,
        type: "success",
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Expected progress calculation
  const totalWeeks = selectedCourse?.total_weeks || 26;
  const expectedPct = Math.min(100, Math.round((selectedWeek / totalWeeks) * 100));
  const pacingGap = completedPct - expectedPct;
  const pacingStatus = pacingGap >= 0 ? "On Track" : pacingGap >= -10 ? "Slightly Behind" : "Behind";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#5B4B8A]" /> Weekly Progress Update
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Log covered syllabus topics, track weekly classes, and update your pacing.
          </p>
        </div>

        <Link
          href="/faculty/syllabus"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E8E5F5] text-[#5B4B8A] hover:bg-[#d9d4f0] rounded-xl text-xs font-semibold transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Syllabus Topics</span>
        </Link>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        {/* Course & Week Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Course / Batch</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_name} ({c.batch_name || "Regular"}) – {c.assigned_subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Academic Week</label>
              <span className="text-xs text-gray-500 font-medium">
                {calculateWeekDateRange(selectedCourse?.start_date, selectedWeek)}
              </span>
            </div>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none bg-white"
            >
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w} ({calculateWeekDateRange(selectedCourse?.start_date, w)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Syllabus-linked Topic Checkoff Section */}
        <div className="space-y-3 p-5 bg-[#5B4B8A]/5 rounded-2xl border border-[#5B4B8A]/15">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5B4B8A]" />
                Syllabus Topics Covered in {selectedCourse?.assigned_subject}
              </h3>
              <p className="text-xs text-gray-500">
                Check off topics you have covered to automatically calculate your cumulative progress percentage!
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-lg border border-[#5B4B8A]/20 text-[#5B4B8A]">
              {selectedTopicIds.length} of {syllabusTopics.length} Topics Checked
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 mt-2">
            {syllabusTopics.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">
                No syllabus topics defined yet.{" "}
                <Link href="/faculty/syllabus" className="text-[#5B4B8A] font-semibold underline">
                  Click here to set up your syllabus.
                </Link>
              </p>
            ) : (
              syllabusTopics.map((topic, idx) => {
                const key = topic.id || topic.topic_name;
                const isChecked = selectedTopicIds.includes(key);

                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? "bg-white border-[#5B4B8A] shadow-xs text-gray-900 font-medium"
                        : "bg-white/60 border-gray-200 text-gray-600 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTopicCheck(topic)}
                      className="h-4 w-4 rounded border-gray-300 text-[#5B4B8A] focus:ring-[#5B4B8A]"
                    />
                    <span className="flex-1">{topic.topic_name}</span>
                    <span className="text-[11px] text-gray-400">~{topic.estimated_classes} classes</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Classes Metrics & Syllabus Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Classes Planned</label>
            <input
              type="number"
              min="0"
              required
              value={classesPlanned}
              onChange={(e) => setClassesPlanned(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Classes Taken</label>
            <input
              type="number"
              min="0"
              required
              value={classesTaken}
              onChange={(e) => setClassesTaken(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Course Completed Till Date (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={completedPct}
              onChange={(e) => setCompletedPct(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold text-[#5B4B8A] focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none"
            />
          </div>
        </div>

        {/* Real-time Pacing Feedback Banner */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#5B4B8A]" />
            <div>
              <span className="font-bold text-gray-900">Pacing Status for Week {selectedWeek}:</span>{" "}
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  pacingStatus === "On Track"
                    ? "bg-emerald-100 text-emerald-800"
                    : pacingStatus === "Slightly Behind"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {pacingStatus}
              </span>
            </div>
          </div>
          <div className="text-gray-500">
            Actual: <strong className="text-gray-900">{completedPct}%</strong> | Expected:{" "}
            <strong className="text-gray-900">{expectedPct}%</strong>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Topics Covered This Week (Notes)
            </label>
            <textarea
              rows={2}
              value={topicsCoveredText}
              onChange={(e) => setTopicsCoveredText(e.target.value)}
              placeholder="e.g. Ratio & Proportion basic formulas, cross multiplication method"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Plan for Next Week
            </label>
            <textarea
              rows={2}
              value={nextWeekPlan}
              onChange={(e) => setNextWeekPlan(e.target.value)}
              placeholder="e.g. Mixtures & Alligation problem set, Tier 1 previous year questions"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Remarks & Student Challenges (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Students needed extra practice in quadratic factorisation; held 30min doubt session"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5B4B8A]/30 focus:border-[#5B4B8A] outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-[#5B4B8A] text-white hover:bg-[#4a3b73] rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Submit Progress Log</span>
          </button>
        </div>
      </form>
    </div>
  );
}
