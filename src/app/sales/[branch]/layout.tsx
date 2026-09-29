import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import SalesHeader from '@/components/sales/SalesHeader';

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

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      email = user.email || email;
      const serviceClient = await createServiceRoleClient();
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role;
      }
    }
  } catch (e) {
    console.error('Error fetching sales layout user:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SalesHeader branch={branch} email={email} role={role} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
