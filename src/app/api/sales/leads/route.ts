import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MOCK_LEADS = [
  // Jalandhar Leads
  {
    id: 'l-jal-1',
    branch: 'Jalandhar',
    student_name: 'Gurkirat Singh',
    phone: '98765-43210',
    email: 'gurkirat.s@gmail.com',
    course_id: 'c1',
    lead_source: 'Walk-in',
    status: 'ENROLLED',
    assigned_to_name: 'Rohit Sharma',
    notes: 'Enrolled for SSC CGL 2027 Morning Batch. First installment paid.',
    created_by_name: 'Harpreet Singh (Branch Head)',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'l-jal-2',
    branch: 'Jalandhar',
    student_name: 'Jasleen Kaur',
    phone: '98140-55667',
    email: 'jasleen.k@yahoo.com',
    course_id: 'c1',
    lead_source: 'Social Media',
    status: 'DEMO_SCHEDULED',
    assigned_to_name: 'Rohit Sharma',
    notes: 'Demo class booked for Quantitative Aptitude with Prof. Amit Kumar.',
    created_by_name: 'Rohit Sharma',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'l-jal-3',
    branch: 'Jalandhar',
    student_name: 'Manpreet Singh',
    phone: '94170-88990',
    email: 'manpreet.jal@gmail.com',
    course_id: 'c2',
    lead_source: 'Phone Call',
    status: 'CONTACTED',
    assigned_to_name: 'Rohit Sharma',
    notes: 'Interested in Punjab Police SI syllabus. Requested fee structure brochure.',
    created_by_name: 'Rohit Sharma',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'l-jal-4',
    branch: 'Jalandhar',
    student_name: 'Navjot Kaur',
    phone: '98720-11223',
    email: 'navjot99@gmail.com',
    course_id: 'c1',
    lead_source: 'Referral',
    status: 'NEW',
    assigned_to_name: 'Rohit Sharma',
    notes: 'Referred by alumni student. Wants to prepare for SSC CGL Tier 1.',
    created_by_name: 'Harpreet Singh (Branch Head)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Ludhiana Leads
  {
    id: 'l-ldh-1',
    branch: 'Ludhiana',
    student_name: 'Arshdeep Singh',
    phone: '98888-12345',
    email: 'arshdeep.ldh@gmail.com',
    course_id: 'c1',
    lead_source: 'Website',
    status: 'ENROLLED',
    assigned_to_name: 'Priya Verma',
    notes: 'Paid complete tuition for SSC CGL 2027.',
    created_by_name: 'Gurpreet Kaur (Branch Head)',
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'l-ldh-2',
    branch: 'Ludhiana',
    student_name: 'Simran Gill',
    phone: '97800-44556',
    email: 'simran.gill@gmail.com',
    course_id: 'c2',
    lead_source: 'Walk-in',
    status: 'CONTACTED',
    assigned_to_name: 'Priya Verma',
    notes: 'Came with parents. Discussed morning batch timings.',
    created_by_name: 'Priya Verma',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'l-ldh-3',
    branch: 'Ludhiana',
    student_name: 'Harjot Singh',
    phone: '98155-77889',
    email: 'harjot.s@yahoo.com',
    course_id: 'c1',
    lead_source: 'Social Media',
    status: 'DEMO_SCHEDULED',
    assigned_to_name: 'Priya Verma',
    notes: 'Demo scheduled for Saturday morning session.',
    created_by_name: 'Priya Verma',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Jagraon Leads
  {
    id: 'l-jag-1',
    branch: 'Jagraon',
    student_name: 'Baljinder Kaur',
    phone: '99144-66778',
    email: 'baljinder.k@gmail.com',
    course_id: 'c1',
    lead_source: 'Referral',
    status: 'ENROLLED',
    assigned_to_name: 'Simranjit Kaur',
    notes: 'Enrolled in SSC CGL 2027 batch.',
    created_by_name: 'Amandeep Singh (Branch Head)',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'l-jag-2',
    branch: 'Jagraon',
    student_name: 'Sukhman Singh',
    phone: '98555-22334',
    email: 'sukhman.jag@gmail.com',
    course_id: 'c2',
    lead_source: 'Walk-in',
    status: 'CONTACTED',
    assigned_to_name: 'Simranjit Kaur',
    notes: 'Preparing for Punjab PSSSB Clerk exam.',
    created_by_name: 'Simranjit Kaur',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'l-jag-3',
    branch: 'Jagraon',
    student_name: 'Amanjot Kaur',
    phone: '94633-99881',
    email: 'amanjot.k@gmail.com',
    course_id: 'c1',
    lead_source: 'Phone Call',
    status: 'NEW',
    assigned_to_name: 'Simranjit Kaur',
    notes: 'Inquired about weekend batches.',
    created_by_name: 'Amandeep Singh (Branch Head)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

    if (branch) {
      query = query.eq('branch', branch);
    }
    
    // Lead isolation: Sales reps only see their own leads
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.role === 'SALES_REP') {
        query = query.eq('assigned_to', user.id);
      }
    }
    
    if (status && status !== 'All' && status !== 'ALL') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`student_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
    
    // If no data but also no error, return empty array (not mock data) when user is authenticated
    if (!error && user) {
      return NextResponse.json(data || []);
    }
  } catch {
    // Fallback in preview mode
  }
  
  // Return filtered mock leads for preview (only when not authenticated)
  let results = MOCK_LEADS;
  if (branch) {
    results = results.filter((l) => l.branch.toLowerCase() === branch.toLowerCase());
  }
  if (status && status !== 'All' && status !== 'ALL') {
    results = results.filter((l) => l.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (l) => l.student_name.toLowerCase().includes(q) || l.phone.includes(q) || (l.email && l.email.toLowerCase().includes(q))
    );
  }

  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile for role check and name
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, branch')
        .eq('id', user.id)
        .maybeSingle();
      
      const leadData: any = {
        ...body,
        created_by: user.id,
        created_by_name: profile?.full_name || user.email,
      };
      
      // If sales rep creates a lead, auto-assign to themselves
      if (profile?.role === 'SALES_REP') {
        leadData.assigned_to = user.id;
        leadData.assigned_to_name = profile.full_name;
      }
      
      // Ensure branch is set from profile if not provided
      if (!leadData.branch && profile?.branch) {
        leadData.branch = profile.branch;
      }
      
      const { data: lead, error: leadError } = await supabase.from('leads').insert(leadData).select().single();
      
      if (!leadError && lead) {
        await supabase.from('lead_activity_log').insert({
          lead_id: lead.id,
          performed_by: user.id,
          performed_by_name: profile?.full_name || user.email || 'Unknown',
          performed_by_role: profile?.role || 'UNKNOWN',
          action_type: 'CREATED',
          action_details: `Lead created for ${lead.student_name}`,
        });
        return NextResponse.json(lead);
      }
      
      if (leadError) {
        console.error('Error creating lead:', leadError);
        return NextResponse.json({ error: leadError.message }, { status: 500 });
      }
    }
  } catch (err) {
    console.error('Error in POST /api/sales/leads:', err);
  }

  // Create preview lead
  const newLead = {
    id: `lead-${Date.now()}`,
    ...body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by_name: 'Current Staff'
  };
  return NextResponse.json(newLead);
}
