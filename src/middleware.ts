import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_COOKIE_NAME } from '@/lib/demo';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // If Demo / Showcase mode is active, allow seamless direct preview access for sales demonstrations
  const isDemoMode = request.cookies.get(DEMO_COOKIE_NAME)?.value === 'true';
  if (isDemoMode) {
    return NextResponse.next();
  }

  // If Supabase is not yet configured, allow direct preview access to test the frontend!
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // For /admin/*
  if (path.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'SUPERADMIN' && profile?.role !== 'ADMIN') {
      url.pathname = '/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // For /sales/*
  if (path.startsWith('/sales')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, branch')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'BRANCH_HEAD' && profile?.role !== 'SALES_REP' && profile?.role !== 'SUPERADMIN') {
      url.pathname = '/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    // Check branch isolation: If not SUPERADMIN, ensure staff only accesses their own branch
    const branchInPath = path.split('/')[2];
    if (profile.role !== 'SUPERADMIN' && branchInPath && profile.branch && profile.branch.toLowerCase() !== branchInPath.toLowerCase()) {
      url.pathname = `/sales/${profile.branch}`;
      return NextResponse.redirect(url);
    }
  }

  // For /faculty/*
  if (path.startsWith('/faculty')) {
    const facultySession = request.cookies.get('faculty_session');
    if (!facultySession) {
      url.pathname = '/login';
      url.searchParams.set('tab', 'faculty');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/sales/:path*',
    '/faculty/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
