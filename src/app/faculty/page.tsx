"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Users, 
  AlertTriangle, 
  CalendarDays, 
  User, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  BarChart3,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function FacultyDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currentFacultyId, setCurrentFacultyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchCurrentFaculty();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchDashboard(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchCurrentFaculty = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.user?.id) setCurrentFacultyId(data.user.id);
      }
    } catch (e) {}
  };

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

  const fetchDashboard = async (courseId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/faculty/dashboard?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (e) {
      console.error("Failed to load dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  const facultyList = dashboardData?.facultyList || [];
  const matrix = dashboardData?.matrix || {};
  const currentWeekNo = dashboardData?.currentWeekNo || 1;
  const expectedPct = dashboardData?.expectedPct || 0;

  // Aggregate metrics
  const avgCompletion =
    facultyList.length > 0
      ? (
          facultyList.reduce((acc: number, f: any) => acc + (f.latestCompletion || 0), 0) /
          facultyList.length
        ).toFixed(1)
      : "0.0";

  const onTrackCount = facultyList.filter(
    (f: any) => (f.latestCompletion || 0) >= (f.expectedPct || expectedPct)
  ).length;

  const behindCount = facultyList.filter(
    (f: any) => (f.expectedPct || expectedPct) - (f.latestCompletion || 0) > 10
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Header & Course Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institute Progress Overview</h1>
          <p className="text-gray-500 text-sm">
            Live syllabus pacing & peer tracking across all subjects and faculties
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Course / Batch:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_name} ({c.batch_name || "Regular"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart size={22} />
            </div>
            <span className="text-xs font-semibold text-gray-400">All Subjects</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Avg. Completion</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{avgCompletion}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users size={22} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Pacing Well
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Faculties On Track</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{onTrackCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle size={22} />
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Lagging
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Faculties Behind</p>
          <p className="text-3xl font-bold text-rose-600 mt-1">{behindCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#5B4B8A]/10 text-[#5B4B8A] rounded-xl">
              <CalendarDays size={22} />
            </div>
            <span className="text-xs font-semibold text-[#5B4B8A] bg-[#E8E5F5] px-2 py-0.5 rounded-full">
              Pacing Target: {Math.round(expectedPct)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current Week</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">Week {currentWeekNo}</p>
        </div>
      </div>

      {/* Faculty Peer Progress Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Faculty Subject Status</h2>
          <Link
            href="/faculty/update"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B4B8A] hover:underline"
          >
            <span>Submit Your Week Update</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 py-12 text-center bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#5B4B8A]" />
              <p className="text-xs text-gray-500 mt-2">Loading peer tracking...</p>
            </div>
          ) : (
            facultyList.map((fac: any) => {
              const completed = Number(fac.latestCompletion) || 0;
              const exp = Number(fac.expectedPct) || expectedPct;
              const gap = exp - completed;
              const isOnTrack = gap <= 0;
              const isSlightlyBehind = gap > 0 && gap <= 10;

              return (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{fac.subject}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-gray-700">{fac.name}</span>
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
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
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>Actual: {completed.toFixed(1)}%</span>
                      <span>Expected: {exp.toFixed(1)}%</span>
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

                  {/* Audit Trail Footer */}
                  <div className="pt-2 border-t border-gray-50 text-[11px] text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Classes Taken: <strong className="text-gray-800">{fac.classesTakenTotal || 0}</strong></span>
                      <span>Last Log: <strong className="text-gray-800">W{fac.lastWeekUpdated || 0}</strong></span>
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
            })
          )}
        </div>
      </div>

      {/* 26-Week Progress Matrix Heatmap */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#5B4B8A]" /> 26-Week Pacing & Completion Matrix (%)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live peer view: Weekly cumulative syllabus coverage for each faculty member
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> &lt;25%
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-3 h-3 rounded bg-emerald-300 border border-emerald-400" /> 25–50%
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-3 h-3 rounded bg-emerald-500 text-white" /> &gt;50%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-center border-collapse text-xs min-w-[1000px]">
            <thead>
              <tr className="bg-[#E8E5F5] text-[#5B4B8A]">
                <th className="p-3 text-left sticky left-0 bg-[#E8E5F5] z-10 font-bold w-52 rounded-l-xl">
                  Subject / Faculty
                </th>
                {Array.from({ length: 26 }).map((_, i) => (
                  <th key={i} className="p-2 font-bold min-w-[38px]">
                    W{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facultyList.map((fac: any) => {
                const facMatrix = matrix[fac.id] || {};

                return (
                  <tr key={fac.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 text-left sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] z-10">
                      <p className="font-bold text-gray-900 text-xs">{fac.subject}</p>
                      <p className="text-[11px] text-gray-500">{fac.name}</p>
                    </td>
                    {Array.from({ length: 26 }).map((_, i) => {
                      const weekNo = i + 1;
                      const val = facMatrix[weekNo];

                      return (
                        <td key={i} className="p-1">
                          {val !== undefined && val !== null ? (
                            <div
                              className="w-full h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-transform hover:scale-110"
                              style={{
                                backgroundColor:
                                  val >= 50
                                    ? "#059669"
                                    : val >= 25
                                    ? "#6EE7B7"
                                    : "#D1FAE5",
                                color: val >= 50 ? "#FFFFFF" : "#065F46",
                              }}
                              title={`Week ${weekNo}: ${val}% covered`}
                            >
                              {val}%
                            </div>
                          ) : (
                            <div className="w-full h-8 bg-gray-50/70 rounded-lg flex items-center justify-center text-gray-300">
                              –
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
