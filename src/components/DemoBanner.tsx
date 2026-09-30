'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if demo cookie is present
    const hasDemoCookie = document.cookie.includes('dsp_demo_mode=true');
    setIsDemo(hasDemoCookie);
  }, []);

  const handleExitDemo = async () => {
    try {
      await fetch('/api/auth/demo-session', { method: 'DELETE' });
    } catch {}
    window.location.href = '/login';
  };

  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs px-4 py-2 shadow-md relative z-50 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center p-1 bg-white/20 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
        </span>
        <span className="font-semibold tracking-wide">
          Sales Showcase & Demo Mode Active
        </span>
        <span className="hidden sm:inline text-amber-100/90 text-[11px]">
          &bull; Populated with isolated sample academy data for client presentations. The live database is 100% untouched.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExitDemo}
          className="bg-white text-gray-900 hover:bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
        >
          <span>Exit Demo & Return to Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
