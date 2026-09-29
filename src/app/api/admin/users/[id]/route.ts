import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, branch, full_name, is_active, password, permissions } = body;
    
    const supabase = await createServiceRoleClient();
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    // Check caller's role
    let callerRole = 'SUPERADMIN';
    if (user) {
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', user.id)
        .maybeSingle();

      if (callerProfile) {
        callerRole = callerProfile.role;
      }
    }

    // Check target user's role
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle();

    if (callerRole === 'ADMIN') {
      if (targetUser?.role === 'SUPERADMIN' || targetUser?.role === 'ADMIN') {
        return NextResponse.json({ error: 'Only Superadmin has the sole authority to modify Admins.' }, { status: 403 });
      }
      if (role === 'SUPERADMIN' || role === 'ADMIN') {
        return NextResponse.json({ error: 'Only Superadmin has the sole authority to promote someone as Admin.' }, { status: 403 });
      }
    }
    
    // Update Auth user if password is provided
    if (password) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        password: password
      });
      if (authError) throw authError;
    }
    
    // Update profile
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (branch !== undefined) updateData.branch = (role === 'ADMIN' || role === 'SUPERADMIN') ? null : branch;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (permissions !== undefined && callerRole === 'SUPERADMIN') {
      updateData.permissions = permissions;
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);
        
      if (profileError) throw profileError;
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceRoleClient();
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    let callerRole = 'SUPERADMIN';
    if (user) {
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (callerProfile) {
        callerRole = callerProfile.role;
      }
    }

    // Check target user's role
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', id)
      .maybeSingle();

    if (callerRole === 'ADMIN') {
      if (targetUser?.role === 'SUPERADMIN' || targetUser?.role === 'ADMIN') {
        return NextResponse.json({ error: 'Only Superadmin has the sole authority to remove or deactivate Admins.' }, { status: 403 });
      }
    }
    
    // Deactivate user in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id);
      
    if (profileError) throw profileError;
    
    // Ban in Auth
    await supabase.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
