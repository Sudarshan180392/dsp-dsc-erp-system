"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Phone, Mail, Calendar, User, Building2, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Lead } from "@/lib/types";
import PermissionGuard from "@/components/admin/PermissionGuard";

export default function AdminSalesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sales/leads?adminAll=true");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  const branches = ["Jalandhar", "Ludhiana", "Jagraon"];
  const statuses = ["NEW", "CONTACTED", "DEMO_SCHEDULED", "ENROLLED", "LOST"];

  const filteredLeads = leads.filter((lead) => {
    const matchesBranch = selectedBranch === "ALL" || lead.branch === selectedBranch;
    const matchesStatus = selectedStatus === "ALL" || lead.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      lead.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBranch && matchesStatus && matchesSearch;
  });

  const getBranchLeadCount = (branch: string) => leads.filter((l) => l.branch === branch).length;
  const getBranchEnrollments = (branch: string) => leads.filter((l) => l.branch === branch && l.status === "ENROLLED").length;

  return (
    <PermissionGuard permission="sales_pipeline" moduleName="Sales Pipeline">
      <div className="space-y-6">
        {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Sales Pipeline</h1>
          <p className="text-gray-500 text-sm">Superadmin 360° overview across all branches</p>
        </div>
        <button
          onClick={fetchLeads}
          className="self-start md:self-auto px-4 py-2 bg-[#5B4B8A] text-white rounded-lg hover:bg-[#4A3C75] text-sm font-medium transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Branch KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
            <span>Total Leads</span>
            <Building2 className="w-5 h-5 text-[#5B4B8A]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{leads.length}</p>
          <p className="text-xs text-gray-400 mt-1">Across 3 branches</p>
        </div>

        {branches.map((b) => (
          <div key={b} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
              <span>{b}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#E8E5F5] text-[#5B4B8A] font-semibold">
                {getBranchEnrollments(b)} Enrolled
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{getBranchLeadCount(b)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Conversion: {getBranchLeadCount(b) > 0 ? ((getBranchEnrollments(b) / getBranchLeadCount(b)) * 100).toFixed(1) : 0}%
            </p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Branch Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedBranch("ALL")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedBranch === "ALL" ? "bg-[#5B4B8A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Branches
          </button>
          {branches.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBranch(b)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedBranch === b ? "bg-[#5B4B8A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Status Filter and Search */}
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
            />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#E8E5F5] text-[#5B4B8A] font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Rep</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading consolidated leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No leads match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.student_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-[#5B4B8A] border border-purple-200">
                        {lead.branch}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-mono text-xs">{lead.phone}</span>
                        {lead.email && <span className="text-xs text-gray-400">{lead.email}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          lead.status === "ENROLLED"
                            ? "bg-emerald-100 text-emerald-800"
                            : lead.status === "LOST"
                            ? "bg-rose-100 text-rose-800"
                            : lead.status === "DEMO_SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "CONTACTED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{lead.assigned_to_name || "Unassigned"}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </PermissionGuard>
  );
}
