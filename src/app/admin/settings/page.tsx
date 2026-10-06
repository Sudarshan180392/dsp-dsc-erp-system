"use client";

import { useState, useEffect } from "react";
import { 
  Shield, KeyRound, Lock, Eye, EyeOff, Save, CheckCircle2, 
  AlertTriangle, Building2, UserCheck, Sparkles, Loader2 
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingInstitute, setSubmittingInstitute] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Institute State
  const [instituteName, setInstituteName] = useState("");
  const [facultyPasscode, setFacultyPasscode] = useState("");
  const [showFacultyPasscode, setShowFacultyPasscode] = useState(false);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        setFullName(data.profile.full_name || "");
        setEmail(data.profile.email || "");
        setInstituteName(data.institute.institute_name || "DSP & DSC");
        setFacultyPasscode(data.institute.faculty_passcode || "sudarshansir@");
      }
    } catch (e: any) {
      console.error("Error fetching settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setSuccessMsg("Master password updated successfully! Keep your new credentials safe.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittingProfile(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSuccessMsg("Superadmin profile details updated successfully!");
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleUpdateInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittingInstitute(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          institute_name: instituteName,
          faculty_passcode: facultyPasscode 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update institute details");

      setSuccessMsg("Institute branding & faculty passcode saved successfully!");
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSubmittingInstitute(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B4B8A]" />
        <p className="text-sm">Loading security & settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Security & Master Settings</h1>
            <span className="bg-purple-100 text-[#5B4B8A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              👑 Superadmin Control
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Change your master password, alter institute details & protect platform security
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-medium animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: CHANGE MASTER PASSWORD */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5B4B8A] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Change Master Password</h2>
                <p className="text-xs text-gray-500">Update your Superadmin access credentials</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new master password (min 6 chars)"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password to confirm"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#5B4B8A]" /> Master Security Notice:
                </p>
                <p className="mt-0.5 text-purple-800">
                  Changing this password takes effect immediately. Never share your master password with staff or instructors.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="w-full py-2.5 bg-[#5B4B8A] hover:bg-[#4a3b73] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
              >
                {submittingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save New Master Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CARD 2: SUPERADMIN PROFILE DETAILS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Superadmin Profile</h2>
                <p className="text-xs text-gray-500">Master account name and contact email</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name / Director Title
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sudarshan Mishra"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Master Email / Login ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@dspdsc.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" /> Account Authority:
                </p>
                <p className="mt-0.5 text-blue-800">
                  This account holds full authority over appointed Admins, branch pipelines, and academic pacing.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingProfile}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
              >
                {submittingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Details</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CARD 3: INSTITUTE BRANDING & FACULTY PASSCODE */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Institute Branding & Faculty Passcode</h2>
              <p className="text-xs text-gray-500">Configure public institute name and faculty entry passcode</p>
            </div>
          </div>

          <form onSubmit={handleUpdateInstitute} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Institute Name
              </label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. DSP & DSC Academy"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">Shown in the header, login page, and PDF reports</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Faculty Portal Passcode
              </label>
              <div className="relative">
                <input
                  type={showFacultyPasscode ? "text" : "password"}
                  value={facultyPasscode}
                  onChange={(e) => setFacultyPasscode(e.target.value)}
                  placeholder="e.g. sudarshansir@"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowFacultyPasscode(!showFacultyPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showFacultyPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Shared passcode required for faculty to log weekly logs</p>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submittingInstitute}
                className="py-2.5 px-6 bg-[#5B4B8A] hover:bg-[#4a3b73] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
              >
                {submittingInstitute ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Institute Settings...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Institute Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
