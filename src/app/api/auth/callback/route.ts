import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';


export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Robust origin detection for Vercel / reverse proxies
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !session) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Check existing profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile) {
      if (profile.role === 'SUPERADMIN' && profile.is_active) {
        return NextResponse.redirect(`${origin}/admin`);
      } else {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=unauthorized`);
      }
    }

    // First time sign-in: check if any superadmin exists
    const serviceClient = await createServiceRoleClient();
    const { data: existingSuperadmins } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('role', 'SUPERADMIN')
      .limit(1);

    if (!existingSuperadmins || existingSuperadmins.length === 0) {
      // Auto-create initial Superadmin profile
      const userMeta = session.user.user_metadata || {};
      const fullName = userMeta.full_name || userMeta.name || session.user.email?.split('@')[0] || 'Superadmin';

      await serviceClient.from('profiles').insert({
        id: session.user.id,
        email: session.user.email,
        full_name: fullName,
        role: 'SUPERADMIN',
        branch: null,
        is_active: true,
      });

      return NextResponse.redirect(`${origin}/admin`);
    } else {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=unauthorized`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_request`);
}
