import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const MOCK_COURSE = {
  id: 'c1',
  course_name: 'SSC CGL 2027',
  batch_name: 'Morning Batch (DSP & DSC)',
  start_date: '2026-09-28',
  target_end_date: '2027-03-31',
  total_weeks: 26,
};

const MOCK_FACULTY_LIST = [
  {
    id: 'f1',
    name: 'Amit Kumar',
    subject: 'Quantitative Aptitude',
    latestCompletion: 35,
    expectedPct: 34,
    lastWeekUpdated: 9,
    classesTakenTotal: 25,
    lastUpdatedBy: 'Amit Kumar',
    lastUpdatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'f2',
    name: 'Sneha Sharma',
    subject: 'Reasoning',
    latestCompletion: 38,
    expectedPct: 34,
    lastWeekUpdated: 9,
    classesTakenTotal: 24,
    lastUpdatedBy: 'Sneha Sharma',
    lastUpdatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'f3',
    name: 'Rohan Verma',
    subject: 'English Language',
    latestCompletion: 30,
    expectedPct: 34,
    lastWeekUpdated: 8,
    classesTakenTotal: 20,
    lastUpdatedBy: 'Rohan Verma',
    lastUpdatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'f4',
    name: 'Neha Gupta',
    subject: 'General Awareness (Static GK)',
    latestCompletion: 22,
    expectedPct: 34,
    lastWeekUpdated: 7,
    classesTakenTotal: 16,
    lastUpdatedBy: 'Neha Gupta',
    lastUpdatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'f5',
    name: 'Vikram Singh',
    subject: 'Current Affairs',
    latestCompletion: 35,
    expectedPct: 34,
    lastWeekUpdated: 9,
    classesTakenTotal: 22,
    lastUpdatedBy: 'Vikram Singh',
    lastUpdatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'f6',
    name: 'Priya Patel',
    subject: 'Computer Knowledge',
    latestCompletion: 34,
    expectedPct: 34,
    lastWeekUpdated: 9,
    classesTakenTotal: 18,
    lastUpdatedBy: 'Priya Patel',
    lastUpdatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

const MOCK_MATRIX: Record<string, Record<number, number>> = {
  f1: { 1: 4, 2: 8, 3: 12, 4: 15, 5: 19, 6: 23, 7: 27, 8: 31, 9: 35 },
  f2: { 1: 5, 2: 9, 3: 13, 4: 17, 5: 21, 6: 26, 7: 30, 8: 34, 9: 38 },
  f3: { 1: 4, 2: 7, 3: 11, 4: 14, 5: 18, 6: 22, 7: 26, 8: 30 },
  f4: { 1: 3, 2: 6, 3: 9, 4: 12, 5: 15, 6: 19, 7: 22 },
  f5: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 35 },
  f6: { 1: 4, 2: 8, 3: 11, 4: 15, 5: 19, 6: 23, 7: 26, 8: 30, 9: 34 },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    try {
      const supabase = await createServiceRoleClient();

      // Check if courseId is a valid UUID
      const isValidUuid = courseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
      
      let currentCourse = null;
      if (isValidUuid) {
        const { data: foundCourse } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle();
        currentCourse = foundCourse;
      }

      if (!currentCourse) {
        const { data: allCourses } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        currentCourse = allCourses && allCourses.length > 0 ? allCourses[0] : null;
      }

      const { data: facultyRoster, error: rosterError } = await supabase
        .from('faculty_roster')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (facultyRoster && facultyRoster.length > 0) {
        const activeCourse = currentCourse || MOCK_COURSE;
        let logs: any[] = [];
        
        if (currentCourse?.id) {
          const { data: courseLogs } = await supabase
            .from('weekly_logs')
            .select('*')
            .eq('course_id', currentCourse.id)
            .order('week_no', { ascending: true });
          logs = courseLogs || [];
        }

        const start = new Date(activeCourse.start_date).getTime();
        const end = new Date(activeCourse.target_end_date).getTime();
        const now = new Date().getTime();

        const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
        const elapsedDays = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));

        const currentWeekNo = Math.min(
          activeCourse.total_weeks || 26,
          Math.max(1, Math.floor(elapsedDays / 7) + 1)
        );
        const expectedPct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

        const matrix: Record<string, Record<number, number>> = {};
        const facultyList = facultyRoster.map((fac: any) => {
          matrix[fac.id] = {};
          const facLogs = logs.filter(
            (l: any) => l.faculty_id === fac.id || l.faculty_name === fac.name
          );

          let latestCompletion = 0;
          let lastWeekUpdated = 0;
          let classesTakenTotal = 0;
          let lastUpdatedBy = fac.name;
          let lastUpdatedAt = null;

          facLogs.forEach((l: any) => {
            matrix[fac.id][l.week_no] = Number(l.completed_pct || 0);
            classesTakenTotal += Number(l.classes_taken || 0);

            if (l.week_no > lastWeekUpdated) {
              lastWeekUpdated = l.week_no;
              latestCompletion = Number(l.completed_pct || 0);
              lastUpdatedBy = l.updated_by_name || fac.name;
              lastUpdatedAt = l.updated_at;
            }
          });

          return {
            id: fac.id,
            name: fac.name,
            subject: fac.subject,
            latestCompletion,
            expectedPct,
            lastWeekUpdated,
            classesTakenTotal,
            lastUpdatedBy,
            lastUpdatedAt,
          };
        });

        return NextResponse.json({
          currentCourse: activeCourse,
          currentWeekNo,
          expectedPct,
          facultyList,
          matrix,
          logs,
        });
      }
    } catch (dbErr) {
      console.error('Error fetching live dashboard from Supabase:', dbErr);
    }

    // Return rich mock data for frontend testing
    return NextResponse.json({
      currentCourse: MOCK_COURSE,
      currentWeekNo: 9,
      expectedPct: 34,
      facultyList: MOCK_FACULTY_LIST,
      matrix: MOCK_MATRIX,
      logs: [],
    });
  } catch (error: any) {
    console.error('Error fetching faculty dashboard:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
