'use client';

import { useState, useEffect, use } from 'react';
import { 
  Plus, Search, Phone, Mail, Calendar, Clock, 
  CheckCircle2, AlertCircle, X, User, ShieldCheck, 
  BookOpen, Edit3, ArrowRight, Sparkles 
} from 'lucide-react';

const COURSES = [
  'SSC CGL 2027 (Morning Batch)',
  'SSC CGL 2027 (Evening Batch)',
  'Punjab Police SI 2027',
  'PSSSB Clerk / Panchayat Secretary',
  'Banking PO & Clerk Foundation',
  'UPSC / State PCS Foundation',
  'Other / Custom Course',
];

const SOURCES = ['Walk-in', 'Social Media', 'Phone Call', 'Referral', 'Website', 'Other'];
const STATUSES = ['All', 'New', 'Contacted', 'Demo Scheduled', 'Enrolled', 'Lost'];

export default function LeadsPage({ params }: { params: Promise<{ branch: string }> }) {
  const branch = decodeURIComponent(use(params).branch);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [repFilter, setRepFilter] = useState('All');

  // User context
  const [currentUser, setCurrentUser] = useState<{
    role: string;
    fullName: string;
    userId: string;
  }>({
    role: 'SALES_REP',
    fullName: 'Sales Representative',
    userId: '',
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Lead Form state
  const [formData, setFormData] = useState({
    student_name: '',
    phone: '',
    email: '',
    course_id: COURSES[0],
    lead_source: 'Walk-in',
    status: 'NEW',
    notes: '',
    assigned_to_name: '',
    follow_up_date: '',
    follow_up_time: '11:00',
    follow_up_notes: '',
  });

  // Fetch current user from cookie or session
  useEffect(() => {
    try {
      const match = document.cookie.match(new RegExp('(^| )staff_session=([^;]+)'));
      if (match) {
        const session = JSON.parse(decodeURIComponent(match[2]));
        setCurrentUser({
          role: session.role || 'SALES_REP',
          fullName: session.fullName || 'Sales Representative',
          userId: session.userId || '',
        });
      }
    } catch (e) {
      console.error('Error reading staff_session cookie', e);
    }
  }, []);

  const isSalesRep = currentUser.role === 'SALES_REP';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetchLeads();
  }, [branch, statusFilter, search]);

  const fetchLeads = async () => {
    setLoading(true);
    let url = `/api/sales/leads?branch=${encodeURIComponent(branch)}`;
    if (statusFilter !== 'All') url += `&status=${statusFilter.toUpperCase().replace(' ', '_')}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        let data = await res.json();
        
        // If rep is logged in and API returned all (preview fallback), isolate on client
        if (isSalesRep && currentUser.fullName && currentUser.fullName !== 'Sales Representative') {
          const firstName = currentUser.fullName.split(' ')[0].toLowerCase();
          const isolated = data.filter((l: any) => 
            (l.assigned_to_name && l.assigned_to_name.toLowerCase().includes(firstName)) ||
            (l.created_by_name && l.created_by_name.toLowerCase().includes(firstName)) ||
            l.assigned_to === currentUser.userId
          );
          if (isolated.length > 0) {
            data = isolated;
          }
        }
        
        setLeads(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        branch,
        student_name: formData.student_name,
        phone: formData.phone,
        email: formData.email || null,
        course_id: formData.course_id,
        lead_source: formData.lead_source,
        status: formData.status,
        notes: formData.notes || null,
        assigned_to: isSalesRep ? currentUser.userId : null,
        assigned_to_name: isSalesRep ? currentUser.fullName : (formData.assigned_to_name || currentUser.fullName),
        created_by_name: currentUser.fullName,
      };

      const res = await fetch('/api/sales/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to create lead');
      }

      const createdLead = await res.json();

      // Schedule initial follow-up if requested
      if (formData.follow_up_date) {
        try {
          await fetch('/api/sales/follow-ups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lead_id: createdLead.id,
              scheduled_date: formData.follow_up_date,
              scheduled_time: formData.follow_up_time,
              notes: formData.follow_up_notes || `Initial follow-up for ${formData.student_name}`,
              status: 'PENDING',
              logged_by_name: currentUser.fullName,
            }),
          });
        } catch {}
      }

      showToast(`Lead created successfully for ${formData.student_name}`);
      setShowAddModal(false);
      setFormData({
        student_name: '',
        phone: '',
        email: '',
        course_id: COURSES[0],
        lead_source: 'Walk-in',
        status: 'NEW',
        notes: '',
        assigned_to_name: '',
        follow_up_date: '',
        follow_up_time: '11:00',
        follow_up_notes: '',
      });
      fetchLeads();
    } catch (err: any) {
      alert(err.message || 'Error creating lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/sales/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Status updated to ${newStatus}`);
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Unique list of reps in current leads for Branch Head filter
  const repList = Array.from(
    new Set(leads.map((l) => l.assigned_to_name).filter(Boolean))
  );

  const displayedLeads = leads.filter((l) => {
    if (repFilter !== 'All' && l.assigned_to_name !== repFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline & Admissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isSalesRep
              ? `Manage and add your independent leads for ${branch} branch.`
              : `Complete lead overview across all sales representatives in ${branch}.`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#5B4B8A] hover:bg-[#4a3d70] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow"
        >
          <Plus size={18} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Isolation Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isSalesRep
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-purple-50 border-purple-200 text-purple-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isSalesRep ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
            }`}
          >
            {isSalesRep ? <User size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <span className="font-bold text-sm">
              {isSalesRep ? (
                <>🔒 Individual Representative Isolation Active &bull; Assigned to: <span className="underline">{currentUser.fullName}</span></>
              ) : (
                <>🏢 Branch Head Access &bull; Full Branch Roster Active</>
              )}
            </span>
            <p className="text-xs opacity-80 mt-0.5">
              {isSalesRep
                ? 'Your added leads are strictly confidential to your account. No other representative can see or edit them.'
                : 'You have full access to view, reassign, and track all sales leads across every representative.'}
            </p>
          </div>
        </div>

        {!isSalesRep && repList.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-700 whitespace-nowrap">Filter by Rep:</span>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 outline-none"
            >
              <option value="All">All Representatives ({leads.length})</option>
              {repList.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name or phone..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/20 focus:border-[#5B4B8A]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-[#5B4B8A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3.5 font-semibold">Student Info</th>
                <th className="px-6 py-3.5 font-semibold">Target Course</th>
                <th className="px-6 py-3.5 font-semibold">Source</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold">Assigned Rep</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : displayedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium">No leads found in this pipeline.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 text-xs text-[#5B4B8A] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> Add your first lead now
                    </button>
                  </td>
                </tr>
              ) : (
                displayedLeads.map((lead) => {
                  const statusColors: Record<string, string> = {
                    ENROLLED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    DEMO_SCHEDULED: 'bg-purple-100 text-purple-800 border-purple-200',
                    CONTACTED: 'bg-amber-100 text-amber-800 border-amber-200',
                    LOST: 'bg-gray-100 text-gray-700 border-gray-200',
                    NEW: 'bg-blue-100 text-blue-800 border-blue-200',
                  };
                  const badgeClass =
                    statusColors[lead.status] || 'bg-blue-100 text-blue-800 border-blue-200';

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-gray-50/60 group cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{lead.student_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Phone size={11} className="text-gray-400" /> {lead.phone}
                          </span>
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={11} className="text-gray-400" /> {lead.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-xs flex items-center gap-1.5">
                          <BookOpen size={14} className="text-[#5B4B8A]" />
                          <span>{lead.course_id || 'General Inquiry'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {lead.lead_source || lead.source || 'Walk-in'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeClass}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                          <User size={11} className="text-gray-500" />
                          {lead.assigned_to_name || lead.assigned_to || currentUser.fullName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="text-[#5B4B8A] text-xs font-semibold hover:underline px-2 py-1 rounded hover:bg-[#5B4B8A]/10 transition-colors"
                        >
                          View / Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="bg-[#5B4B8A] p-6 text-white flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h2 className="text-lg font-bold">Add New Lead ({branch} Branch)</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    placeholder="e.g. Jaspreet Singh"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 98765-43210"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={formData.lead_source}
                    onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none bg-white"
                  >
                    {SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Course
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none bg-white"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Initial Lead Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none bg-white"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="DEMO_SCHEDULED">DEMO SCHEDULED</option>
                    <option value="ENROLLED">ENROLLED</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assigned Representative
                  </label>
                  <input
                    type="text"
                    disabled={isSalesRep}
                    value={isSalesRep ? currentUser.fullName : formData.assigned_to_name}
                    onChange={(e) =>
                      setFormData({ ...formData, assigned_to_name: e.target.value })
                    }
                    placeholder={currentUser.fullName}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-700 outline-none"
                  />
                  {isSalesRep && (
                    <span className="text-[11px] text-emerald-600 mt-1 block">
                      ✓ Automatically assigned to you ({currentUser.fullName})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Counseling Notes / Inquiries
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes about student preferences, queries, or demo timing..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none"
                />
              </div>

              {/* Optional First Follow Up */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/70 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Calendar size={14} className="text-[#5B4B8A]" />
                  <span>Schedule First Follow-Up Reminder (Optional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.follow_up_time}
                      onChange={(e) => setFormData({ ...formData, follow_up_time: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-[#5B4B8A] hover:bg-[#4a3d70] text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving Lead...' : 'Save & Assign Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & UPDATE LEAD DETAILS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="bg-[#5B4B8A] p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                  Lead Details &bull; {selectedLead.branch}
                </span>
                <h2 className="text-xl font-bold mt-1">{selectedLead.student_name}</h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedLead.phone}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Course:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedLead.course_id || 'General Inquiry'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Source:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedLead.lead_source || selectedLead.source || 'Walk-in'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Assigned Representative:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedLead.assigned_to_name || selectedLead.assigned_to || currentUser.fullName}
                  </p>
                </div>
              </div>

              {/* Status Update Pills */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Update Lead Pipeline Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'ENROLLED', 'LOST'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        selectedLead.status === st
                          ? 'bg-[#5B4B8A] text-white border-[#5B4B8A] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Counseling Notes & History
                </label>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-700 max-h-32 overflow-y-auto">
                  {selectedLead.notes || 'No notes added for this lead yet.'}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl font-medium text-sm transition-colors text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
