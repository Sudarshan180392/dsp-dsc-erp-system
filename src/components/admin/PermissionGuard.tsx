"use client";

import { useEffect, useState, ReactNode } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminPermissions } from "@/lib/types";

interface PermissionGuardProps {
  permission: keyof AdminPermissions;
  moduleName: string;
  children: ReactNode;
}

export default function PermissionGuard({ permission, moduleName, children }: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkPermission() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setHasAccess(true); // Preview mode default
          return;
        }
        const data = await res.json();
        const user = data?.user;

        if (!user || user.role === "SUPERADMIN") {
          setHasAccess(true);
          return;
        }

        if (user.role === "ADMIN") {
          const perms = user.permissions;
          if (perms && perms[permission] === false) {
            setHasAccess(false);
          } else {
            setHasAccess(true);
          }
          return;
        }

        setHasAccess(false);
      } catch (err) {
        setHasAccess(true);
      }
    }

    checkPermission();
  }, [permission]);

  if (hasAccess === null) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#5B4B8A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-lg mx-auto my-16 bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-lg">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Your Superadmin has not granted your Admin account permission to access{" "}
          <strong>{moduleName}</strong>.
        </p>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 mb-6">
          If you need access to this feature, please contact your Superadmin to update your feature controls.
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B4B8A] text-white text-sm font-medium rounded-xl hover:bg-[#4a3b73] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
