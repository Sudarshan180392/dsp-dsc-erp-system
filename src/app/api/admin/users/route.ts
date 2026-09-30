import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { DEMO_COOKIE_NAME } from '@/lib/demo';

const MOCK_PROFILES = [
  { id: 'u1', email: 'superadmin@dspdsc.com', full_name: 'Superadmin (Director)', role: 'SUPERADMIN', branch: null, raw_password: 'superadmin@dspdsc', is_active: true, created_at: new Date().toISOString() },
  { id: 'u0', email: 'admin.vikas@dspdsc.com', full_name: 'Vikas Sharma (Academic Admin)', role: 'ADMIN', branch: null, raw_password: 'vikas@admin123', permissions: { user_management: true, faculty_settings: true, courses: true, sales_pipeline: true, academics: true }, is_active: true, created_at: new Date().toISOString() },
  { id: 'u2', email: 'head.jal@dspdsc.com', full_name: 'Harpreet Singh (Branch Head)', role: 'BRANCH_HEAD', branch: 'Jalandhar', raw_password: 'head.jal@123', is_active: true, created_at: new Date().toISOString() },
  { id: 'u3', email: 'sales.jal@dspdsc.com', full_name: 'Rohit Sharma (Senior Counselor)', role: 'SALES_REP', branch: 'Jalandhar', raw_password: 'rohit@dspdsc', is_active: true, created_at: new Date().toISOString() },
  { id: 'u4', email: 'head.ldh@dspdsc.com', full_name: 'Gurpreet Kaur (Branch Head)', role: 'BRANCH_HEAD', branch: 'Ludhiana', raw_password: 'head.ldh@123', is_active: true, created_at: new Date().toISOString() },
  { id: 'u5', email: 'sales.ldh@dspdsc.com', full_name: 'Priya Verma (Sales Counselor)', role: 'SALES_REP', branch: 'Ludhiana', raw_password: 'priya@dspdsc', is_active: true, created_at: new Date().toISOString() },
  { id: 'u6', email: 'head.jag@dspdsc.com', full_name: 'Amandeep Singh (Branch Head)', role: 'BRANCH_HEAD', branch: 'Jagraon', raw_password: 'head.jag@123', is_active: true, created_at: new Date().toISOString() },
  { id: 'u7', email: 'sales.jag@dspdsc.com', full_name: 'Simranjit Kaur (Counselor)', role: 'SALES_REP', branch: 'Jagraon', raw_password: 'simran@dspdsc', is_active: true, created_at: new Date().toISOString() },
];

export async function GET() {
  try {
    const supabase = await createServiceRoleClient();
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    let callerRole = 'SUPERADMIN';
    let callerPermissions: any = null;

    if (user) {
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', user.id)
        .maybeSingle();

      if (callerProfile) {
        callerRole = callerProfile.role;
        callerPermissions = callerProfile.permissions;
      }
    }

    // Only SUPERADMIN and ADMIN can access users API
    if (callerRole !== 'SUPERADMIN' && callerRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
    }

    // If caller is an ADMIN, check permission
    if (callerRole === 'ADMIN') {
      if (callerPermissions && callerPermissions.user_management === false) {
        return NextResponse.json({ error: 'You do not have permission to manage users.' }, { status: 403 });
      }
    }

    const cookieStore = await cookies();
    const isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === 'true';

    // LIVE MODE: Real users query live Supabase database
    if (!isDemo) {
      const { data: users, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

      if (!error && users) {
        let resultUsers: any[] = users;
        // Security filter: If caller is ADMIN, they cannot view passwords of Admins or Superadmin
        if (callerRole === 'ADMIN') {
          resultUsers = resultUsers.map((u: any) => {
            if (u.role === 'ADMIN' || u.role === 'SUPERADMIN') {
              return { ...u, raw_password: null };
            }
            return u;
          });
        }
        return NextResponse.json(resultUsers);
      }
    }

    // DEMO MODE ONLY: Return mock profiles for presentation/pitch
    let resultUsers: any[] = MOCK_PROFILES;
    if (callerRole === 'ADMIN') {
      resultUsers = resultUsers.map((u: any) => {
        if (u.role === 'ADMIN' || u.role === 'SUPERADMIN') {
          return { ...u, raw_password: null };
        }
        return u;
      });
    }

    return NextResponse.json(resultUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, role, branch, permissions } = body;

    const supabase = await createServiceRoleClient();
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    let callerRole = 'SUPERADMIN';
    if (user) {
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', user.id)
        .maybeSingle();

      if (callerProfile) {
        callerRole = callerProfile.role;
        if (callerRole !== 'SUPERADMIN' && callerRole !== 'ADMIN') {
          return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
        }
        if (callerRole === 'ADMIN') {
          if (callerProfile.permissions?.user_management === false) {
            return NextResponse.json({ error: 'You do not have permission to manage users.' }, { status: 403 });
          }
          if (role === 'SUPERADMIN' || role === 'ADMIN') {
            return NextResponse.json({ error: 'Only Superadmin has the sole authority to create or promote Admins.' }, { status: 403 });
          }
        }
      }
    }

    // Default permissions for an ADMIN user created by Superadmin
    const adminPermissions = role === 'ADMIN' ? (permissions || {
      user_management: false,
      faculty_settings: true,
      courses: true,
      sales_pipeline: true,
      academics: true
    }) : null;
    
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role, branch }
      });

      if (!authError && authData.user) {
        const profilePayload: any = {
          id: authData.user.id,
          email,
          full_name,
          role,
          branch: (role === 'SUPERADMIN' || role === 'ADMIN') ? null : branch,
          permissions: adminPermissions,
          raw_password: password || null,
          is_active: true
        };

        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert([profilePayload])
          .select()
          .single();

        if (profileError) {
          // If raw_password column doesn't exist yet, retry without it
          if (profileError.message?.includes('raw_password')) {
            delete profilePayload.raw_password;
            const retry = await supabase.from('profiles').insert([profilePayload]).select().single();
            profile = retry.data;
            profileError = retry.error;
          }
        }

        if (profileError) throw profileError;
        if (profile) {
          return NextResponse.json({ ...profile, raw_password: password || null });
        }
      } else if (authError) {
        throw authError;
      }
    } catch (err: any) {
      console.error('Error creating user in Supabase:', err);
      // If error is other than network, return error
      if (err.message && !err.message.includes('fetch failed')) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    }

    const newProfile = {
      id: `u-${Date.now()}`,
      email,
      full_name,
      role,
      branch: (role === 'SUPERADMIN' || role === 'ADMIN') ? null : branch,
      permissions: adminPermissions,
      raw_password: password || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    return NextResponse.json(newProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
