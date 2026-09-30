import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = await createServiceRoleClient();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('faculty_session')?.value;

    let facultyId: string | null = null;
    let facultyName: string | null = null;
    let facultySubject: string | null = null;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        facultyId = parsed.facultyId;
        facultyName = parsed.facultyName || parsed.name;
        facultySubject = parsed.subject;
      } catch (e) {}
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_subjects (
          id,
          subject,
          faculty_id
        )
      `)
      .order('created_at', { ascending: false });

    const isDemo = cookieStore.get('dsp_demo_mode')?.value === 'true';

    if (!isDemo && !error && courses) {
      // Attach assigned_subject for the logged-in faculty
      const mapped = courses.map((c: any) => {
        let assignedSub = facultySubject || 'General';
        if (facultyId && c.course_subjects) {
          const found = c.course_subjects.find((cs: any) => cs.faculty_id === facultyId);
          if (found) assignedSub = found.subject;
        }
        return {
          ...c,
          assigned_subject: assignedSub,
          faculty_name: facultyName,
          faculty_id: facultyId
        };
      });

      return NextResponse.json(mapped);
    }

    if (error || !courses || courses.length === 0) {
      // Fallback sample course ONLY for demo/showcase
      return NextResponse.json([
        {
          id: 'bb000000-0000-0000-0000-000000000001',
          course_name: 'SSC CGL 2027',
          batch_name: 'Morning Batch',
          start_date: '2026-09-28',
          target_end_date: '2027-03-28',
          total_weeks: 26,
          assigned_subject: facultySubject || 'Quantitative Aptitude',
          description: 'Comprehensive preparation for SSC CGL 2027.'
        }
      ]);
    }

    // Attach assigned_subject for the logged-in faculty
    const mapped = courses.map((c: any) => {
      let assignedSub = facultySubject || 'General';
      if (facultyId && c.course_subjects) {
        const found = c.course_subjects.find((cs: any) => cs.faculty_id === facultyId);
        if (found) assignedSub = found.subject;
      }
      return {
        ...c,
        assigned_subject: assignedSub,
        faculty_name: facultyName,
        faculty_id: facultyId
      };
    });

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServiceRoleClient();
    const { id, description } = body;

    const { data, error } = await supabase
      .from('courses')
      .update({ description })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
