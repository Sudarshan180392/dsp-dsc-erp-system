'use client';
import { useState, useEffect, use } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Phone } from 'lucide-react';

export default function FollowUpsPage({ params }: { params: Promise<{ branch: string }> }) {
  const branch = decodeURIComponent(use(params).branch);
  const [followUps, setFollowUps] = useState<any>({ overdue: [], today: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, [branch]);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/follow-ups?branch=${encodeURIComponent(branch)}`);
      if (res.ok) {
        const data = await res.json();
        setFollowUps(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const FollowUpCard = ({ item }: { item: any }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{item.leads?.student_name || 'Unknown Lead'}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={14}/> {item.leads?.phone}</p>
        </div>
        <div className="flex flex-col items-end text-sm">
          <span className="font-medium text-gray-900 flex items-center gap-1"><Calendar size={14}/> {new Date(item.scheduled_date).toLocaleDateString()}</span>
          <span className="text-gray-500 flex items-center gap-1 mt-0.5"><Clock size={14}/> {item.scheduled_time}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">{item.notes || 'No notes provided.'}</p>
      <div className="flex gap-2">
        <button className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
          <CheckCircle2 size={16}/> Complete
        </button>
        <button className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
          <Calendar size={16}/> Reschedule
        </button>
        <button className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
          <XCircle size={16}/> Missed
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Follow-up Manager</h1>
        <button className="bg-[#5B4B8A] hover:bg-[#4a3d70] text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New Follow-up
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2">
            <AlertCircle size={20}/> Overdue <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full">{followUps.overdue.length}</span>
          </h2>
          {loading ? <p className="text-gray-500">Loading...</p> : followUps.overdue.map((item: any) => <FollowUpCard key={item.id} item={item} />)}
          {!loading && followUps.overdue.length === 0 && <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl text-center">No overdue follow-ups!</p>}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-amber-600 flex items-center gap-2">
            <Clock size={20}/> Due Today <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{followUps.today.length}</span>
          </h2>
          {loading ? <p className="text-gray-500">Loading...</p> : followUps.today.map((item: any) => <FollowUpCard key={item.id} item={item} />)}
          {!loading && followUps.today.length === 0 && <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl text-center">No follow-ups due today.</p>}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-emerald-600 flex items-center gap-2">
            <Calendar size={20}/> Upcoming <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{followUps.upcoming.length}</span>
          </h2>
          {loading ? <p className="text-gray-500">Loading...</p> : followUps.upcoming.map((item: any) => <FollowUpCard key={item.id} item={item} />)}
          {!loading && followUps.upcoming.length === 0 && <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl text-center">No upcoming follow-ups.</p>}
        </div>
      </div>
    </div>
  );
}
