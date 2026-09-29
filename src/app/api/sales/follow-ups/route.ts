import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch');
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, leads!inner(*)')
    .eq('leads.branch', branch)
    .neq('status', 'COMPLETED');
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  const result: { overdue: any[]; today: any[]; upcoming: any[] } = { overdue: [], today: [], upcoming: [] };
  
  (data || []).forEach((item: any) => {
    if (item.scheduled_date < todayStr) result.overdue.push(item);
    else if (item.scheduled_date === todayStr) result.today.push(item);
    else result.upcoming.push(item);
  });
  
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase.from('follow_ups').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
