import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

async function performLogout(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Error signing out of Supabase in route:', e);
  }

  const cookieStore = await cookies();
  
  // Delete faculty and staff sessions
  cookieStore.delete('faculty_session');
  cookieStore.delete('staff_session');

  // Delete all Supabase cookies (sb-*)
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name.startsWith('sb-') || c.name.includes('auth-token')) {
      cookieStore.delete(c.name);
    }
  }
}

export async function POST(request: Request) {
  await performLogout(request);
  const response = NextResponse.json({ success: true });
  response.cookies.delete('faculty_session');
  response.cookies.delete('staff_session');
  return response;
}

export async function GET(request: Request) {
  await performLogout(request);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const loginUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}/login` : new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete('faculty_session');
  response.cookies.delete('staff_session');
  return response;
}
