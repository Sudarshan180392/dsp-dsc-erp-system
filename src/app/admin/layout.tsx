import { ReactNode } from "react";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let role = "SUPERADMIN";
  let fullName = "Superadmin";
  let permissions = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const serviceClient = await createServiceRoleClient();
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("role, full_name, permissions")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        role = profile.role || "SUPERADMIN";
        fullName = profile.full_name || user.email?.split("@")[0] || "Admin";
        permissions = profile.permissions || null;
      }
    }
  } catch (e) {
    console.error("Error loading admin layout session:", e);
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
      <AdminSidebar role={role} fullName={fullName} permissions={permissions} />
      <div className="flex-1 overflow-auto flex flex-col justify-between">
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
