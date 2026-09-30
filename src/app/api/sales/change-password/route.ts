import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const serviceClient = await createServiceRoleClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.email) {
      // 1. Verify current password
      if (currentPassword) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (verifyError) {
          return NextResponse.json(
            { error: 'Current password is incorrect. Please re-check and try again.' },
            { status: 400 }
          );
        }
      }

      // 2. Update user password in auth
      const { error: authError } = await serviceClient.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }

      // 3. Update profiles.raw_password so Admin and Superadmin can view it!
      const updateData: any = { raw_password: newPassword };
      let { error: profileError } = await serviceClient
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (profileError && profileError.message?.includes('raw_password')) {
        console.warn('raw_password column not found in profiles table');
      }

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully. Your new password is now active.',
      });
    }

    // Preview mode fallback: check staff_session cookie
    const cookieStore = await cookies();
    const staffSessionCookie = cookieStore.get('staff_session')?.value;
    if (staffSessionCookie) {
      try {
        const session = JSON.parse(staffSessionCookie);
        session.raw_password = newPassword;
        const res = NextResponse.json({
          success: true,
          message: 'Password updated successfully.',
        });
        res.cookies.set('staff_session', JSON.stringify(session), {
          path: '/',
          maxAge: 60 * 60 * 24,
          httpOnly: false,
          sameSite: 'lax',
        });
        return res;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error: any) {
    console.error('Error in change-password route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
