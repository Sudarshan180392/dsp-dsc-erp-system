import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, LayoutDashboard, Users, CalendarClock, User } from 'lucide-react';

export default async function BranchSalesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ branch: string }>;
}) {
  const branch = (await params).branch;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#5B4B8A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
              CRM <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"><MapPin size={16}/> {decodeURIComponent(branch)} Branch</span>
            </h1>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link href={`/sales/${branch}`} className="hover:bg-white/10 px-3 py-2 rounded-md flex items-center gap-2 transition-colors">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link href={`/sales/${branch}/leads`} className="hover:bg-white/10 px-3 py-2 rounded-md flex items-center gap-2 transition-colors">
                <Users size={18} /> Leads
              </Link>
              <Link href={`/sales/${branch}/follow-ups`} className="hover:bg-white/10 px-3 py-2 rounded-md flex items-center gap-2 transition-colors">
                <CalendarClock size={18} /> Follow-ups
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">{user?.email || 'sales@demo.com'}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">Sales Rep</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
