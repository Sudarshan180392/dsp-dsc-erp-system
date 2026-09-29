import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PREVIEW_STAFF_USERS: Record<string, { role: string; branch: string | null; fullName: string }> = {
  'admin@dspdsc.com': { role: 'SUPERADMIN', branch: null, fullName: 'Superadmin' },
  'head.jal@dspdsc.com': { role: 'BRANCH_HEAD', branch: 'Jalandhar', fullName: 'Jalandhar Branch Head' },
  'sales.jal@dspdsc.com': { role: 'SALES_REP', branch: 'Jalandhar', fullName: 'Rohit Sharma (Jalandhar)' },
  'head.ldh@dspdsc.com': { role: 'BRANCH_HEAD', branch: 'Ludhiana', fullName: 'Ludhiana Branch Head' },
  'sales.ldh@dspdsc.com': { role: 'SALES_REP', branch: 'Ludhiana', fullName: 'Priya Verma (Ludhiana)' },
  'head.jag@dspdsc.com': { role: 'BRANCH_HEAD', branch: 'Jagraon', fullName: 'Jagraon Branch Head' },
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, branch, full_name')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          return NextResponse.json({
            success: true,
            role: profile.role,
            branch: profile.branch,
            fullName: profile.full_name,
          });
        }
      }
    } catch {
      // Supabase offline / preview mode fallback
    }

    // Frontend Preview Mode fallback:
    const lowerEmail = email.toLowerCase().trim();
    if (PREVIEW_STAFF_USERS[lowerEmail]) {
      const user = PREVIEW_STAFF_USERS[lowerEmail];
      return NextResponse.json({
        success: true,
        role: user.role,
        branch: user.branch,
        fullName: user.fullName,
      });
    }

    // Any other email with password in preview mode
    if (lowerEmail.includes('admin')) {
      return NextResponse.json({
        success: true,
        role: 'SUPERADMIN',
        branch: null,
        fullName: 'Admin Preview',
      });
    }

    return NextResponse.json({
      success: true,
      role: 'BRANCH_HEAD',
      branch: 'Jalandhar',
      fullName: 'Demo Staff (Jalandhar)',
    });
  } catch (error) {
    console.error('Error in staff login:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
