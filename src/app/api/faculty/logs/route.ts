import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase.from('weekly_logs').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createServiceRoleClient();
  
  const cookieStore = await cookies();
  const session = cookieStore.get('faculty_session')?.value;
  const facultyName = session ? JSON.parse(session).name : 'Unknown';
  
  const { data, error } = await supabase.from('weekly_logs').upsert({
    ...body,
    updated_by_name: facultyName,
  }).select().single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  await supabase.from('log_audit_history').insert({
    log_id: data.id,
    action: 'UPDATED',
    faculty_name: facultyName,
  });
  
  return NextResponse.json(data);
}
