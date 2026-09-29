"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Shield, Lock, CheckCircle2 } from "lucide-react";
import { AdminPermissions } from "@/lib/types";

const DEFAULT_PERMISSIONS: AdminPermissions = {
  user_management: false,
  faculty_settings: true,
  courses: true,
  sales_pipeline: true,
  academics: true,
};

const FEATURE_LIST: { key: keyof AdminPermissions; label: string; desc: string }[] = [
  { key: "user_management", label: "User Management", desc: "Can add & manage Branch Heads & Sales Reps (Cannot manage Admins)" },
  { key: "faculty_settings", label: "Faculty Settings", desc: "Can update shared passcode and manage faculty roster" },
  { key: "courses", label: "Course & Batch Management", desc: "Can create, edit courses, schedules, and subject allocations" },
  { key: "sales_pipeline", label: "Sales Pipeline", desc: "Can view branch leads, follow-ups, and sales metrics" },
  { key: "academics", label: "Academic Pacing Dashboard", desc: "Can view the 26-week syllabus pacing and faculty progress matrix" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "SALES_REP",
    branch: "Jalandhar",
    permissions: { ...DEFAULT_PERMISSIONS },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSuperadmin = !currentUser || currentUser.role === "SUPERADMIN";

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
      }
    } catch (e) {
      console.error("Failed to fetch me", e);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
      const method = editingUser ? "PATCH" : "POST";

      const payload: any = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        branch: formData.role === "ADMIN" || formData.role === "SUPERADMIN" ? null : formData.branch,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (formData.role === "ADMIN") {
        payload.permissions = formData.permissions;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (user: any) => {
    if (!isSuperadmin && (user.role === "ADMIN" || user.role === "SUPERADMIN")) {
      alert("Only Superadmin has the sole authority to remove or deactivate Admins.");
      return;
    }

    if (!confirm(`Are you sure you want to deactivate ${user.full_name}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      role: "SALES_REP",
      branch: "Jalandhar",
      permissions: { ...DEFAULT_PERMISSIONS },
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const openEditModal = (user: any) => {
    if (!isSuperadmin && (user.role === "ADMIN" || user.role === "SUPERADMIN")) {
      alert("Only Superadmin has the sole authority to modify Admins.");
      return;
    }

    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: "", // Keep blank for editing unless changed
      role: user.role,
      branch: user.branch || "Jalandhar",
      permissions: user.permissions || { ...DEFAULT_PERMISSIONS },
    });
    setIsModalOpen(true);
  };

  const togglePermission = (key: keyof AdminPermissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isSuperadmin
              ? "Superadmin Authority: Manage Admins, Branch Heads, and Sales Reps with granular feature permissions"
              : "Manage Branch Heads and Sales Reps across branches"}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B4B8A] text-white rounded-lg hover:bg-[#4a3b73] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Role & Permissions</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#5B4B8A]" />
                    <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const isUserAdminRole = user.role === "ADMIN" || user.role === "SUPERADMIN";
                  const canModify = isSuperadmin || !isUserAdminRole;

                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                        {user.role === "SUPERADMIN" && <Shield className="w-4 h-4 text-[#5B4B8A]" />}
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              user.role === "SUPERADMIN"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : user.role === "ADMIN"
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                : user.role === "BRANCH_HEAD"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {user.role === "SUPERADMIN" ? "Superadmin" : user.role === "ADMIN" ? "Admin" : user.role}
                          </span>
                          {user.role === "ADMIN" && user.permissions && (
                            <span className="text-[11px] text-gray-500">
                              Features:{" "}
                              {
                                Object.values(user.permissions).filter(Boolean).length
                              }
                              /5 enabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {user.role === "SUPERADMIN" || user.role === "ADMIN" ? (
                          <span className="text-gray-400 italic">All Branches</span>
                        ) : (
                          user.branch || "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canModify ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.is_active && user.role !== "SUPERADMIN" && (
                              <button
                                onClick={() => handleDeactivate(user)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                title="Deactivate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-gray-400" title="Superadmin sole authority">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Protected</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8">
            <div className="p-6 border-b border-gray-100 bg-[#5B4B8A] text-white">
              <h2 className="text-xl font-bold">
                {editingUser ? `Edit ${editingUser.full_name}` : "Create New User"}
              </h2>
              <p className="text-white/80 text-xs mt-1">
                {isSuperadmin
                  ? "Assign roles and configure granular feature permissions"
                  : "Create Branch Staff and Counselors"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Vikas Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email / Login ID</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. admin.vikas@dspdsc.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A] disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && "(Leave blank to keep existing)"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "••••••••" : "Enter account password"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                  >
                    {isSuperadmin && (
                      <option value="ADMIN">Admin (Configurable Access)</option>
                    )}
                    <option value="BRANCH_HEAD">Branch Head</option>
                    <option value="SALES_REP">Sales Representative</option>
                  </select>
                </div>

                {formData.role !== "ADMIN" && formData.role !== "SUPERADMIN" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]/50 focus:border-[#5B4B8A]"
                    >
                      <option value="Jalandhar">Jalandhar</option>
                      <option value="Ludhiana">Ludhiana</option>
                      <option value="Jagraon">Jagraon</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Scope</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium">
                      All Branches (Central)
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Permissions section when role === 'ADMIN' and user is SUPERADMIN */}
              {formData.role === "ADMIN" && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#5B4B8A]" /> Admin Feature Controls
                      </h4>
                      <p className="text-xs text-gray-500">
                        Choose which modules this Admin can view and control
                      </p>
                    </div>
                    <span className="text-[11px] bg-purple-50 text-[#5B4B8A] font-semibold px-2 py-0.5 rounded border border-purple-200">
                      Superadmin Control
                    </span>
                  </div>

                  <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {FEATURE_LIST.map((feat) => {
                      const isChecked = !!formData.permissions[feat.key];
                      return (
                        <label
                          key={feat.key}
                          className="flex items-start gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-purple-200 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(feat.key)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#5B4B8A] focus:ring-[#5B4B8A]"
                          />
                          <div className="text-xs">
                            <span className="font-semibold text-gray-800">{feat.label}</span>
                            <p className="text-gray-500">{feat.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                    🔒 <strong>Strict Rule:</strong> Admins can never promote or remove other Admins. That authority remains exclusively with the Superadmin.
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#5B4B8A] text-white rounded-lg hover:bg-[#4a3b73] transition-colors flex items-center gap-2 disabled:opacity-50 text-sm font-medium shadow-sm"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingUser ? "Save Changes" : "Create User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
