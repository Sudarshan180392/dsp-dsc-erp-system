"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Clock, AlertTriangle, User, Calendar, BarChart3 } from "lucide-react";
import PermissionGuard from "@/components/admin/PermissionGuard";

export default function AdminAcademicsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchDashboard(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async (courseId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/faculty/dashboard?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <PermissionGuard permission="academics" moduleName="Academic Pacing Dashboard">
      <div className="space-y-6">
        {/* Header & Course Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Academic Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time faculty syllabus tracking & 26-week pacing analysis</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Batch:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_name} ({c.batch_name || "Regular Batch"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-6 text-sm text-gray-600">
          <div>
            <span className="font-semibold text-gray-800">Start Date:</span>{" "}
            {new Date(selectedCourse.start_date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold text-gray-800">Target Completion:</span>{" "}
            {new Date(selectedCourse.target_end_date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold text-gray-800">Total Duration:</span>{" "}
            {selectedCourse.total_weeks || 26} Weeks
          </div>
        </div>
      )}

      {/* Progress Cards per Faculty / Subject */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardData?.facultyList?.map((fac: any) => {
          const completed = fac.latestCompletion || 0;
          const expected = fac.expectedPct || 0;
          const gap = expected - completed;
          const isBehind = gap > 10;
          const isSlightlyBehind = gap > 0 && gap <= 10;
          const isOnTrack = gap <= 0;

          return (
            <div key={fac.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{fac.subject}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5" /> {fac.name}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isOnTrack
                      ? "bg-emerald-100 text-emerald-800"
                      : isSlightlyBehind
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isOnTrack ? "On Track" : isSlightlyBehind ? "Slightly Behind" : "Behind"}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>Actual: {completed.toFixed(1)}%</span>
                  <span>Expected: {expected.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isOnTrack ? "bg-emerald-500" : isSlightlyBehind ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, completed)}%` }}
                  />
                </div>
              </div>

              {/* Stats Footer & Audit Trail */}
              <div className="pt-2 border-t border-gray-50 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Classes Taken: <strong className="text-gray-800">{fac.classesTakenTotal || 0}</strong></span>
                  <span>Last Week: <strong className="text-gray-800">W{fac.lastWeekUpdated || 0}</strong></span>
                </div>
                {fac.lastUpdatedAt && (
                  <p className="text-gray-400 italic">
                    Updated by {fac.lastUpdatedBy || fac.name} on{" "}
                    {new Date(fac.lastUpdatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 26-Week Matrix Heatmap */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#5B4B8A]" /> 26-Week Syllabus Completion Matrix (%)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#E8E5F5] text-[#5B4B8A]">
                <th className="px-4 py-2.5 text-left font-semibold">Subject / Faculty</th>
                {Array.from({ length: 26 }, (_, i) => (
                  <th key={i + 1} className="px-2 py-2.5 font-semibold">
                    W{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboardData?.facultyList?.map((fac: any) => (
                <tr key={fac.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2 text-left font-medium text-gray-800 whitespace-nowrap">
                    {fac.subject}
                    <div className="text-[10px] text-gray-400 font-normal">{fac.name}</div>
                  </td>
                  {Array.from({ length: 26 }, (_, i) => {
                    const weekVal = dashboardData?.matrix?.[fac.id]?.[i + 1];
                    return (
                      <td
                        key={i + 1}
                        className={`px-1.5 py-2 font-mono ${
                          weekVal !== undefined
                            ? weekVal >= 75
                              ? "bg-emerald-100 text-emerald-900 font-semibold"
                              : weekVal >= 50
                              ? "bg-green-50 text-emerald-800"
                              : weekVal >= 25
                              ? "bg-lime-50 text-green-800"
                              : "bg-gray-50 text-gray-700"
                            : "text-gray-300"
                        }`}
                      >
                        {weekVal !== undefined ? `${weekVal}%` : "–"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </PermissionGuard>
  );
}
