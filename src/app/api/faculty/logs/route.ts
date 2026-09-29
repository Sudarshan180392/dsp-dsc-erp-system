import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id') || searchParams.get('courseId');
    const facultyId = searchParams.get('faculty_id') || searchParams.get('facultyId');
    const weekNo = searchParams.get('week_no') || searchParams.get('weekNo');

    const supabase = await createServiceRoleClient();
    let query = supabase.from('weekly_logs').select('*');

    if (courseId) query = query.eq('course_id', courseId);
    if (facultyId) query = query.eq('faculty_id', facultyId);
    if (weekNo) query = query.eq('week_no', parseInt(weekNo, 10));

    const { data, error } = await query.order('week_no', { ascending: true });

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      course_id,
      faculty_id,
      subject,
      week_no,
      week_start_date,
      week_end_date,
      topics_covered,
      classes_planned,
      classes_taken,
      completed_pct,
      next_week_plan,
      remarks,
      completed_topic_ids,
    } = body;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('faculty_session')?.value;
    let facultyName = 'Faculty Member';
    let sessionFacultyId = faculty_id;
    let sessionSubject = subject;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        facultyName = parsed.facultyName || parsed.name || facultyName;
        if (!sessionFacultyId) sessionFacultyId = parsed.facultyId;
        if (!sessionSubject) sessionSubject = parsed.subject;
      } catch (e) {}
    }

    const supabase = await createServiceRoleClient();

    // Check if an existing log for this course, faculty, week exists
    const { data: existingLog } = await supabase
      .from('weekly_logs')
      .select('*')
      .eq('course_id', course_id)
      .eq('faculty_id', sessionFacultyId)
      .eq('week_no', week_no)
      .maybeSingle();

    const logPayload = {
      course_id,
      faculty_id: sessionFacultyId,
      faculty_name: facultyName,
      subject: sessionSubject || 'General',
      week_no: Number(week_no),
      week_start_date: week_start_date || new Date().toISOString().split('T')[0],
      week_end_date: week_end_date || new Date().toISOString().split('T')[0],
      topics_covered: topics_covered || '',
      classes_planned: Number(classes_planned || 0),
      classes_taken: Number(classes_taken || 0),
      completed_pct: parseFloat(Number(completed_pct || 0).toFixed(2)),
      next_week_plan: next_week_plan || '',
      remarks: remarks || '',
      updated_by_name: facultyName,
    };

    let savedLog = null;

    if (existingLog?.id) {
      const { data, error } = await supabase
        .from('weekly_logs')
        .update(logPayload)
        .eq('id', existingLog.id)
        .select()
        .single();

      if (error) throw error;
      savedLog = data;

      // Audit trail
      await supabase.from('log_audit_history').insert([
        {
          log_id: existingLog.id,
          updated_by_name: facultyName,
          updated_by_faculty_id: sessionFacultyId,
          previous_completed_pct: existingLog.completed_pct,
          new_completed_pct: logPayload.completed_pct,
          previous_classes_taken: existingLog.classes_taken,
          new_classes_taken: logPayload.classes_taken,
          topics_covered: topics_covered,
          action: 'UPDATE'
        }
      ]);
    } else {
      const { data, error } = await supabase
        .from('weekly_logs')
        .insert([logPayload])
        .select()
        .single();

      if (error) throw error;
      savedLog = data;

      // Audit trail
      await supabase.from('log_audit_history').insert([
        {
          log_id: savedLog.id,
          updated_by_name: facultyName,
          updated_by_faculty_id: sessionFacultyId,
          new_completed_pct: logPayload.completed_pct,
          new_classes_taken: logPayload.classes_taken,
          topics_covered: topics_covered,
          action: 'CREATE'
        }
      ]);
    }

    // If specific syllabus topics were marked completed this week, update them in syllabus_topics
    if (completed_topic_ids && Array.isArray(completed_topic_ids) && completed_topic_ids.length > 0) {
      try {
        await supabase
          .from('syllabus_topics')
          .update({
            status: 'COMPLETED',
            completed_week: Number(week_no),
            completed_at: new Date().toISOString()
          })
          .in('id', completed_topic_ids);
      } catch (topicErr) {
        console.error('Error updating completed topics in syllabus_topics:', topicErr);
      }
    }

    return NextResponse.json({ success: true, log: savedLog });
  } catch (error: any) {
    console.error('Error in weekly logs API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
