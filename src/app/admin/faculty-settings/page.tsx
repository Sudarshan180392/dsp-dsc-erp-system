"use client";

import { useState, useEffect } from "react";
import { KeyRound, Eye, EyeOff, Save, Plus, Edit2, Trash2, Loader2, Check } from "lucide-react";
import PermissionGuard from "@/components/admin/PermissionGuard";

export default function FacultySettingsPage() {
  // Passcode State
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isEditingPasscode, setIsEditingPasscode] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");
  const [savingPasscode, setSavingPasscode] = useState(false);
  const [passcodeMessage, setPasscodeMessage] = useState({ text: "", type: "" });

  // Faculty Roster State
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", subject: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchPasscode();
    fetchFaculty();
  }, []);

  const fetchPasscode = async () => {
    try {
      const res = await fetch("/api/admin/faculty-settings");
      const data = await res.json();
      if (res.ok && data.passcode) {
        setPasscode(data.passcode);
        setNewPasscode(data.passcode);
      }
    } catch (err) {
      console.error("Error fetching passcode", err);
    }
  };

  const fetchFaculty = async () => {
    setLoadingFaculty(true);
    try {
      const res = await fetch("/api/admin/faculty-roster");
      const data = await res.json();
      if (res.ok) setFaculty(data);
    } catch (err) {
      console.error("Error fetching faculty", err);
    } finally {
      setLoadingFaculty(false);
    }
  };

  const handleSavePasscode = async () => {
    setSavingPasscode(true);
    setPasscodeMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/admin/faculty-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: newPasscode }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save");
      }
      
      setPasscode(newPasscode);
      setIsEditingPasscode(false);
      setPasscodeMessage({ text: "Passcode updated successfully", type: "success" });
      setTimeout(() => setPasscodeMessage({ text: "", type: "" }), 3000);
    } catch (err: any) {
      setPasscodeMessage({ text: err.message, type: "error" });
    } finally {
      setSavingPasscode(false);
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const url = editingFaculty ? `/api/admin/faculty-roster/${editingFaculty.id}` : "/api/admin/faculty-roster";
      const method = editingFaculty ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setIsModalOpen(false);
      resetForm();
      fetchFaculty();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateFaculty = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this faculty member?")) return;
    
    try {
      const res = await fetch(`/api/admin/faculty-roster/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to deactivate");
      fetchFaculty();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", subject: "" });
    setEditingFaculty(null);
  };

  const openEditModal = (member: any) => {
    setEditingFaculty(member);
    setFormData({ name: member.name, subject: member.subject });
    setIsModalOpen(true);
  };

  return (
    <PermissionGuard permission="faculty_settings" moduleName="Faculty Settings">
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Faculty Settings</h1>

      {/* Section 1: Passcode Manager */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <KeyRound className="w-5 h-5 text-[#5B4B8A]" />
          <h2 className="text-lg font-bold text-gray-800">Institute Passcode</h2>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            This passcode is used by faculty members to access their dashboard and update batch progress.
          </p>
          
          <div className="max-w-md">
            {isEditingPasscode ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new passcode"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  />
                  <button
                    onClick={handleSavePasscode}
                    disabled={savingPasscode}
                    className="px-4 py-2 bg-[#5B4B8A] text-white rounded-lg hover:bg-[#4a3b73] transition-colors flex items-center gap-2"
                  >
                    {savingPasscode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPasscode(false);
                      setNewPasscode(passcode);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1 font-mono text-lg tracking-widest text-gray-800">
                  {showPasscode ? passcode || "Not set" : "••••••••"}
                </div>
                <button
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="p-2 text-gray-500 hover:text-[#5B4B8A] transition-colors rounded-lg hover:bg-gray-200"
                  title={showPasscode ? "Hide Passcode" : "Show Passcode"}
                >
                  {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsEditingPasscode(true)}
                  className="px-4 py-2 bg-[#5B4B8A]/10 text-[#5B4B8A] rounded-lg hover:bg-[#5B4B8A]/20 transition-colors font-medium text-sm"
                >
                  Change Passcode
                </button>
              </div>
            )}
            
            {passcodeMessage.text && (
              <div className={`mt-3 text-sm flex items-center gap-1 ${passcodeMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {passcodeMessage.type === 'success' && <Check className="w-4 h-4" />}
                {passcodeMessage.text}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Faculty Roster */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Faculty Roster</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#5B4B8A] text-white text-sm rounded-lg hover:bg-[#4a3b73] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-3 font-medium text-gray-600 text-sm">Name</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-sm">Subject Specialization</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-sm">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingFaculty ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#5B4B8A]" />
                  </td>
                </tr>
              ) : faculty.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No faculty members found.
                  </td>
                </tr>
              ) : (
                faculty.map((member, idx) => (
                  <tr key={member.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-3 font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-3 text-gray-600">{member.subject}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                        member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {member.is_active && (
                          <button 
                            onClick={() => handleDeactivateFaculty(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingFaculty ? "Edit Faculty Member" : "Add Faculty Member"}
              </h2>
            </div>
            
            <form onSubmit={handleFacultySubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, React.js"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#5B4B8A] text-white rounded-lg hover:bg-[#4a3b73] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingFaculty ? "Save Changes" : "Add Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </PermissionGuard>
  );
}
