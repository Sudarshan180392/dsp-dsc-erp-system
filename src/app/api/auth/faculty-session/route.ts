import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { facultyId, facultyName, subject } = await request.json();

    if (!facultyId || !facultyName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionData = { facultyId, facultyName, subject, role: 'FACULTY', isAuthenticated: true };

    cookieStore.set('faculty_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in faculty session:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('faculty_session');
  return NextResponse.json({ success: true });
}
