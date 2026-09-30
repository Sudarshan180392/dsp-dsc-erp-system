import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const MOCK_FOLLOW_UPS: Record<string, any[]> = {
  Jalandhar: [
    {
      id: 'f-1',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '16:00',
      notes: 'Demo feedback call for Quantitative Aptitude.',
      status: 'PENDING',
      leads: { student_name: 'Jasleen Kaur', phone: '98140-55667', branch: 'Jalandhar', assigned_to_name: 'Rohit Sharma' }
    },
    {
      id: 'f-2',
      scheduled_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
      scheduled_time: '11:00',
      notes: 'Fee structure inquiry follow-up.',
      status: 'PENDING',
      leads: { student_name: 'Manpreet Singh', phone: '94170-88990', branch: 'Jalandhar', assigned_to_name: 'Rohit Sharma' }
    }
  ],
  Ludhiana: [
    {
      id: 'f-3',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '14:30',
      notes: 'Batch timings confirmation call.',
      status: 'PENDING',
      leads: { student_name: 'Simran Gill', phone: '97800-44556', branch: 'Ludhiana', assigned_to_name: 'Priya Verma' }
    }
  ],
  Jagraon: [
    {
      id: 'f-4',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '12:00',
      notes: 'Clerk exam syllabus discussion.',
      status: 'PENDING',
      leads: { student_name: 'Sukhman Singh', phone: '98555-22334', branch: 'Jagraon', assigned_to_name: 'Simranjit Kaur' }
    }
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch') || 'Jalandhar';
  
  let role = 'SALES_REP';
  let userId: string | null = null;
  let fullName = '';

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      userId = user.id;
      const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
      if (profile?.role) role = profile.role;
      if (profile?.full_name) fullName = profile.full_name;
    } else {
      const cookieStore = await cookies();
      const staffSessionCookie = cookieStore.get('staff_session')?.value;
      if (staffSessionCookie) {
        try {
          const parsed = JSON.parse(staffSessionCookie);
          if (parsed.role) role = parsed.role;
          if (parsed.userId) userId = parsed.userId;
          if (parsed.fullName) fullName = parsed.fullName;
        } catch {}
      }
    }

    let query = supabase
      .from('follow_ups')
      .select('*, leads!inner(*)')
      .eq('leads.branch', branch)
      .neq('status', 'COMPLETED');

    if (role === 'SALES_REP' && userId && !userId.startsWith('preview-')) {
      query = query.eq('leads.assigned_to', userId);
    }
      
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const result: { overdue: any[]; today: any[]; upcoming: any[] } = { overdue: [], today: [], upcoming: [] };
      data.forEach((item: any) => {
        if (item.scheduled_date < todayStr) result.overdue.push(item);
        else if (item.scheduled_date === todayStr) result.today.push(item);
        else result.upcoming.push(item);
      });
      return NextResponse.json(result);
    }
  } catch {}

  // Fallback to mock follow-ups
  const todayStr = new Date().toISOString().split('T')[0];
  const result: { overdue: any[]; today: any[]; upcoming: any[] } = { overdue: [], today: [], upcoming: [] };
  const mockItems = MOCK_FOLLOW_UPS[branch] || [];

  mockItems.forEach((item: any) => {
    // If rep logged in, isolate by rep name in mock
    if (role === 'SALES_REP' && fullName) {
      const firstName = fullName.split(' ')[0].toLowerCase();
      if (item.leads?.assigned_to_name && !item.leads.assigned_to_name.toLowerCase().includes(firstName)) {
        return;
      }
    }
    if (item.scheduled_date < todayStr) result.overdue.push(item);
    else if (item.scheduled_date === todayStr) result.today.push(item);
    else result.upcoming.push(item);
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('follow_ups').insert(body).select().single();
    if (!error && data) return NextResponse.json(data);
  } catch {}

  return NextResponse.json({ id: `f-${Date.now()}`, ...body, created_at: new Date().toISOString() });
}
