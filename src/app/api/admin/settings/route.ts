import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

let previewSettings = {
  institute_name: 'DSP & DSC',
  faculty_passcode: 'sudarshansir@',
  superadmin_email: 'superadmin@dspdsc.com',
  superadmin_name: 'Superadmin (Director)',
};

export async function GET() {
  try {
    const supabase = await createServiceRoleClient();
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    let email = previewSettings.superadmin_email;
    let fullName = previewSettings.superadmin_name;
    let instituteName = previewSettings.institute_name;
    let facultyPasscode = previewSettings.faculty_passcode;

    if (user) {
      email = user.email || email;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, email')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        fullName = profile.full_name || fullName;
        email = profile.email || email;
      }
    }

    // Fetch institute settings
    try {
      const { data: instData } = await supabase
        .from('institute_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (instData) {
        if (instData.institute_name) instituteName = instData.institute_name;
        if (instData.faculty_passcode) facultyPasscode = instData.faculty_passcode;
      }
    } catch (e) {
      console.warn('Could not read institute_settings table:', e);
    }

    return NextResponse.json({
      success: true,
      profile: {
        email,
        full_name: fullName,
        role: 'SUPERADMIN',
      },
      institute: {
        institute_name: instituteName,
        faculty_passcode: facultyPasscode,
      },
    });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({
      success: true,
      profile: {
        email: previewSettings.superadmin_email,
        full_name: previewSettings.superadmin_name,
        role: 'SUPERADMIN',
      },
      institute: {
        institute_name: previewSettings.institute_name,
        faculty_passcode: previewSettings.faculty_passcode,
      },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { password, full_name, email, institute_name, faculty_passcode } = body;

    const supabase = await createServiceRoleClient();
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    // Verify caller has SUPERADMIN privileges
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.role !== 'SUPERADMIN') {
        return NextResponse.json({ error: 'Only Superadmin can alter master security settings.' }, { status: 403 });
      }
    }

    // 1. Update Password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      if (user) {
        try {
          const { error: authErr } = await supabase.auth.admin.updateUserById(user.id, {
            password: password,
          });
          if (authErr) {
            console.error('Error updating auth password:', authErr);
          }
          await supabase.from('profiles').update({
            raw_password: password,
            updated_at: new Date().toISOString(),
          }).eq('id', user.id);
        } catch (e) {
          console.warn('Auth password update fallback:', e);
        }
      }
    }

    // 2. Update Profile Name / Email
    if (full_name || email) {
      if (user) {
        try {
          const updatePayload: any = { updated_at: new Date().toISOString() };
          if (full_name) updatePayload.full_name = full_name;
          if (email) updatePayload.email = email;

          await supabase.from('profiles').update(updatePayload).eq('id', user.id);

          if (email) {
            await supabase.auth.admin.updateUserById(user.id, { email });
          }
        } catch (e) {
          console.warn('Profile update fallback:', e);
        }
      }
      if (full_name) previewSettings.superadmin_name = full_name;
      if (email) previewSettings.superadmin_email = email;
    }

    // 3. Update Institute Settings
    if (institute_name || faculty_passcode) {
      if (institute_name) previewSettings.institute_name = institute_name;
      if (faculty_passcode) previewSettings.faculty_passcode = faculty_passcode;

      try {
        const { data: existing } = await supabase
          .from('institute_settings')
          .select('id')
          .limit(1)
          .maybeSingle();

        const instPayload: any = {};
        if (institute_name) instPayload.institute_name = institute_name;
        if (faculty_passcode) instPayload.faculty_passcode = faculty_passcode;

        if (existing?.id) {
          await supabase.from('institute_settings').update(instPayload).eq('id', existing.id);
        } else {
          await supabase.from('institute_settings').insert([instPayload]);
        }
      } catch (e) {
        console.warn('Institute settings DB update fallback:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Master security settings updated successfully',
    });
  } catch (error: any) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
