"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, LayoutDashboard, Users, CalendarClock, User, LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SalesHeaderProps {
  branch: string;
  email: string;
  role: string;
}

export default function SalesHeader({ branch, email, role }: SalesHeaderProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const navLinks = [
    { name: "Dashboard", href: `/sales/${branch}`, icon: LayoutDashboard },
    { name: "Leads", href: `/sales/${branch}/leads`, icon: Users },
    { name: "Follow-ups", href: `/sales/${branch}/follow-ups`, icon: CalendarClock },
  ];

  const roleLabel = role === "BRANCH_HEAD" ? "Branch Head" : "Sales Counselor";

  return (
    <header className="bg-[#5B4B8A] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/sales/${branch}`} className="text-xl font-bold flex items-center gap-2">
            <span>DSP & DSC CRM</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <MapPin size={14} /> {decodeURIComponent(branch)}
            </span>
          </Link>
          <nav className="hidden md:flex gap-1 ml-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-[#5B4B8A] shadow-xs"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-white">{email}</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium text-white/90 mt-0.5">
              {roleLabel}
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
