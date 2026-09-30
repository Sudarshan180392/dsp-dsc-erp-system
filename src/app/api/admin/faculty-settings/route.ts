import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

let previewPasscode = 'sudarshansir@';

export async function GET() {
  try {
    const supabase = await createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('institute_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data?.faculty_passcode) {
      previewPasscode = data.faculty_passcode;
      return NextResponse.json({
        passcode: data.faculty_passcode,
        institute_name: data.institute_name || 'DSP & DSC'
      });
    }
  } catch (error: any) {
    console.warn("Using fallback faculty passcode:", error.message);
  }

  return NextResponse.json({
    passcode: previewPasscode,
    institute_name: 'DSP & DSC'
  });
}

export async function PATCH(request: Request) {
  try {
    const { passcode } = await request.json();
    if (!passcode) {
      return NextResponse.json({ error: "Passcode cannot be empty" }, { status: 400 });
    }

    previewPasscode = passcode;

    try {
      const supabase = await createServiceRoleClient();
      
      // Check if an existing institute_settings row exists
      const { data: existing } = await supabase
        .from('institute_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let result;
      if (existing?.id) {
        result = await supabase
          .from('institute_settings')
          .update({ faculty_passcode: passcode })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('institute_settings')
          .insert({ faculty_passcode: passcode, institute_name: 'DSP & DSC' })
          .select()
          .single();
      }

      if (!result.error && result.data) {
        return NextResponse.json({
          success: true,
          passcode: result.data.faculty_passcode
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      passcode: previewPasscode
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
