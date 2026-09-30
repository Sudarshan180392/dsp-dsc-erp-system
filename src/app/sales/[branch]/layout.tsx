import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import SalesHeader from '@/components/sales/SalesHeader';
import Footer from '@/components/Footer';

export const dynamic = "force-dynamic";

export default async function BranchSalesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ branch: string }>;
}) {
  const branch = (await params).branch;
  let email = 'sales@dspdsc.com';
  let role = 'SALES_REP';
  let fullName = 'Sales Staff';

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      email = user.email || email;
      const serviceClient = await createServiceRoleClient();
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role;
      }
      if (profile?.full_name) {
        fullName = profile.full_name;
      }
    } else {
      const cookieStore = await cookies();
      const staffSessionCookie = cookieStore.get('staff_session')?.value;
      if (staffSessionCookie) {
        try {
          const parsed = JSON.parse(staffSessionCookie);
          if (parsed.fullName) fullName = parsed.fullName;
          if (parsed.role) role = parsed.role;
          if (parsed.email) email = parsed.email;
        } catch {}
      }
    }
  } catch (e) {
    console.error('Error fetching sales layout user:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <SalesHeader branch={branch} email={email} role={role} fullName={fullName} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
