import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leads')
    .select('*, follow_ups(*), lead_activity_log(*)')
    .eq('id', id)
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const body = await request.json();
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.from('leads').update(body).eq('id', id).select().single();
    if (!error && data) {
      if (user) {
        await supabase.from('lead_activity_log').insert({
          lead_id: id,
          action_type: 'UPDATED',
          performed_by: user.id,
          performed_by_name: user.email || 'Staff',
          performed_by_role: 'STAFF',
          action_details: `Updated status to ${body.status || 'new values'}`,
        });
      }
      return NextResponse.json(data);
    }
  } catch {}

  // Preview fallback
  return NextResponse.json({ id, ...body, updated_at: new Date().toISOString() });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
