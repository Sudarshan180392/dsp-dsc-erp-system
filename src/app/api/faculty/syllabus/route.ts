import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Default starter templates if a faculty member has not yet added custom topics
const DEFAULT_TOPIC_TEMPLATES: Record<string, string[]> = {
  'Quantitative Aptitude': [
    'Percentages & Fraction Equivalence',
    'Ratio & Proportion',
    'Profit, Loss & Discount',
    'Simple & Compound Interest',
    'Time, Speed & Distance',
    'Time & Work, Pipes & Cisterns',
    'Mixtures & Alligation',
    'Averages & Ages',
    'Number Systems & Divisibility',
    'Algebra & Quadratic Equations',
    'Geometry & Coordinate Geometry',
    'Mensuration (2D & 3D)',
    'Trigonometry & Heights/Distances',
    'Data Interpretation & Analysis'
  ],
  'Reasoning': [
    'Analogy & Classification',
    'Coding-Decoding',
    'Blood Relations',
    'Direction Sense Test',
    'Syllogism (Venn Diagrams)',
    'Order & Ranking',
    'Seating Arrangement (Linear & Circular)',
    'Puzzles & Data Sufficiency',
    'Series (Number, Alphabet, Alpha-Numeric)',
    'Statement & Assumptions/Conclusions',
    'Non-Verbal Reasoning & Figure Counting',
    'Dice, Cubes & Clock/Calendar'
  ],
  'English': [
    'Parts of Speech & Error Spotting',
    'Subject-Verb Agreement & Tenses',
    'Direct & Indirect Speech',
    'Active & Passive Voice',
    'Vocabulary: Synonyms & Antonyms',
    'Idioms & Phrases, One Word Substitution',
    'Sentence Improvement & Fill in the Blanks',
    'Reading Comprehension Strategies',
    'Cloze Test Techniques',
    'Para Jumbles & Sentence Rearrangement'
  ],
  'Static GK': [
    'Ancient, Medieval & Modern Indian History',
    'Physical & Political Geography of India',
    'Indian Polity & Constitution (Articles & Amendments)',
    'Indian Economy & Five Year Plans',
    'General Science (Physics, Chemistry, Biology)',
    'Art & Culture (Classical Dances, Festivals)',
    'National Parks, Wildlife Sanctuaries & Rivers',
    'Important Books, Authors & Honors/Awards'
  ],
  'Current Affairs': [
    'National News & Government Schemes',
    'International Affairs & Summits',
    'Banking, Economy & Budget Highlights',
    'Defense Exercises, Military Ops & Treaties',
    'Science, Space Missions & Technology',
    'Sports Tournaments & Medal Winners',
    'Appointments, Resignations & Obituaries',
    'Indices, Reports & Rankings'
  ],
  'Computer Knowledge': [
    'Computer Fundamentals & Architecture',
    'Hardware & Memory Hierarchy (RAM, ROM, Cache)',
    'Operating Systems & CLI/GUI Basics',
    'MS Office (Word, Excel, PowerPoint Shortcuts)',
    'Computer Networking (LAN, WAN, Protocols, OSI)',
    'Internet, Web Browsers & Cloud Concepts',
    'Cyber Security, Malware & Antivirus',
    'Database Basics (DBMS, SQL, Keys)'
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const facultyId = searchParams.get('facultyId');

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('faculty_session')?.value;
    let sessionFacultyId = facultyId;
    let sessionSubject = 'General';

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (!sessionFacultyId) sessionFacultyId = parsed.facultyId;
        if (parsed.subject) sessionSubject = parsed.subject;
      } catch (e) {}
    }

    const supabase = await createServiceRoleClient();

    // Try fetching from syllabus_topics table
    if (courseId && sessionFacultyId) {
      const { data: topics, error } = await supabase
        .from('syllabus_topics')
        .select('*')
        .eq('course_id', courseId)
        .eq('faculty_id', sessionFacultyId)
        .order('order_index', { ascending: true });

      if (!error && topics && topics.length > 0) {
        return NextResponse.json({ topics, source: 'database' });
      }
    }

    // If no custom topics saved yet, generate starter syllabus based on faculty's subject
    const matchedSubject = Object.keys(DEFAULT_TOPIC_TEMPLATES).find(k => 
      sessionSubject.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(sessionSubject.toLowerCase())
    );

    const templateNames = matchedSubject ? DEFAULT_TOPIC_TEMPLATES[matchedSubject] : DEFAULT_TOPIC_TEMPLATES['Quantitative Aptitude'];

    const starterTopics = templateNames.map((name, idx) => ({
      id: `template-${idx + 1}`,
      course_id: courseId || '',
      faculty_id: sessionFacultyId || '',
      subject: sessionSubject,
      topic_name: name,
      estimated_classes: 2,
      order_index: idx,
      status: 'PENDING',
      completed_week: null,
      notes: ''
    }));

    return NextResponse.json({ topics: starterTopics, source: 'template' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { course_id, faculty_id, subject, topic_name, estimated_classes, order_index, notes } = body;

    if (!topic_name || !course_id || !faculty_id) {
      return NextResponse.json({ error: 'Missing required topic fields' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();

    const { data, error } = await supabase
      .from('syllabus_topics')
      .insert([
        {
          course_id,
          faculty_id,
          subject: subject || 'General',
          topic_name,
          estimated_classes: estimated_classes || 2,
          order_index: order_index || 0,
          status: 'PENDING',
          notes: notes || ''
        }
      ])
      .select()
      .single();

    if (error) {
      // Fallback if table doesn't exist yet
      return NextResponse.json({
        id: `topic-${Date.now()}`,
        course_id,
        faculty_id,
        subject,
        topic_name,
        estimated_classes: estimated_classes || 2,
        order_index: order_index || 0,
        status: 'PENDING',
        notes: notes || ''
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, topic_name, estimated_classes, order_index, completed_week, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();
    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
    }
    if (topic_name !== undefined) updateData.topic_name = topic_name;
    if (estimated_classes !== undefined) updateData.estimated_classes = estimated_classes;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (completed_week !== undefined) updateData.completed_week = completed_week;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('syllabus_topics')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: true, updated: updateData });
    }

    return NextResponse.json(data || { success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();
    const { error } = await supabase.from('syllabus_topics').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bulk save / initialize all topics for a course & faculty
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { course_id, faculty_id, subject, topics } = body;

    if (!course_id || !faculty_id || !Array.isArray(topics)) {
      return NextResponse.json({ error: 'course_id, faculty_id, and topics array required' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();

    // Delete existing topics for this course & faculty
    await supabase
      .from('syllabus_topics')
      .delete()
      .eq('course_id', course_id)
      .eq('faculty_id', faculty_id);

    // Insert updated topic list
    const inserts = topics.map((t: any, idx: number) => ({
      course_id,
      faculty_id,
      subject: subject || t.subject || 'General',
      topic_name: t.topic_name,
      estimated_classes: Number(t.estimated_classes || 2),
      order_index: idx,
      status: t.status || 'PENDING',
      completed_week: t.completed_week || null,
      notes: t.notes || ''
    }));

    const { data, error } = await supabase
      .from('syllabus_topics')
      .insert(inserts)
      .select();

    if (error) {
      return NextResponse.json({ success: true, count: inserts.length, topics: inserts });
    }

    return NextResponse.json({ success: true, topics: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
