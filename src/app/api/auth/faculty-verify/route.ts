import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const FALLBACK_FACULTY = [
  { id: 'f1000000-0000-0000-0000-000000000001', name: 'Amit Kumar', subject: 'Quantitative Aptitude', is_active: true },
  { id: 'f2000000-0000-0000-0000-000000000002', name: 'Sneha Sharma', subject: 'Reasoning', is_active: true },
  { id: 'f3000000-0000-0000-0000-000000000003', name: 'Rohan Verma', subject: 'English', is_active: true },
  { id: 'f4000000-0000-0000-0000-000000000004', name: 'Neha Gupta', subject: 'Static GK', is_active: true },
  { id: 'f5000000-0000-0000-0000-000000000005', name: 'Vikram Singh', subject: 'Current Affairs', is_active: true },
  { id: 'f6000000-0000-0000-0000-000000000006', name: 'Priya Patel', subject: 'Computer Knowledge', is_active: true },
];

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    if (!passcode) {
      return NextResponse.json({ success: false, error: 'Passcode is required' }, { status: 400 });
    }

    try {
      const supabase = await createServiceRoleClient();
      const { data: settings, error: settingsError } = await supabase
        .from('institute_settings')
        .select('faculty_passcode')
        .single();

      if (!settingsError && settings) {
        if (passcode !== settings.faculty_passcode) {
          return NextResponse.json({ success: false, error: 'Invalid passcode' }, { status: 401 });
        }

        const { data: faculty } = await supabase
          .from('faculty_roster')
          .select('*')
          .eq('is_active', true);

        return NextResponse.json({ success: true, faculty: faculty || FALLBACK_FACULTY });
      }
    } catch {
      // Supabase offline / preview mode fallback
    }

    // Frontend Preview Mode fallback:
    if (passcode === 'faculty123' || passcode === 'admin123' || passcode === 'sudarshansir@') {
      return NextResponse.json({ success: true, faculty: FALLBACK_FACULTY });
    }

    return NextResponse.json({ success: false, error: 'Invalid passcode. (Hint for preview: faculty123)' }, { status: 401 });
  } catch (error) {
    console.error('Error in faculty verify:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
