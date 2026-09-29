import { createClient } from '@/lib/supabase/server';
import { Users, AlertCircle, TrendingUp, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default async function SalesDashboard({ params }: { params: Promise<{ branch: string }> }) {
  const branch = (await params).branch;
  const decodedBranch = decodeURIComponent(branch);
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('branch', decodedBranch);

  const totalLeads = leads?.length || 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users size={24}/></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Active Leads</p><p className="text-2xl font-bold">{totalLeads}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-rose-100 p-3 rounded-lg text-rose-600"><AlertCircle size={24}/></div>
          <div><p className="text-sm text-gray-500 font-medium">Follow-ups Due Today</p><p className="text-2xl font-bold">0</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600"><UserCheck size={24}/></div>
          <div><p className="text-sm text-gray-500 font-medium">Enrollments This Month</p><p className="text-2xl font-bold">0</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><TrendingUp size={24}/></div>
          <div><p className="text-sm text-gray-500 font-medium">Conversion Rate</p><p className="text-2xl font-bold">0%</p></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {leads?.slice(0, 10).map(lead => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 font-medium">{lead.student_name}</td>
                    <td className="py-3"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{lead.status}</span></td>
                    <td className="py-3 text-sm text-gray-600">{lead.assigned_to}</td>
                  </tr>
                ))}
                {!leads?.length && <tr><td colSpan={3} className="py-8 text-center text-gray-500">No leads found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4 text-rose-600 flex items-center gap-2"><AlertCircle size={20}/> Overdue Follow-ups</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">No overdue follow-ups.</p>
            <Link href={`/sales/${branch}/follow-ups`} className="text-[#5B4B8A] text-sm font-medium hover:underline inline-block mt-2">View all follow-ups &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
