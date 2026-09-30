"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, CalendarClock, LogOut, 
  KeyRound, Eye, EyeOff, Loader2, X, CheckCircle2, ShieldCheck, AlertCircle 
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SalesHeaderProps {
  branch: string;
  email?: string;
  role: string;
  fullName?: string;
}

export default function SalesHeader({
  branch,
  email = "",
  role,
  fullName = "Sales User",
}: SalesHeaderProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {}
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      window.location.href = "/login";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please re-enter.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const res = await fetch("/api/sales/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setPasswordSuccess(data.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Auto close modal after 2.5 seconds
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 2500);
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: `/sales/${branch}`, icon: LayoutDashboard },
    { name: "Leads", href: `/sales/${branch}/leads`, icon: Users },
    { name: "Follow-ups", href: `/sales/${branch}/follow-ups`, icon: CalendarClock },
  ];

  const isBranchHead =
    role === "BRANCH_HEAD" ||
    role?.toLowerCase().includes("branch") ||
    role === "Branch Head";
  const roleLabel = isBranchHead ? "Branch Head" : "Sales Representative";
  const roleBadgeClass = isBranchHead
    ? "bg-purple-100 text-purple-800 border border-purple-200"
    : "bg-emerald-100 text-emerald-800 border border-emerald-200";

  const userDisplayName = fullName?.trim() || "Sales User";

  return (
    <>
      <header className="bg-[#5B4B8A] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left side: Branch name with pin emoji */}
          <div className="flex items-center gap-3">
            <Link
              href={`/sales/${branch}`}
              className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <span className="text-lg md:text-xl font-bold">DSP & DSC CRM</span>
              <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <span role="img" aria-label="Branch location">📍</span>
                <span>{decodeURIComponent(branch)}</span>
              </span>
            </Link>
          </div>

          {/* Right side: Navigation links, User's full name, role badge, change password, and logout */}
          <div className="flex items-center gap-2.5 md:gap-4">
            {/* Navigation Links */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white text-[#5B4B8A] shadow-xs"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="h-6 w-px bg-white/20 hidden sm:block" />

            {/* User Full Name & Role Badge */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-white leading-tight">
                  {userDisplayName}
                </span>
                {email && (
                  <span className="text-[11px] text-white/70 leading-tight">
                    {email}
                  </span>
                )}
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
            </div>

            {/* Actions: Change Password & Logout */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setShowPasswordModal(true);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white flex items-center gap-1"
                title="Change Password"
              >
                <KeyRound size={17} />
              </button>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white disabled:opacity-50"
                title="Logout"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-[#5B4B8A] text-white flex justify-between items-center">
              <div>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  Account Security
                </span>
                <h2 className="text-lg font-bold mt-1">Change My Password</h2>
                <p className="text-xs text-white/80 mt-0.5">{userDisplayName} &bull; {roleLabel}</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Password (Min. 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B4B8A] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
                <span>
                  <strong>Admin Sync Notice:</strong> Once updated, your new password will automatically sync with institute records so Administrator/Superadmin can verify or assist you if you ever forget it.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 text-xs font-semibold bg-[#5B4B8A] hover:bg-[#4a3b73] text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
