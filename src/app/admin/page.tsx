import { Users, UserPlus, BookOpen, GraduationCap } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Superadmin Master Console</h1>
            <span className="bg-purple-100 text-[#5B4B8A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              👑 Master Authority
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Cross-branch operations, enrollment performance & institutional compliance</p>
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
