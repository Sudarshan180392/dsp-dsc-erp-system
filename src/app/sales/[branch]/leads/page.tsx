'use client';
import { useState, useEffect, use } from 'react';
import { Plus, Search, Filter, Phone, Mail, Calendar, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LeadsPage({ params }: { params: Promise<{ branch: string }> }) {
  const branch = decodeURIComponent(use(params).branch);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  useEffect(() => {
    fetchLeads();
  }, [branch, statusFilter, search]);

  const fetchLeads = async () => {
    setLoading(true);
    let url = `/api/sales/leads?branch=${encodeURIComponent(branch)}`;
    if (statusFilter !== 'All') url += `&status=${statusFilter}`;
    if (search) url += `&search=${search}`;
    
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const statuses = ['All', 'New', 'Contacted', 'Demo Scheduled', 'Enrolled', 'Lost'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-[#5B4B8A] hover:bg-[#4a3d70] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Lead
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
          {statuses.map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-[#5B4B8A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Course & Source</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Assigned To</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No leads found</td></tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 group cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{lead.student_name}</div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lead.course_id || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-1">{lead.source}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.assigned_to}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#5B4B8A] text-sm font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
            {/* Form omitted for brevity, would call API */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#5B4B8A] text-white rounded-lg font-medium hover:bg-[#4a3d70]">Save Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
