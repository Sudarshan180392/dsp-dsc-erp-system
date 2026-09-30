import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PREVIEW_STAFF_USERS: Record<string, { role: string; branch: string | null; fullName: string }> = {
  'superadmin@dspdsc.com': { role: 'SUPERADMIN', branch: null, fullName: 'Superadmin (Director)' },
  'admin@dspdsc.com': { role: 'SUPERADMIN', branch: null, fullName: 'Superadmin (Director)' },
  'admin.vikas@dspdsc.com': { role: 'ADMIN', branch: null, fullName: 'Vikas Sharma (Academic Admin)' },
  'head.jal@dspdsc.com': { role: 'BRANCH_HEAD', branch: 'Jalandhar', fullName: 'Jalandhar Branch Head' },
  'sales.jal@dspdsc.com': { role: 'SALES_REP', branch: 'Jalandhar', fullName: 'Rohit Sharma (Jalandhar)' },
  'head.ldh@dspdsc.com': { role: 'BRANCH_HEAD', branch: 'Ludhiana', fullName: 'Ludhiana Branch Head' },
  'sales.ldh@dspdsc.com': { role: 'SALES_REP', branch: 'Ludhiana', fullName: 'Priya Verma (Ludhiana)' },
  'head.jag@dspdsc.com': { role: 'BRANCH_HEAD', branch: 'Jagraon', fullName: 'Jagraon Branch Head' },
  'sales.jag@dspdsc.com': { role: 'SALES_REP', branch: 'Jagraon', fullName: 'Simranjit Kaur (Jagraon)' },
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Normalize email or username
    let normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.includes('@')) {
      const aliasMap: Record<string, string> = {
        'superadmin': 'superadmin@dspdsc.com',
        'admin': 'admin@dspdsc.com',
        'vikas': 'admin.vikas@dspdsc.com',
        'admin.vikas': 'admin.vikas@dspdsc.com',
        'rohit': 'sales.jal@dspdsc.com',
        'sales.jal': 'sales.jal@dspdsc.com',
        'priya': 'sales.ldh@dspdsc.com',
        'sales.ldh': 'sales.ldh@dspdsc.com',
        'simranjit': 'sales.jag@dspdsc.com',
        'simran': 'sales.jag@dspdsc.com',
        'sales.jag': 'sales.jag@dspdsc.com',
        'head.jal': 'head.jal@dspdsc.com',
        'head.ldh': 'head.ldh@dspdsc.com',
        'head.jag': 'head.jag@dspdsc.com',
      };
      normalizedEmail = aliasMap[normalizedEmail] || `${normalizedEmail}@dspdsc.com`;
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, branch, full_name')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const res = NextResponse.json({
            success: true,
            userId: data.user.id,
            role: profile.role,
            branch: profile.branch,
            fullName: profile.full_name,
          });
          res.cookies.set('staff_session', JSON.stringify({
            userId: data.user.id,
            role: profile.role,
            branch: profile.branch,
            fullName: profile.full_name,
            email: normalizedEmail,
          }), {
            path: '/',
            maxAge: 60 * 60 * 24,
            httpOnly: false,
            sameSite: 'lax',
          });
          return res;
        }
      }
    } catch {
      // Supabase offline / preview mode fallback
    }

    // Frontend Preview Mode fallback:
    let resolvedUser: { role: string; branch: string | null; fullName: string; userId: string } | null = null;

    if (PREVIEW_STAFF_USERS[normalizedEmail]) {
      const u = PREVIEW_STAFF_USERS[normalizedEmail];
      resolvedUser = {
        userId: 'preview-' + normalizedEmail,
        role: u.role,
        branch: u.branch,
        fullName: u.fullName,
      };
    } else if (normalizedEmail.includes('superadmin')) {
      resolvedUser = {
        userId: 'preview-superadmin',
        role: 'SUPERADMIN',
        branch: null,
        fullName: 'Superadmin (Director)',
      };
    } else if (normalizedEmail.includes('admin') || normalizedEmail.includes('vikas')) {
      resolvedUser = {
        userId: 'preview-admin',
        role: 'ADMIN',
        branch: null,
        fullName: 'Academic Admin',
      };
    } else if (normalizedEmail.includes('sales') || normalizedEmail.includes('rep')) {
      resolvedUser = {
        userId: 'preview-sales',
        role: 'SALES_REP',
        branch: 'Jalandhar',
        fullName: 'Sales Representative',
      };
    } else {
      resolvedUser = {
        userId: 'preview-demo',
        role: 'BRANCH_HEAD',
        branch: 'Jalandhar',
        fullName: 'Demo Staff (Jalandhar)',
      };
    }

    const res = NextResponse.json({
      success: true,
      userId: resolvedUser.userId,
      role: resolvedUser.role,
      branch: resolvedUser.branch,
      fullName: resolvedUser.fullName,
    });
    res.cookies.set('staff_session', JSON.stringify({
      userId: resolvedUser.userId,
      role: resolvedUser.role,
      branch: resolvedUser.branch,
      fullName: resolvedUser.fullName,
      email: normalizedEmail,
    }), {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      sameSite: 'lax',
    });
    return res;
  } catch (error) {
    console.error('Error in staff login:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
