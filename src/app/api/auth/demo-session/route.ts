import { NextResponse } from 'next/server';
import { DEMO_COOKIE_NAME } from '@/lib/demo';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { target = 'admin', branch = 'Jalandhar' } = body;

    let redirectUrl = '/admin';

    const response = NextResponse.json({ success: true, redirect: redirectUrl });

    // Enable demo mode cookie
    response.cookies.set(DEMO_COOKIE_NAME, 'true', {
      path: '/',
      maxAge: 60 * 60 * 6, // 6 hours
      httpOnly: false,
      sameSite: 'lax',
    });

    if (target === 'faculty') {
      redirectUrl = '/faculty';
      // Set preview faculty session
      response.cookies.set('faculty_session', JSON.stringify({
        facultyId: 'f1000000-0000-0000-0000-000000000001',
        facultyName: 'Amit Kumar',
        subject: 'Quantitative Aptitude',
        role: 'FACULTY',
        isAuthenticated: true,
      }), {
        path: '/',
        maxAge: 60 * 60 * 6,
        httpOnly: false,
        sameSite: 'lax',
      });
    } else if (target === 'sales') {
      redirectUrl = `/sales/${branch}`;
      // Set preview branch head session
      response.cookies.set('staff_session', JSON.stringify({
        userId: 'preview-branch-head',
        role: 'BRANCH_HEAD',
        branch: branch,
        fullName: `${branch} Branch Head`,
        email: `head.${branch.toLowerCase().slice(0, 3)}@dspdsc.com`,
      }), {
        path: '/',
        maxAge: 60 * 60 * 6,
        httpOnly: false,
        sameSite: 'lax',
      });
    } else {
      // Superadmin
      redirectUrl = '/admin';
      response.cookies.set('staff_session', JSON.stringify({
        userId: 'preview-superadmin',
        role: 'SUPERADMIN',
        branch: null,
        fullName: 'Superadmin (Director)',
        email: 'superadmin@dspdsc.com',
      }), {
        path: '/',
        maxAge: 60 * 60 * 6,
        httpOnly: false,
        sameSite: 'lax',
      });
    }

    return NextResponse.json({ success: true, redirect: redirectUrl }, {
      headers: response.headers
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(DEMO_COOKIE_NAME);
  response.cookies.delete('staff_session');
  response.cookies.delete('faculty_session');
  return response;
}
