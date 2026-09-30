import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { DEMO_COOKIE_NAME } from '@/lib/demo';

const DEMO_FACULTY = [
  { id: 'f1000000-0000-0000-0000-000000000001', name: 'Amit Kumar', subject: 'Quantitative Aptitude', is_active: true },
  { id: 'f2000000-0000-0000-0000-000000000002', name: 'Sneha Sharma', subject: 'Reasoning', is_active: true },
  { id: 'f3000000-0000-0000-0000-000000000003', name: 'Rohan Verma', subject: 'English', is_active: true },
  { id: 'f4000000-0000-0000-0000-000000000004', name: 'Neha Gupta', subject: 'Static GK', is_active: true },
  { id: 'f5000000-0000-0000-0000-000000000005', name: 'Vikram Singh', subject: 'Current Affairs', is_active: true },
  { id: 'f6000000-0000-0000-0000-000000000006', name: 'Priya Patel', subject: 'Computer Knowledge', is_active: true },
];

export async function GET() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === 'true';

  if (!isDemo) {
    try {
      const supabase = await createServiceRoleClient();
      const { data, error } = await supabase
        .from('faculty_roster')
        .select('*')
        .order('name');

      if (!error && data) {
        return NextResponse.json(data);
      }
    } catch (err) {
      console.error('Error fetching live faculty roster:', err);
    }
  }

  return NextResponse.json(DEMO_FACULTY);
}

export async function POST(request: Request) {
  try {
    const { name, subject } = await request.json();
    const supabase = await createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('faculty_roster')
      .insert([{ name, subject, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
