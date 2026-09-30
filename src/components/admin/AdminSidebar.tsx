"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  LogOut,
  Menu,
  X,
  Shield,
  UserCheck
} from "lucide-react";
import { AdminPermissions } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  role: string;
  fullName: string;
  permissions?: AdminPermissions | null;
}

export default function AdminSidebar({ role, fullName, permissions }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isSuperadmin = role === "SUPERADMIN";

  const allNavLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, requiredPerm: null },
    { name: "User Management", href: "/admin/users", icon: Users, requiredPerm: "user_management" },
    { name: "Faculty Settings", href: "/admin/faculty-settings", icon: Settings, requiredPerm: "faculty_settings" },
    { name: "Courses", href: "/admin/courses", icon: BookOpen, requiredPerm: "courses" },
    { name: "Sales Pipeline", href: "/admin/sales", icon: Briefcase, requiredPerm: "sales_pipeline" },
    { name: "Academics", href: "/admin/academics", icon: GraduationCap, requiredPerm: "academics" },
  ];

  const visibleLinks = allNavLinks.filter((link) => {
    if (!link.requiredPerm) return true;
    if (isSuperadmin) return true;
    // For Admins: check permissions object (defaults allow all unless explicitly false)
    if (!permissions) {
      return true;
    }
    return permissions[link.requiredPerm as keyof AdminPermissions] !== false;
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {}
      await fetch("/api/auth/logout", { method: "POST" });
      await fetch("/api/auth/faculty-session", { method: "DELETE" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#5B4B8A] text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">DSP & DSC</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20">
            {isSuperadmin ? "Superadmin" : "Admin"}
          </span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs" 
        />
      )}

      {/* Sidebar (Desktop and Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#5B4B8A] text-white flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Brand & User Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-wide">DSP & DSC</h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isSuperadmin
                  ? "bg-purple-300 text-purple-950 font-bold"
                  : "bg-white/20 text-white"
              }`}
            >
              {isSuperadmin ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {isSuperadmin ? "Superadmin" : "Admin"}
            </span>
          </div>
          <div className="mt-3 text-xs text-white/80 truncate">
            Welcome, <strong className="text-white font-medium">{fullName || (isSuperadmin ? "Superadmin" : "Admin")}</strong>
          </div>
          {!isSuperadmin && (
            <div className="mt-1 text-[10px] text-white/60">
              Role: Delegated Admin
            </div>
          )}
        </div>
        
        {/* Nav Links */}
        <nav className="flex-1 mt-4 overflow-y-auto px-3">
          <ul className="space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white text-[#5B4B8A] font-semibold shadow-sm"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#5B4B8A]" : "text-white/80"}`} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer / Logout */}
        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 text-left rounded-xl transition-colors hover:bg-white/10 text-rose-200 hover:text-white text-sm font-medium disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
