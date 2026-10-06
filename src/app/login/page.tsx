'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserCircle, KeyRound, Shield, LogIn, Building2, GraduationCap, Users, Crown, ShieldCheck } from 'lucide-react';
import Footer from '@/components/Footer';

type Tab = 'superadmin' | 'admin' | 'staff' | 'salesrep' | 'faculty';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>('superadmin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Superadmin state (Master Director)
  const [superadminEmail, setSuperadminEmail] = useState('');
  const [superadminPassword, setSuperadminPassword] = useState('');

  // Admin state (Academic / Operations Admin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Staff state (Branch Head)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sales Rep state
  const [repBranch, setRepBranch] = useState<string>('');
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');

  // Faculty state
  const [passcode, setPasscode] = useState('');
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [showDemoPreview, setShowDemoPreview] = useState(false);

  const router = useRouter();

  const clearDemoMode = () => {
    document.cookie = 'dsp_demo_mode=; path=/; max-age=0;';
  };

  const handleLaunchDemo = async (target: 'superadmin' | 'admin_staff' | 'admin' | 'faculty' | 'sales', branch?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, branch }),
      });
      const data = await res.json();
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
    } catch (e) {
      console.error('Demo launch error', e);
    }
    if (target === 'faculty') window.location.href = '/faculty';
    else if (target === 'sales') window.location.href = `/sales/${branch || 'Jalandhar'}`;
    else window.location.href = '/admin';
  };

  const handleSuperadminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: superadminEmail, password: superadminPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Superadmin login failed');
      }

      if (data.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized: This account does not have Superadmin privileges. Admins should use the Admin tab.');
      }

      clearDemoMode();
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Admin login failed');
      }

      if (data.role !== 'ADMIN' && data.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized: This account does not have Administrator privileges. Staff and Sales Reps should use their respective tabs.');
      }

      clearDemoMode();
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      clearDemoMode();
      if (data.role === 'SUPERADMIN' || data.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = `/sales/${data.branch}`;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalesRepLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!repBranch) {
      setError('Please select your branch');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: repEmail, password: repPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.role !== 'SALES_REP') {
        throw new Error('This login is for Sales Representatives only. Branch Heads should use the Staff tab.');
      }

      if (data.branch && data.branch.toLowerCase() !== repBranch.toLowerCase()) {
        throw new Error(`You are not assigned to the ${repBranch} branch. Your branch is ${data.branch}.`);
      }

      clearDemoMode();
      window.location.href = `/sales/${data.branch || repBranch}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/faculty-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid passcode');
      }

      setFacultyList(data.faculty);
      setPasscodeVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyContinue = async () => {
    if (!selectedFaculty) {
      setError('Please select your name');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const faculty = facultyList.find(f => f.id === selectedFaculty);
      if (!faculty) throw new Error('Faculty not found');

      const res = await fetch('/api/auth/faculty-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: faculty.id,
          facultyName: faculty.name,
          subject: faculty.subject,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error('Failed to create session');
      }

      clearDemoMode();
      router.push('/faculty');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA] flex flex-col items-center justify-between p-4">
      <div className="flex-1 flex items-center justify-center w-full my-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-[#5B4B8A] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">DSP & DSC</h1>
          <p className="text-[#5B4B8A] bg-white/20 px-4 py-1 rounded-full text-sm inline-block mt-2 font-medium">
            Portal Access
          </p>
        </div>

        <div className="grid grid-cols-5 border-b border-gray-200 bg-gray-50/70 p-1 gap-1 text-center">
          <button
            type="button"
            onClick={() => { setActiveTab('superadmin'); setError(null); }}
            className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'superadmin' ? 'bg-white text-purple-900 shadow-xs border border-purple-200 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-[11px] truncate">Superadmin</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(null); }}
            className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'admin' ? 'bg-white text-[#5B4B8A] shadow-xs border border-purple-200 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] truncate">Admin</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setError(null); }}
            className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'staff' ? 'bg-white text-blue-800 shadow-xs border border-blue-200 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] truncate">Branch Head</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('salesrep'); setError(null); }}
            className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'salesrep' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] truncate">Sales Rep</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('faculty'); setError(null); }}
            className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'faculty' ? 'bg-white text-amber-800 shadow-xs border border-amber-200 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] truncate">Faculty</span>
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          {/* TAB 1: SUPERADMIN (MASTER AUTHORITY) */}
          {activeTab === 'superadmin' && (
            <div className="space-y-5">
              <div className="text-center pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                  <Crown className="w-3.5 h-3.5 text-purple-700" /> Superadmin (Master Authority)
                </span>
                {/* <p className="text-xs text-gray-500 mt-1.5">Master control over Admins, institute passcodes & user credentials</p> */}
              </div>

              <form onSubmit={handleSuperadminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Superadmin Email / Login ID
                  </label>
                  <input
                    type="text"
                    value={superadminEmail}
                    onChange={(e) => setSuperadminEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                    placeholder="superadmin@dspdsc.com or superadmin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Master Password</label>
                  <input
                    type="password"
                    value={superadminPassword}
                    onChange={(e) => setSuperadminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5B4B8A] hover:bg-[#4A3D73] text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-sm"
                >
                  {loading ? 'Authenticating Superadmin...' : 'Sign In as Superadmin'}
                  {!loading && <LogIn className="w-4 h-4" />}
                </button>
              </form>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-medium">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdminGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google (Optional for Superadmin)</span>
              </button>
            </div>
          )}

          {/* TAB 2: ADMIN (ACADEMIC / OPERATIONS ADMIN) */}
          {activeTab === 'admin' && (
            <div className="space-y-5">
              <div className="text-center pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" /> Academic & Operations Admin
                </span>
                <p className="text-xs text-gray-500 mt-1.5">For issues regarding Sign in contact Super Admin</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Username
                  </label>
                  <input
                    type="text"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                    placeholder="Enter username provided by Superadmin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your password here"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5B4B8A] hover:bg-[#4A3D73] text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-sm"
                >
                  {loading ? 'Authenticating Admin...' : 'Sign In as Administrator'}
                  {!loading && <LogIn className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: STAFF (BRANCH HEAD) */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-5">
              <div className="text-center pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" /> Branch Head Portal
                </span>
                <p className="text-xs text-gray-500 mt-1.5">Manage branch pipeline, leads & monitor your sales rep team</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Head Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  placeholder="e.g. head.jal@dspdsc.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5B4B8A] hover:bg-[#4A3D73] text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In as Branch Head'}
                {!loading && <LogIn className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* TAB 4: SALES REP */}
          {activeTab === 'salesrep' && (
            <form onSubmit={handleSalesRepLogin} className="space-y-5">
              <div className="text-center pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <Users className="w-3.5 h-3.5 text-emerald-700" /> Sales Representative Portal
                </span>
                <p className="text-xs text-gray-500 mt-1.5">Select your branch to log in and work with your private leads</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                <select
                  value={repBranch}
                  onChange={(e) => setRepBranch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all bg-white"
                  required
                >
                  <option value="">-- Select Your Branch --</option>
                  <option value="Jalandhar">Jalandhar</option>
                  <option value="Ludhiana">Ludhiana</option>
                  <option value="Jagraon">Jagraon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
                <input
                  type="text"
                  value={repEmail}
                  onChange={(e) => setRepEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  placeholder="e.g. rohit, priya, or sales.jal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={repPassword}
                  onChange={(e) => setRepPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5B4B8A] hover:bg-[#4A3D73] text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In as Sales Rep'}
                {!loading && <LogIn className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* TAB 5: FACULTY */}
          {activeTab === 'faculty' && (
            <div className="space-y-5">
              <div className="text-center pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-700" /> Faculty Syllabus Portal
                </span>
                <p className="text-xs text-gray-500 mt-1.5">Enter Institute Passcode to update weekly syllabus logs</p>
              </div>

              {!passcodeVerified ? (
                <form onSubmit={handleFacultyVerify} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Passcode</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all text-center tracking-widest text-lg"
                        placeholder="••••"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#5B4B8A] hover:bg-[#4A3D73] text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Enter'}
                  </button>
                  <p className="text-xs text-center text-gray-400">Passcode is set and managed by Superadmin in Faculty Settings.</p>
                </form>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Name</label>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5B4B8A] focus:border-transparent outline-none transition-all bg-white"
                      required
                    >
                      <option value="">-- Choose Name --</option>
                      {facultyList.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name} ({faculty.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleFacultyContinue}
                    disabled={loading || !selectedFaculty}
                    className="w-full bg-[#5B4B8A] hover:bg-[#4A3D73] text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Continue to Dashboard'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Frontend Preview for Sales & Pitch Demos */}
        <div className="bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowDemoPreview(!showDemoPreview)}
            className="w-full py-3 px-6 text-xs text-gray-500 hover:text-gray-800 flex items-center justify-between font-medium transition-colors bg-gray-50/80 hover:bg-gray-100/70"
          >
            <span className="flex items-center gap-2">
              <span className="text-gray-600 font-semibold">💼 Pitch Demo / Sales Preview Mode</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Mock Data Isolated</span>
            </span>
            <span className="text-[11px] text-[#5B4B8A] font-bold">
              {showDemoPreview ? 'Close ▲' : 'Open Demo ▼'}
            </span>
          </button>

          {showDemoPreview && (
            <div className="p-6 pt-3 text-center border-t border-gray-100 bg-white/50 animate-in fade-in duration-200">
              <p className="text-[11px] text-gray-500 mb-3 text-left">
                Test pre-populated sample academy records for investor/sales pitches without affecting live production data:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('superadmin')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#5B4B8A] hover:text-white border border-gray-200 rounded-lg text-gray-700 font-medium transition text-left flex items-center justify-between disabled:opacity-50 shadow-xs"
                >
                  <span>👑 Superadmin</span>
                  <span className="text-[10px] text-gray-400">Master</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('admin_staff')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#5B4B8A] hover:text-white border border-gray-200 rounded-lg text-gray-700 font-medium transition text-left flex items-center justify-between disabled:opacity-50 shadow-xs"
                >
                  <span>🛡️ Admin (Vikas)</span>
                  <span className="text-[10px] text-gray-400">Academic</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('faculty')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#5B4B8A] hover:text-white border border-gray-200 rounded-lg text-gray-700 font-medium transition text-left flex items-center justify-between disabled:opacity-50 shadow-xs"
                >
                  <span>👨‍🏫 Faculty Portal</span>
                  <span className="text-[10px] text-gray-400">/faculty</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('sales', 'Jalandhar')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#5B4B8A] hover:text-white border border-gray-200 rounded-lg text-gray-700 font-medium transition text-left flex items-center justify-between disabled:opacity-50 shadow-xs"
                >
                  <span>📍 Jalandhar CRM</span>
                  <span className="text-[10px] text-gray-400">Sales</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('sales', 'Ludhiana')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#5B4B8A] hover:text-white border border-gray-200 rounded-lg text-gray-700 font-medium transition text-left flex items-center justify-between disabled:opacity-50 shadow-xs"
                >
                  <span>📍 Ludhiana CRM</span>
                  <span className="text-[10px] text-gray-400">Sales</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchDemo('sales', 'Jagraon')}
                  disabled={loading}
                  className="p-2.5 bg-white hover:bg-[#5B4B8A] hover:text-white border border-gray-200 rounded-lg text-gray-700 font-medium transition text-left flex items-center justify-between disabled:opacity-50 shadow-xs"
                >
                  <span>📍 Jagraon CRM</span>
                  <span className="text-[10px] text-gray-400">Sales</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <div className="w-full max-w-md">
        <Footer />
      </div>
    </div>
  );
}
