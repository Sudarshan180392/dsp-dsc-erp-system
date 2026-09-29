'use client';
import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function UpdateProgressPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weekly Progress Update</h1>
        <p className="text-gray-500 mt-1">Submit your teaching progress and class metrics for the week.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-emerald-600" />
          <p className="font-medium">Progress updated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none">
              <option>B.Tech Computer Science - Semester 3</option>
              <option>B.Tech IT - Semester 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
            <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none">
              <option>Week 12 (Oct 16 - Oct 22)</option>
              <option>Week 11 (Oct 9 - Oct 15)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classes Planned</label>
            <input type="number" required defaultValue={4} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classes Taken</label>
            <input type="number" required defaultValue={4} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Completed Till Date (%)</label>
          <div className="flex items-center gap-4">
            <input type="range" min="0" max="100" defaultValue="45" className="flex-1 accent-[#5B4B8A]" />
            <input type="number" min="0" max="100" required defaultValue="45" className="w-20 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none" />
          </div>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-gray-500">Expected: <span className="font-medium text-gray-900">46%</span></span>
            <span className="text-amber-600 font-medium">Status: Slightly Behind</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topics Covered This Week</label>
          <textarea required rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none" placeholder="List the topics covered..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Next Week Plan</label>
          <textarea rows={2} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none" placeholder="Topics planned for next week..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Student Challenges</label>
          <textarea rows={2} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none" placeholder="Any issues, slow learners, etc..."></textarea>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={loading} className="bg-[#5B4B8A] hover:bg-[#4a3d70] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70">
            {loading ? 'Saving...' : <><Save size={18} /> Save Progress</>}
          </button>
        </div>
      </form>
    </div>
  );
}
