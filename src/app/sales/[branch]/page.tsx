import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Users, AlertCircle, TrendingUp, UserCheck, ShieldCheck, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DEMO_COOKIE_NAME } from '@/lib/demo';

const MOCK_LEADS_DASHBOARD = [
  // Jalandhar
  { id: 'l-jal-1', branch: 'Jalandhar', student_name: 'Gurkirat Singh', status: 'ENROLLED', assigned_to_name: 'Rohit Sharma' },
  { id: 'l-jal-2', branch: 'Jalandhar', student_name: 'Jasleen Kaur', status: 'DEMO_SCHEDULED', assigned_to_name: 'Rohit Sharma' },
  { id: 'l-jal-3', branch: 'Jalandhar', student_name: 'Manpreet Singh', status: 'CONTACTED', assigned_to_name: 'Rohit Sharma' },
  { id: 'l-jal-4', branch: 'Jalandhar', student_name: 'Navjot Kaur', status: 'NEW', assigned_to_name: 'Rohit Sharma' },
  // Ludhiana
  { id: 'l-ldh-1', branch: 'Ludhiana', student_name: 'Arshdeep Singh', status: 'ENROLLED', assigned_to_name: 'Priya Verma' },
  { id: 'l-ldh-2', branch: 'Ludhiana', student_name: 'Simran Gill', status: 'CONTACTED', assigned_to_name: 'Priya Verma' },
  { id: 'l-ldh-3', branch: 'Ludhiana', student_name: 'Harjot Singh', status: 'DEMO_SCHEDULED', assigned_to_name: 'Priya Verma' },
  // Jagraon
  { id: 'l-jag-1', branch: 'Jagraon', student_name: 'Baljinder Kaur', status: 'ENROLLED', assigned_to_name: 'Simranjit Kaur' },
  { id: 'l-jag-2', branch: 'Jagraon', student_name: 'Sukhman Singh', status: 'CONTACTED', assigned_to_name: 'Simranjit Kaur' },
  { id: 'l-jag-3', branch: 'Jagraon', student_name: 'Amanjot Kaur', status: 'NEW', assigned_to_name: 'Simranjit Kaur' },
];

export default async function SalesDashboard({ params }: { params: Promise<{ branch: string }> }) {
  const branch = (await params).branch;
  const decodedBranch = decodeURIComponent(branch);
  
  let role = 'SALES_REP';
  let fullName = 'Sales Staff';
  let userId: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const serviceClient = await createServiceRoleClient();
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role) role = profile.role;
      if (profile?.full_name) fullName = profile.full_name;
    } else {
      const cookieStore = await cookies();
      const staffSessionCookie = cookieStore.get('staff_session')?.value;
      if (staffSessionCookie) {
        try {
          const parsed = JSON.parse(staffSessionCookie);
          if (parsed.role) role = parsed.role;
          if (parsed.fullName) fullName = parsed.fullName;
          if (parsed.userId) userId = parsed.userId;
        } catch {}
      }
    }
  } catch (e) {
    console.error('Error fetching user context:', e);
  }

  const isSalesRep = role === 'SALES_REP';

  let leads: any[] = [];
  let isDemo = false;

  try {
    const cookieStore = await cookies();
    isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === 'true';

    if (!isDemo) {
      const supabase = await createClient();
      let query = supabase.from('leads').select('*').eq('branch', decodedBranch);
      if (isSalesRep && userId && !userId.startsWith('preview-')) {
        query = query.eq('assigned_to', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        leads = data;
      }
    }
  } catch {}

  // Fallback to mock leads ONLY in Demo Mode (pitch & showcase)
  if (isDemo) {
    let mock = MOCK_LEADS_DASHBOARD.filter(
      (l) => l.branch.toLowerCase() === decodedBranch.toLowerCase()
    );
    if (isSalesRep && fullName) {
      const firstName = fullName.split(' ')[0].toLowerCase();
      const repMock = mock.filter((l) => l.assigned_to_name.toLowerCase().includes(firstName));
      if (repMock.length > 0) {
        mock = repMock;
      }
    }
    leads = mock;
  }

  const totalLeads = leads.length;
  const enrolledCount = leads.filter(l => l.status === 'ENROLLED').length;
  const conversionRate = totalLeads > 0 ? Math.round((enrolledCount / totalLeads) * 100) : 0;
  const activeCount = leads.filter(l => l.status !== 'LOST' && l.status !== 'ENROLLED').length;

  return (
    <div className="space-y-6">
      {/* Role and Isolation Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
        isSalesRep 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : 'bg-purple-50 border-purple-200 text-purple-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSalesRep ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
            {isSalesRep ? <User size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <div className="font-semibold text-sm">
              {isSalesRep ? (
                <>🔒 Isolated Sales Rep Portal &bull; Logged in as <span className="underline">{fullName}</span></>
              ) : (
                <>🏢 Branch Head Overview &bull; Logged in as <span className="underline">{fullName}</span></>
              )}
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {isSalesRep
                ? 'You can only view and manage leads assigned to you. Other representatives cannot see your leads.'
                : `You have full visibility of all leads and performance across the ${decodedBranch} branch.`}
            </p>
          </div>
        </div>
        <Link
          href={`/sales/${branch}/leads`}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap ${
            isSalesRep
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-[#5B4B8A] text-white hover:bg-[#4a3d70]'
          }`}
        >
          <span>Manage Pipeline</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              {isSalesRep ? 'My Active Pipeline' : 'Total Active Pipeline'}
            </p>
            <p className="text-2xl font-bold">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-rose-100 p-3 rounded-lg text-rose-600"><AlertCircle size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              {isSalesRep ? 'My Follow-ups Today' : 'Branch Follow-ups'}
            </p>
            <p className="text-2xl font-bold">1</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600"><UserCheck size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              {isSalesRep ? 'My Enrollments' : 'Total Enrollments'}
            </p>
            <p className="text-2xl font-bold">{enrolledCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><TrendingUp size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Conversion Rate</p>
            <p className="text-2xl font-bold">{conversionRate}%</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {isSalesRep ? 'My Recent Leads' : 'Branch Recent Leads'}
            </h2>
            <Link href={`/sales/${branch}/leads`} className="text-[#5B4B8A] text-xs font-semibold hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Student Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Assigned Representative</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 10).map((lead: any) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{lead.student_name}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-700' :
                        lead.status === 'DEMO_SCHEDULED' ? 'bg-purple-100 text-purple-700' :
                        lead.status === 'CONTACTED' ? 'bg-amber-100 text-amber-700' :
                        lead.status === 'LOST' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      <span className="font-medium text-gray-700">{lead.assigned_to_name || lead.assigned_to || fullName}</span>
                    </td>
                  </tr>
                ))}
                {!leads?.length && <tr><td colSpan={3} className="py-8 text-center text-gray-500">No leads found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-4 text-rose-600 flex items-center gap-2">
              <AlertCircle size={20}/> Urgent Follow-ups
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                <p className="text-xs font-semibold text-rose-800">Jasleen Kaur (Quantitative Aptitude Demo)</p>
                <p className="text-xs text-rose-600 mt-1">Due today at 4:00 PM &bull; Call regarding demo feedback</p>
              </div>
            </div>
          </div>
          <Link 
            href={`/sales/${branch}/follow-ups`} 
            className="text-[#5B4B8A] text-sm font-semibold hover:underline inline-flex items-center gap-1 mt-4 pt-4 border-t border-gray-100"
          >
            <span>View all follow-up reminders</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
