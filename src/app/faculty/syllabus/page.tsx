'use client';
import { useState } from 'react';
import { Book, Save } from 'lucide-react';

export default function SyllabusEditorPage() {
  const [syllabus, setSyllabus] = useState("Module 1: Introduction\nModule 2: Advanced Topics");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Syllabus Editor</h1>
        <p className="text-gray-500 mt-1">Manage course descriptions and syllabus structure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-bold text-gray-900 mb-4 px-2">My Assigned Courses</h2>
          <div className="space-y-1">
            <button className="w-full text-left px-4 py-3 bg-[#5B4B8A]/10 text-[#5B4B8A] font-medium rounded-lg flex items-center gap-3">
              <Book size={18} /> Data Structures
            </button>
            <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-lg flex items-center gap-3 transition-colors">
              <Book size={18} /> Algorithms
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Data Structures Syllabus</h2>
            <button className="bg-[#5B4B8A] hover:bg-[#4a3d70] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Save size={16} /> Save Changes
            </button>
          </div>
          
          <div className="flex-1 min-h-[400px]">
            <textarea 
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="w-full h-full min-h-[400px] border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A] outline-none resize-none font-mono text-sm"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
