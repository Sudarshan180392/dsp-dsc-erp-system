import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

const MOCK_PROFILES = [
  { id: 'u1', email: 'superadmin@dspdsc.com', full_name: 'Superadmin (Director)', role: 'SUPERADMIN', branch: null, is_active: true, created_at: new Date().toISOString() },
  { id: 'u2', email: 'head.jal@dspdsc.com', full_name: 'Harpreet Singh (Branch Head)', role: 'BRANCH_HEAD', branch: 'Jalandhar', is_active: true, created_at: new Date().toISOString() },
  { id: 'u3', email: 'sales.jal@dspdsc.com', full_name: 'Rohit Sharma (Senior Counselor)', role: 'SALES_REP', branch: 'Jalandhar', is_active: true, created_at: new Date().toISOString() },
  { id: 'u4', email: 'head.ldh@dspdsc.com', full_name: 'Gurpreet Kaur (Branch Head)', role: 'BRANCH_HEAD', branch: 'Ludhiana', is_active: true, created_at: new Date().toISOString() },
  { id: 'u5', email: 'sales.ldh@dspdsc.com', full_name: 'Priya Verma (Sales Counselor)', role: 'SALES_REP', branch: 'Ludhiana', is_active: true, created_at: new Date().toISOString() },
  { id: 'u6', email: 'head.jag@dspdsc.com', full_name: 'Amandeep Singh (Branch Head)', role: 'BRANCH_HEAD', branch: 'Jagraon', is_active: true, created_at: new Date().toISOString() },
  { id: 'u7', email: 'sales.jag@dspdsc.com', full_name: 'Simranjit Kaur (Counselor)', role: 'SALES_REP', branch: 'Jagraon', is_active: true, created_at: new Date().toISOString() },
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

    // If caller is an ADMIN, check permission
    if (callerRole === 'ADMIN') {
      if (callerPermissions && callerPermissions.user_management === false) {
        return NextResponse.json({ error: 'You do not have permission to manage users.' }, { status: 403 });
      }
    }

    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

    // If caller is ADMIN, they cannot view or manage other Admins or Superadmin
    if (callerRole === 'ADMIN') {
      query = query.in('role', ['BRANCH_HEAD', 'SALES_REP']);
    }

    const { data: users, error } = await query;

    if (error || !users || users.length === 0) {
      if (callerRole === 'ADMIN') {
        return NextResponse.json(MOCK_PROFILES.filter(u => u.role !== 'SUPERADMIN'));
      }
      return NextResponse.json(MOCK_PROFILES);
    }
    
    return NextResponse.json(users);
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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email,
              full_name,
              role,
              branch: (role === 'SUPERADMIN' || role === 'ADMIN') ? null : branch,
              permissions: adminPermissions,
              is_active: true
            }
          ])
          .select()
          .single();

        if (profileError) throw profileError;
        if (profile) return NextResponse.json(profile);
      } else if (authError) {
        throw authError;
      }
    } catch (err: any) {
      console.error('Error creating user in Supabase:', err);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const newProfile = {
      id: `u-${Date.now()}`,
      email,
      full_name,
      role,
      branch: (role === 'SUPERADMIN' || role === 'ADMIN') ? null : branch,
      permissions: adminPermissions,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    return NextResponse.json(newProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
