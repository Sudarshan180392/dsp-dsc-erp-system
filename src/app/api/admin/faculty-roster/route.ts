import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('faculty_roster')
      .select('*')
      .order('name');

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
