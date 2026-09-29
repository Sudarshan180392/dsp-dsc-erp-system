import { BarChart, Users, AlertTriangle, CalendarDays } from 'lucide-react';

export default function FacultyDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Institute Progress Overview</h1>
        <p className="text-gray-500">Track syllabus completion across all subjects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><BarChart size={24}/></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Avg. Completion</p>
          <p className="text-3xl font-bold mt-1">45%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><Users size={24}/></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Faculties On Track</p>
          <p className="text-3xl font-bold mt-1">4</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle size={24}/></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Faculties Behind</p>
          <p className="text-3xl font-bold mt-1">2</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#5B4B8A]/10 text-[#5B4B8A] rounded-lg"><CalendarDays size={24}/></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Current Week</p>
          <p className="text-3xl font-bold mt-1">Week 12</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-6">26-Week Progress Matrix</h2>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-center border-collapse text-sm min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-2 text-left sticky left-0 bg-white border-b border-gray-200 z-10 font-medium text-gray-500 w-48">Subject / Faculty</th>
                {Array.from({ length: 26 }).map((_, i) => (
                  <th key={i} className="p-2 border-b border-gray-200 font-medium text-gray-500 min-w-[40px]">W{i+1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Dr. Smith', sub: 'Mathematics', data: [5, 8, 12, 15, 18, 22, 25, 29, 32, 36, 40, 45] },
                { name: 'Prof. Johnson', sub: 'Physics', data: [4, 7, 10, 14, 17, 20, 24, 27, 30, 33, 37, 40] },
                { name: 'Dr. Lee', sub: 'Chemistry', data: [5, 9, 14, 18, 23, 27, 32, 36, 41, 46, 50, 55] },
              ].map((faculty, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="p-3 text-left sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                    <p className="font-medium text-gray-900">{faculty.name}</p>
                    <p className="text-xs text-gray-500">{faculty.sub}</p>
                  </td>
                  {Array.from({ length: 26 }).map((_, i) => {
                    const val = faculty.data[i];
                    return (
                      <td key={i} className="p-1">
                        {val ? (
                          <div 
                            className="w-full h-8 flex items-center justify-center rounded text-xs font-medium"
                            style={{ backgroundColor: `rgba(16, 185, 129, ${Math.max(0.1, val/100)})`, color: val > 30 ? 'white' : 'black' }}
                          >
                            {val}%
                          </div>
                        ) : (
                          <div className="w-full h-8 bg-gray-50 rounded"></div>
                        )}
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
  );
}
