import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // In preview mode or unauthenticated
      return NextResponse.json({ user: null });
    }

    const serviceClient = await createServiceRoleClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ user: null });
    }

    // Only Admin and Superadmin can view passwords; strip it for regular users
    if (profile.role !== 'SUPERADMIN' && profile.role !== 'ADMIN') {
      delete profile.raw_password;
    }

    return NextResponse.json({ user: profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
