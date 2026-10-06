import Link from "next/link";
import { Users, UserPlus, BookOpen, GraduationCap, KeyRound, ArrowRight, Shield, Briefcase, Settings, Lock } from "lucide-react";

export default function AdminDashboard() {
  const kpis = [
    { title: "Total Active Users", value: "24", icon: Users, color: "text-blue-600" },
    { title: "Total Leads", value: "1,204", icon: UserPlus, color: "text-green-600" },
    { title: "Total Enrollments", value: "856", icon: GraduationCap, color: "text-purple-600" },
    { title: "Active Courses", value: "12", icon: BookOpen, color: "text-orange-600" },
  ];

  const branches = [
    { name: "Jalandhar", leads: 450, enrollments: 320, conversion: "71%" },
    { name: "Ludhiana", leads: 520, enrollments: 380, conversion: "73%" },
    { name: "Jagraon", leads: 234, enrollments: 156, conversion: "66%" },
  ];

  const recentActivity = [
    { id: 1, user: "Raman (Ludhiana)", action: "Updated lead status to Converted", time: "10 mins ago" },
    { id: 2, user: "Priya (Jalandhar)", action: "Added 5 new leads", time: "1 hour ago" },
    { id: 3, user: "Amit (Jagraon)", action: "Scheduled follow-up", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Superadmin Master Console</h1>
            <span className="bg-purple-100 text-[#5B4B8A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              👑 Master Authority
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Cross-branch operations, user administration & institutional compliance</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/settings"
            className="px-3.5 py-2 bg-purple-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-purple-200" />
            <span>Master Password & Security</span>
          </Link>
          <Link
            href="/admin/users"
            className="px-3.5 py-2 bg-[#5B4B8A] hover:bg-[#4a3b73] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/courses"
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-[#5B4B8A]" />
            <span>Courses</span>
          </Link>
          <Link
            href="/admin/faculty-settings"
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4 text-[#5B4B8A]" />
            <span>Faculty Passcode</span>
          </Link>
        </div>
      </div>

      {/* SUPERADMIN MASTER ACTION CARDS (CLICK TO MAKE CHANGES) */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#5B4B8A]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              ⚡ Superadmin Master Actions (Click to Make Changes)
            </h2>
          </div>
          <span className="text-xs text-purple-700 font-semibold bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200">
            Full Editing Controls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-left">
          <Link
            href="/admin/settings"
            className="p-4 bg-white hover:bg-purple-50/60 rounded-xl border-2 border-purple-300 shadow-xs hover:border-[#5B4B8A] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#5B4B8A]">
                Master Password & Security
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Change Superadmin password, update Director email & institute branding.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#5B4B8A]">
              <span>Make Changes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="p-4 bg-white hover:bg-purple-50/60 rounded-xl border border-purple-200 shadow-xs hover:border-[#5B4B8A] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#5B4B8A] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#5B4B8A]">
                User & Password Management
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Add Admins, Branch Heads, Sales Reps. 1-Click view & reset passwords.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#5B4B8A]">
              <span>Make Changes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/courses"
            className="p-4 bg-white hover:bg-purple-50/60 rounded-xl border border-purple-200 shadow-xs hover:border-[#5B4B8A] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#5B4B8A]">
                Courses & Batches
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Create new courses, batch start & target end dates, assign faculty.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#5B4B8A]">
              <span>Make Changes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/faculty-settings"
            className="p-4 bg-white hover:bg-purple-50/60 rounded-xl border border-purple-200 shadow-xs hover:border-[#5B4B8A] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#5B4B8A]">
                Faculty Passcode & Roster
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Change the Institute Faculty Passcode. Add/edit teachers and subjects.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#5B4B8A]">
              <span>Make Changes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/sales"
            className="p-4 bg-white hover:bg-purple-50/60 rounded-xl border border-purple-200 shadow-xs hover:border-[#5B4B8A] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#5B4B8A]">
                Master Sales Pipeline
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Review and manage all leads across Jalandhar, Ludhiana, and Jagraon.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#5B4B8A]">
              <span>Make Changes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-gray-50 ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Comparison */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Branch Performance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map((branch) => (
                <div key={branch.name} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <h3 className="font-bold text-[#5B4B8A] mb-4">{branch.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Leads</span>
                      <span className="font-medium">{branch.leads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Enrollments</span>
                      <span className="font-medium">{branch.enrollments}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-500">Conversion</span>
                      <span className="font-bold text-green-600">{branch.conversion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & Compliance */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#5B4B8A]"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-500">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Faculty Compliance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Updated this week</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">8/12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Pending updates</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
