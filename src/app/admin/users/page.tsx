"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Shield, Lock, 
  CheckCircle2, KeyRound, Copy, Check, Sparkles, X, AlertTriangle 
} from "lucide-react";
import { AdminPermissions } from "@/lib/types";

const DEFAULT_PERMISSIONS: AdminPermissions = {
  user_management: true,
  faculty_settings: true,
  courses: true,
  sales_pipeline: true,
  academics: true,
};

const FEATURE_LIST: { key: keyof AdminPermissions; label: string; desc: string }[] = [
  { key: "user_management", label: "User Management", desc: "Can add, edit & reset passwords for Branch Heads & Sales Reps (Cannot manage Admins)" },
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

  // Faculty Passcode State
  const [facultyPasscode, setFacultyPasscode] = useState("sudarshansir@");
  const [showFacultyPasscode, setShowFacultyPasscode] = useState(false);
  const [isFacultyResetModalOpen, setIsFacultyResetModalOpen] = useState(false);
  const [newFacultyPasscode, setNewFacultyPasscode] = useState("");
  const [showFacultyResetModalPass, setShowFacultyResetModalPass] = useState(false);
  const [isUpdatingFacultyPasscode, setIsUpdatingFacultyPasscode] = useState(false);

  // Password visibility & copy states
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dedicated Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [showResetModalPass, setShowResetModalPass] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

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

  const fetchFacultyPasscode = async () => {
    try {
      const res = await fetch("/api/admin/faculty-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.passcode) {
          setFacultyPasscode(data.passcode);
        }
      }
    } catch (err) {
      console.error("Failed to fetch faculty passcode", err);
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
    fetchFacultyPasscode();
  }, []);

  const handleUpdateFacultyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyPasscode) return;
    setIsUpdatingFacultyPasscode(true);
    try {
      const res = await fetch("/api/admin/faculty-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: newFacultyPasscode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update passcode");
      }
      setFacultyPasscode(newFacultyPasscode);
      setIsFacultyResetModalOpen(false);
      setResetSuccessMessage(`Faculty Passcode successfully updated to: ${newFacultyPasscode}`);
      setTimeout(() => setResetSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingFacultyPasscode(false);
    }
  };

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyPassword = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateRandomPassword = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    const nums = "23456789";
    const syms = "@#$%";
    let pass = "Dsp@";
    for (let i = 0; i < 3; i++) pass += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 2; i++) pass += nums.charAt(Math.floor(Math.random() * nums.length));
    pass += syms.charAt(Math.floor(Math.random() * syms.length));
    return pass;
  };

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

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newResetPassword) return;

    setIsResetting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${resetModalUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newResetPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update in local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === resetModalUser.id ? { ...u, raw_password: newResetPassword } : u
        )
      );

      setResetSuccessMessage(
        `Password for ${resetModalUser.full_name} successfully updated to: ${newResetPassword}`
      );
      setTimeout(() => setResetSuccessMessage(null), 5000);

      setResetModalUser(null);
      setNewResetPassword("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsResetting(false);
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

  const openResetModal = (user: any) => {
    if (!isSuperadmin && (user.role === "ADMIN" || user.role === "SUPERADMIN")) {
      alert("Only Superadmin has the sole authority to reset passwords for Admins.");
      return;
    }
    setResetModalUser(user);
    setNewResetPassword(generateRandomPassword());
    setShowResetModalPass(true);
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
      {/* Toast Notification */}
      {resetSuccessMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{resetSuccessMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User & Credential Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isSuperadmin
              ? "Superadmin Authority: Full control over Admins, Branch Heads, and Sales Reps credentials"
              : "Admin Authority: View and reset credentials for Sales Representatives & Branch Staff"}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B4B8A] text-white rounded-xl hover:bg-[#4a3b73] transition-colors shadow-sm font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Authority Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between text-purple-900 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm">
              🔑 Central Credential & Passcode Authority
            </span>
            <p className="text-purple-700/80 mt-0.5">
              Administrators and Superadmins can view and reset passwords for Sales Representatives, Branch Staff, and Faculty. <strong>Admin passwords can only be reset by Superadmin.</strong>
            </p>
          </div>
        </div>
        <span className="hidden md:inline-block font-semibold px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-purple-800">
          {isSuperadmin ? "Superadmin Mode" : "Admin Mode"}
        </span>
      </div>

      {/* Faculty Passcode Central Management Card */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#5B4B8A] flex items-center justify-center shrink-0 shadow-xs">
            <KeyRound className="w-5 h-5 text-[#5B4B8A]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">Faculty Portal Passcode</h3>
              <span className="text-[11px] font-semibold bg-purple-50 text-[#5B4B8A] border border-purple-200 px-2.5 py-0.5 rounded-full">
                Admin & Superadmin Authority
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Shared PIN/Passcode used by all faculty to log in, define individual syllabus, and update weekly academic progress.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Passcode:</span>
            <span className="font-mono text-sm font-bold text-gray-800 select-all">
              {showFacultyPasscode ? facultyPasscode : "••••••••••••"}
            </span>
            <button
              type="button"
              onClick={() => setShowFacultyPasscode(!showFacultyPasscode)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors"
              title={showFacultyPasscode ? "Hide Passcode" : "Show Passcode"}
            >
              {showFacultyPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => copyPassword("faculty-passcode", facultyPasscode)}
              className="text-gray-400 hover:text-[#5B4B8A] p-1 rounded-md transition-colors"
              title="Copy Passcode"
            >
              {copiedId === "faculty-passcode" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewFacultyPasscode(facultyPasscode);
              setShowFacultyResetModalPass(false);
              setIsFacultyResetModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#5B4B8A] hover:bg-[#4a3b73] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Reset Passcode</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-600">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email / Login</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Branch</th>
                <th className="px-6 py-4 font-semibold">Password (Credential)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#5B4B8A]" />
                    <p className="text-sm text-gray-500 mt-2">Loading users and credentials...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const isUserAdminRole = user.role === "ADMIN" || user.role === "SUPERADMIN";
                  const canModify = isSuperadmin || !isUserAdminRole;
                  const isRevealed = !!revealedPasswords[user.id];

                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                        {user.role === "SUPERADMIN" && <Shield className="w-4 h-4 text-[#5B4B8A]" />}
                        <span>{user.full_name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs font-mono">{user.email}</td>
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
                            {user.role === "SUPERADMIN" ? "Superadmin" : user.role === "ADMIN" ? "Admin" : user.role === "BRANCH_HEAD" ? "Branch Head" : "Sales Rep"}
                          </span>
                          {user.role === "ADMIN" && user.permissions && (
                            <span className="text-[11px] text-gray-500">
                              Features:{" "}
                              {
                                Object.values(user.permissions).filter(Boolean).length
                              }
                              /5
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {user.role === "SUPERADMIN" || user.role === "ADMIN" ? (
                          <span className="text-gray-400 italic">All Branches</span>
                        ) : (
                          user.branch || "-"
                        )}
                      </td>

                      {/* Password Column */}
                      <td className="px-6 py-4">
                        {(user.role === "SUPERADMIN" || user.role === "ADMIN") && !isSuperadmin ? (
                          <span className="text-xs text-gray-400 italic flex items-center gap-1.5 bg-gray-50 border border-gray-200/60 px-2.5 py-1 rounded-lg w-fit">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Protected (Superadmin Only)</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-800 min-w-[85px] border border-gray-200/60 select-all">
                              {isRevealed
                                ? user.raw_password || "(Set on reset)"
                                : "••••••••"}
                            </div>
                            
                            {user.raw_password && (
                              <button
                                type="button"
                                onClick={() => togglePasswordReveal(user.id)}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title={isRevealed ? "Hide Password" : "View Password"}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {user.raw_password && (
                              <button
                                type="button"
                                onClick={() => copyPassword(user.id, user.raw_password)}
                                className="text-gray-400 hover:text-[#5B4B8A] p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title="Copy Password to Clipboard"
                              >
                                {copiedId === user.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {canModify && (
                              <button
                                type="button"
                                onClick={() => openResetModal(user)}
                                className="text-[11px] font-semibold text-[#5B4B8A] hover:bg-[#5B4B8A]/10 px-2 py-1 rounded-md transition-colors ml-1"
                                title="Change / Reset Password"
                              >
                                Reset
                              </button>
                            )}
                          </div>
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openResetModal(user)}
                              className="p-1.5 text-gray-400 hover:text-[#5B4B8A] hover:bg-purple-50 rounded-lg transition-colors"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.is_active && user.role !== "SUPERADMIN" && (
                              <button
                                onClick={() => handleDeactivate(user)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Deactivate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-gray-400" title="Superadmin sole authority">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">Superadmin Only</span>
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

      {/* DEDICATED USER RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-[#5B4B8A] text-white flex justify-between items-center">
              <div>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  {resetModalUser.role === "ADMIN"
                    ? "👑 Superadmin Sole Authority • Admin Account"
                    : `Password Authority • ${resetModalUser.role === "BRANCH_HEAD" ? "Branch Head" : "Sales Rep"}`}
                </span>
                <h2 className="text-lg font-bold mt-1">Reset Password</h2>
                <p className="text-xs text-white/80 mt-0.5">{resetModalUser.full_name} ({resetModalUser.email})</p>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              {resetModalUser.raw_password && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                  <span className="text-gray-500 font-medium">Currently Stored Password:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-800 text-sm">{resetModalUser.raw_password}</span>
                    <button
                      type="button"
                      onClick={() => copyPassword(resetModalUser.id, resetModalUser.raw_password)}
                      className="text-[#5B4B8A] hover:underline text-xs flex items-center gap-1 font-semibold"
                    >
                      {copiedId === resetModalUser.id ? "Copied!" : "Copy Password"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">New Password</label>
                  <button
                    type="button"
                    onClick={() => setNewResetPassword(generateRandomPassword())}
                    className="text-xs text-[#5B4B8A] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetModalPass ? "text" : "password"}
                    required
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetModalPass(!showResetModalPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showResetModalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-900">
                {resetModalUser.role === "ADMIN" ? (
                  <span>👑 <strong>Superadmin Authority:</strong> As Superadmin, you are updating the password for Administrator <strong>{resetModalUser.full_name}</strong>. Regular Admins cannot reset this account.</span>
                ) : (
                  <span>🔒 <strong>Password Authority:</strong> This new password will be immediately updated in the authentication system and visible to {isSuperadmin ? "Superadmin and Admins" : "Admins"}.</span>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !newResetPassword}
                  className="px-5 py-2 text-xs font-semibold bg-[#5B4B8A] hover:bg-[#4a3b73] text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Apply Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FACULTY PASSCODE RESET MODAL */}
      {isFacultyResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-[#5B4B8A] text-white flex justify-between items-center">
              <div>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  Faculty Portal &bull; Passcode Authority
                </span>
                <h2 className="text-lg font-bold mt-1">Reset Faculty Passcode</h2>
                <p className="text-xs text-white/80 mt-0.5">Applies to all faculty members logging into the portal</p>
              </div>
              <button
                onClick={() => setIsFacultyResetModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFacultyPasscode} className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                <span className="text-gray-500 font-medium">Current Active Passcode:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-800 text-sm">{facultyPasscode}</span>
                  <button
                    type="button"
                    onClick={() => copyPassword("current-fac-pass", facultyPasscode)}
                    className="text-[#5B4B8A] hover:underline text-xs flex items-center gap-1 font-semibold"
                  >
                    {copiedId === "current-fac-pass" ? "Copied!" : "Copy Passcode"}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">New Passcode</label>
                  <button
                    type="button"
                    onClick={() => setNewFacultyPasscode(generateRandomPassword())}
                    className="text-xs text-[#5B4B8A] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showFacultyResetModalPass ? "text" : "password"}
                    required
                    value={newFacultyPasscode}
                    onChange={(e) => setNewFacultyPasscode(e.target.value)}
                    placeholder="Enter new faculty passcode"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFacultyResetModalPass(!showFacultyResetModalPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showFacultyResetModalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-900">
                👨‍🏫 <strong>Instant Sync:</strong> Once updated, all faculty members will use this new passcode to access the Faculty Portal, submit weekly syllabi, and log pacing.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFacultyResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingFacultyPasscode || !newFacultyPasscode}
                  className="px-5 py-2 text-xs font-semibold bg-[#5B4B8A] hover:bg-[#4a3b73] text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingFacultyPasscode && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Faculty Passcode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8 border border-gray-100 animate-in fade-in">
            <div className="p-6 border-b border-gray-100 bg-[#5B4B8A] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {editingUser ? `Edit ${editingUser.full_name}` : "Create New User"}
                </h2>
                <p className="text-white/80 text-xs mt-1">
                  {isSuperadmin
                    ? "Assign roles, set initial credentials and feature permissions"
                    : "Create and manage sales reps and branch staff"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Vikas Sharma"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email / Login ID</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. sales.jal@dspdsc.com"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4B8A] disabled:bg-gray-100"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Password {editingUser && "(Leave blank to keep existing)"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, password: generateRandomPassword() }))}
                    className="text-xs text-[#5B4B8A] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "••••••••" : "Enter account password"}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4B8A] font-mono"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">User Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4B8A] bg-white"
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4B8A] bg-white"
                    >
                      <option value="Jalandhar">Jalandhar</option>
                      <option value="Ludhiana">Ludhiana</option>
                      <option value="Jagraon">Jagraon</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Scope</label>
                    <div className="px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium">
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
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#5B4B8A] text-white rounded-xl hover:bg-[#4a3b73] transition-colors flex items-center gap-2 disabled:opacity-50 text-sm font-medium shadow-sm"
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
