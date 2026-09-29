"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CheckSquare, LayoutDashboard, LogOut, GraduationCap } from "lucide-react";
import { useState } from "react";

interface FacultyHeaderProps {
  facultyName: string;
  subject: string;
}

export default function FacultyHeader({ facultyName, subject }: FacultyHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/faculty-session", { method: "DELETE" });
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/faculty", icon: LayoutDashboard },
    { name: "Update Progress", href: "/faculty/update", icon: CheckSquare },
    { name: "Syllabus Manager", href: "/faculty/syllabus", icon: BookOpen },
  ];

  return (
    <header className="bg-[#5B4B8A] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/faculty" className="text-xl font-bold flex items-center gap-2 tracking-wide">
            <GraduationCap className="w-6 h-6 text-white" />
            <span>DSP & DSC Faculty</span>
          </Link>
          <nav className="hidden md:flex gap-1 ml-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-[#5B4B8A] shadow-xs"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-white">👨‍🏫 {facultyName}</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium text-white/90 mt-0.5">
              {subject}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
            title="Logout of Faculty Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
