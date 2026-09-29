import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const MOCK_COURSES = [
  {
    id: 'c1',
    course_name: 'SSC CGL 2027',
    batch_name: 'Morning Batch (DSP & DSC)',
    start_date: '2026-09-28',
    target_end_date: '2027-03-31',
    weeks: 26,
    total_weeks: 26,
    description: 'Comprehensive Tier 1 & 2 coaching for SSC CGL 2027.',
    status: 'Active',
    course_subjects: [
      { id: 'cs1', subject_name: 'Quantitative Aptitude', faculty: { id: 'f1', name: 'Amit Kumar' } },
      { id: 'cs2', subject_name: 'Reasoning', faculty: { id: 'f2', name: 'Sneha Sharma' } },
      { id: 'cs3', subject_name: 'English Language', faculty: { id: 'f3', name: 'Rohan Verma' } },
      { id: 'cs4', subject_name: 'General Awareness (Static GK)', faculty: { id: 'f4', name: 'Neha Gupta' } },
      { id: 'cs5', subject_name: 'Current Affairs', faculty: { id: 'f5', name: 'Vikram Singh' } },
      { id: 'cs6', subject_name: 'Computer Knowledge', faculty: { id: 'f6', name: 'Priya Patel' } },
    ]
  },
  {
    id: 'c2',
    course_name: 'Punjab State Govt Exams 2027',
    batch_name: 'Evening Special Batch',
    start_date: '2026-10-05',
    target_end_date: '2027-04-15',
    weeks: 24,
    total_weeks: 24,
    description: 'Targeted preparation for PSSSB, Punjab Police, and Revenue Patwari.',
    status: 'Upcoming',
    course_subjects: [
      { id: 'cs7', subject_name: 'Punjab GK & History', faculty: { id: 'f4', name: 'Neha Gupta' } },
      { id: 'cs8', subject_name: 'Punjabi Language & Grammar', faculty: { id: 'f3', name: 'Rohan Verma' } },
      { id: 'cs9', subject_name: 'Quantitative Aptitude', faculty: { id: 'f1', name: 'Amit Kumar' } },
    ]
  }
];

export async function GET() {
  try {
    const supabase = await createServiceRoleClient();
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_subjects (
          id,
          subject,
          faculty:faculty_roster (id, name, subject)
        )
      `)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json(MOCK_COURSES);
    }
    
    const mapped = data.map((c: any) => ({
      ...c,
      weeks: c.total_weeks || c.weeks || 26,
      course_subjects: (c.course_subjects || []).map((cs: any) => ({
        ...cs,
        subject_name: cs.subject || cs.subject_name
      }))
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json(MOCK_COURSES);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { course_name, batch_name, start_date, target_end_date, weeks, description, status, subjects } = body;
    
    try {
      const supabase = await createServiceRoleClient();
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert([{
          course_name,
          batch_name,
          start_date,
          target_end_date,
          weeks,
          description,
          status: status || 'Upcoming'
        }])
        .select()
        .single();

      if (!courseError && course) {
        if (subjects && subjects.length > 0) {
          const subjectInserts = subjects.map((sub: any) => ({
            course_id: course.id,
            faculty_id: sub.faculty_id,
            subject: sub.subject_name || sub.subject
          }));
          await supabase.from('course_subjects').insert(subjectInserts);
        }
        return NextResponse.json(course);
      }
    } catch {
      // Fallback
    }

    const newCourse = {
      id: `c-${Date.now()}`,
      course_name,
      batch_name,
      start_date,
      target_end_date,
      weeks: weeks || 26,
      description,
      status: status || 'Upcoming',
      course_subjects: subjects || []
    };
    return NextResponse.json(newCourse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
