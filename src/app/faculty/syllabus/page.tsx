"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  Sparkles, 
  Loader2,
  ListOrdered,
  AlertCircle
} from "lucide-react";

interface SyllabusTopic {
  id?: string;
  topic_name: string;
  estimated_classes: number;
  order_index: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  completed_week?: number | null;
  notes?: string;
}

export default function SyllabusEditorPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalTopic, setModalTopic] = useState<{
    topic_name: string;
    estimated_classes: number;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    notes: string;
  }>({
    topic_name: "",
    estimated_classes: 2,
    status: "PENDING",
    notes: "",
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchSyllabus(selectedCourseId);
    }
  }, [selectedCourseId]);

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

  const fetchSyllabus = async (courseId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/faculty/syllabus?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.topics) {
          setTopics(data.topics);
        }
      }
    } catch (e) {
      console.error("Failed to load syllabus", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/faculty/syllabus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: selectedCourse.id,
          faculty_id: selectedCourse.faculty_id,
          subject: selectedCourse.assigned_subject,
          topics,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save syllabus");
      }

      setMessage({ text: "Syllabus saved successfully to database!", type: "success" });
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingIndex(null);
    setModalTopic({
      topic_name: "",
      estimated_classes: 2,
      status: "PENDING",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    setEditingIndex(idx);
    const t = topics[idx];
    setModalTopic({
      topic_name: t.topic_name,
      estimated_classes: t.estimated_classes,
      status: t.status,
      notes: t.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTopic.topic_name.trim()) return;

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...topics];
      updated[editingIndex] = {
        ...updated[editingIndex],
        ...modalTopic,
      };
      setTopics(updated);
    } else {
      // Add new
      const newTopic: SyllabusTopic = {
        id: `custom-${Date.now()}`,
        ...modalTopic,
        order_index: topics.length,
      };
      setTopics([...topics, newTopic]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteTopic = (idx: number) => {
    if (!confirm("Are you sure you want to remove this topic from your syllabus?")) return;
    const updated = topics.filter((_, i) => i !== idx);
    setTopics(updated);
  };

  const toggleTopicStatus = (idx: number) => {
    const updated = [...topics];
    const current = updated[idx].status;
    let next: "PENDING" | "IN_PROGRESS" | "COMPLETED" = "PENDING";
    if (current === "PENDING") next = "IN_PROGRESS";
    else if (current === "IN_PROGRESS") next = "COMPLETED";
    else next = "PENDING";

    updated[idx] = {
      ...updated[idx],
      status: next,
    };
    setTopics(updated);
  };

  // Metrics
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.status === "COMPLETED").length;
  const inProgressTopics = topics.filter((t) => t.status === "IN_PROGRESS").length;
  const completionPct = totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(1) : "0.0";
  const totalPlannedClasses = topics.reduce((acc, t) => acc + (Number(t.estimated_classes) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Course Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-[#5B4B8A]" /> Faculty Syllabus Manager
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Define your subject curriculum, schedule chapters, and monitor completion progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Course / Batch:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_name} ({c.batch_name || "Regular"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Course & Progress Stats Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Subject</span>
          <p className="text-lg font-bold text-[#5B4B8A] mt-1">{selectedCourse?.assigned_subject || "General"}</p>
          <span className="text-xs text-gray-500">{selectedCourse?.course_name}</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Curriculum Scope</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalTopics} <span className="text-sm font-normal text-gray-500">Topics</span></p>
          <span className="text-xs text-gray-500">~{totalPlannedClasses} total planned classes</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Topic Completion</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{completedTopics}</span>
            <span className="text-sm text-gray-500">of {totalTopics} completed</span>
          </div>
          <span className="text-xs text-amber-600 font-medium">{inProgressTopics} in progress</span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Syllabus Covered</span>
            <span className="text-sm font-bold text-[#5B4B8A]">{completionPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Number(completionPct))}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Used directly in the 26-week tracking matrix
          </span>
        </div>
      </div>

      {/* Main Topics Management Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-[#5B4B8A]" /> Syllabus Chapters & Topics
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add your own topics, adjust class hours, and mark topics completed as you teach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E8E5F5] text-[#5B4B8A] hover:bg-[#d9d4f0] rounded-xl text-sm font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#5B4B8A] text-white hover:bg-[#4a3b73] rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Syllabus</span>
            </button>
          </div>
        </div>

        {/* Topics List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5 w-16">#</th>
                <th className="px-6 py-3.5">Topic / Chapter Name</th>
                <th className="px-6 py-3.5 w-32">Est. Classes</th>
                <th className="px-6 py-3.5 w-44">Status</th>
                <th className="px-6 py-3.5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#5B4B8A]" />
                    <p className="text-xs text-gray-500 mt-2">Loading syllabus...</p>
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">No topics added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Topic" above to begin drafting your syllabus.</p>
                  </td>
                </tr>
              ) : (
                topics.map((t, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{t.topic_name}</div>
                      {t.notes && <p className="text-xs text-gray-500 mt-0.5">{t.notes}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="font-medium">{t.estimated_classes}</span> classes
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleTopicStatus(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : t.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                        title="Click to toggle status (Pending -> In Progress -> Completed)"
                      >
                        {t.status === "COMPLETED" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                          </>
                        ) : t.status === "IN_PROGRESS" ? (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-amber-600" /> In Progress
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-gray-500" /> Pending
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(idx)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit Topic"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(idx)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 bg-[#5B4B8A] text-white">
              <h3 className="text-lg font-bold">
                {editingIndex !== null ? "Edit Topic" : "Add Syllabus Topic"}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Define the curriculum chapter and planned duration
              </p>
            </div>

            <form onSubmit={handleModalSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Topic / Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={modalTopic.topic_name}
                  onChange={(e) => setModalTopic({ ...modalTopic, topic_name: e.target.value })}
                  placeholder="e.g. Ratio, Proportion & Mixtures"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/40 focus:border-[#5B4B8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Estimated Classes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={modalTopic.estimated_classes}
                    onChange={(e) =>
                      setModalTopic({ ...modalTopic, estimated_classes: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/40 focus:border-[#5B4B8A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Current Status
                  </label>
                  <select
                    value={modalTopic.status}
                    onChange={(e) =>
                      setModalTopic({
                        ...modalTopic,
                        status: e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED",
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/40 focus:border-[#5B4B8A]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Key Sub-topics / Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={modalTopic.notes}
                  onChange={(e) => setModalTopic({ ...modalTopic, notes: e.target.value })}
                  placeholder="e.g. Sub-topics: Compound ratios, alligation rule, practice problems"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/40 focus:border-[#5B4B8A]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5B4B8A] text-white hover:bg-[#4a3b73] rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  {editingIndex !== null ? "Update Topic" : "Add to Syllabus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
