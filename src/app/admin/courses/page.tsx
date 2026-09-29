"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronUp, Users } from "lucide-react";
import PermissionGuard from "@/components/admin/PermissionGuard";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    course_name: "",
    batch_name: "",
    start_date: "",
    target_end_date: "",
    weeks: 12,
    description: "",
    status: "Upcoming",
    subjects: [] as { faculty_id: string; subject_name: string }[]
  });

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (res.ok) setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await fetch("/api/admin/faculty-roster");
      const data = await res.json();
      if (res.ok) setFacultyList(data.filter((f: any) => f.is_active));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses";
      const method = editingCourse ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setIsModalOpen(false);
      resetForm();
      fetchCourses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchCourses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      course_name: "",
      batch_name: "",
      start_date: "",
      target_end_date: "",
      weeks: 12,
      description: "",
      status: "Upcoming",
      subjects: []
    });
    setEditingCourse(null);
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setFormData({
      course_name: course.course_name,
      batch_name: course.batch_name,
      start_date: course.start_date?.split('T')[0] || "",
      target_end_date: course.target_end_date?.split('T')[0] || "",
      weeks: course.weeks || 12,
      description: course.description || "",
      status: course.status || "Upcoming",
      subjects: course.course_subjects?.map((cs: any) => ({
        faculty_id: cs.faculty?.id || "",
        subject_name: cs.subject_name
      })) || []
    });
    setIsModalOpen(true);
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { faculty_id: "", subject_name: "" }]
    });
  };

  const updateSubject = (index: number, field: string, value: string) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setFormData({ ...formData, subjects: newSubjects });
  };

  const removeSubject = (index: number) => {
    const newSubjects = [...formData.subjects];
    newSubjects.splice(index, 1);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PermissionGuard permission="courses" moduleName="Course & Batch Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Courses & Batches</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B4B8A] text-white rounded-lg hover:bg-[#4a3b73] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Course</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-10 px-4 py-4"></th>
                <th className="px-6 py-4 font-medium text-gray-600 text-sm">Course & Batch</th>
                <th className="px-6 py-4 font-medium text-gray-600 text-sm">Timeline</th>
                <th className="px-6 py-4 font-medium text-gray-600 text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#5B4B8A]" />
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                courses.map((course, idx) => (
                  <React.Fragment key={course.id}>
                    <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-4 py-4">
                        <button 
                          onClick={() => toggleRow(course.id)}
                          className="p-1 text-gray-400 hover:text-[#5B4B8A] transition-colors rounded"
                        >
                          {expandedRows[course.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{course.course_name}</div>
                        <div className="text-sm text-gray-500">{course.batch_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{course.start_date ? new Date(course.start_date).toLocaleDateString() : 'TBD'}</div>
                        <div className="text-xs text-gray-500">{course.weeks} Weeks</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                          course.status === 'Active' ? 'bg-green-100 text-green-700' : 
                          course.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(course)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(course.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {expandedRows[course.id] && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={5} className="px-10 py-4 border-b border-gray-100">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" /> Assigned Faculty & Subjects
                            </h4>
                            {course.course_subjects && course.course_subjects.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.course_subjects.map((cs: any) => (
                                  <div key={cs.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                                    <span className="font-medium text-gray-800 text-sm">{cs.subject_name}</span>
                                    <span className="text-sm text-gray-600">{cs.faculty?.name || 'Unassigned'}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No subjects assigned yet.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCourse ? "Edit Course & Batch" : "Create New Course"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    placeholder="e.g., Full Stack Development"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                  <input
                    type="text"
                    required
                    value={formData.batch_name}
                    onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                    placeholder="e.g., FSD-2026-A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.target_end_date}
                    onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.weeks}
                    onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                ></textarea>
              </div>

              {/* Subjects & Faculty Assignment */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Subjects & Faculty</h3>
                  <button
                    type="button"
                    onClick={addSubject}
                    className="text-sm text-[#5B4B8A] font-medium hover:text-[#4a3b73]"
                  >
                    + Add Subject
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Subject Name (e.g. Frontend)"
                          value={subject.subject_name}
                          onChange={(e) => updateSubject(index, "subject_name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A] text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <select
                          required
                          value={subject.faculty_id}
                          onChange={(e) => updateSubject(index, "faculty_id", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A] text-sm"
                        >
                          <option value="">Select Faculty...</option>
                          {facultyList.map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.subject})</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.subjects.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No subjects added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#5B4B8A] text-white rounded-lg hover:bg-[#4a3b73] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCourse ? "Save Changes" : "Create Course"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </PermissionGuard>
  );
}
