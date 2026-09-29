import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { course_name, batch_name, start_date, target_end_date, weeks, description, status, subjects } = body;
    
    const supabase = await createServiceRoleClient();
    
    // Update course details
    const updateData: any = {};
    if (course_name !== undefined) updateData.course_name = course_name;
    if (batch_name !== undefined) updateData.batch_name = batch_name;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (target_end_date !== undefined) updateData.target_end_date = target_end_date;
    if (weeks !== undefined) updateData.weeks = weeks;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    
    if (Object.keys(updateData).length > 0) {
      const { error: courseError } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id);
        
      if (courseError) throw courseError;
    }

    // Update subjects if provided (simplified: delete all and recreate)
    if (subjects !== undefined) {
      // Delete existing
      await supabase.from('course_subjects').delete().eq('course_id', id);
      
      // Insert new
      if (subjects.length > 0) {
        const subjectInserts = subjects.map((sub: any) => ({
          course_id: id,
          faculty_id: sub.faculty_id,
          subject: sub.subject_name || sub.subject
        }));
        
        const { error: subjectError } = await supabase
          .from('course_subjects')
          .insert(subjectInserts);
          
        if (subjectError) throw subjectError;
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceRoleClient();
    
    // Cascade delete is usually handled in DB schema, but we can do it explicitly if needed
    await supabase.from('course_subjects').delete().eq('course_id', id);
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
