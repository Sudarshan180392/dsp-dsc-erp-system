-- ==========================================
-- SUPABASE SCHEMA - Academic ERP & Branch CRM
-- ==========================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 1. profiles
-- ==========================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SUPERADMIN', 'ADMIN', 'BRANCH_HEAD', 'SALES_REP')),
    branch TEXT CHECK (branch IN ('Jalandhar', 'Ludhiana', 'Jagraon')),
    permissions JSONB DEFAULT '{"user_management": false, "faculty_settings": true, "courses": true, "sales_pipeline": true, "academics": true}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 2. institute_settings
-- ==========================================
CREATE TABLE institute_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_name TEXT DEFAULT 'DSP & DSC',
    faculty_passcode TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_institute_settings_updated_at
    BEFORE UPDATE ON institute_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. faculty_roster
-- ==========================================
CREATE TABLE faculty_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. courses
-- ==========================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_name TEXT NOT NULL,
    batch_name TEXT,
    start_date DATE NOT NULL,
    target_end_date DATE NOT NULL,
    total_weeks INTEGER DEFAULT 26,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. course_subjects
-- ==========================================
CREATE TABLE course_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty_roster(id) ON DELETE CASCADE,
    subject TEXT NOT NULL
);

-- ==========================================
-- 6. leads
-- ==========================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch TEXT NOT NULL CHECK (branch IN ('Jalandhar', 'Ludhiana', 'Jagraon')),
    student_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    lead_source TEXT CHECK (lead_source IN ('Walk-in', 'Social Media', 'Phone Call', 'Referral', 'Website', 'Other')),
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'ENROLLED', 'LOST')),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. follow_ups
-- ==========================================
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    notes TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'MISSED')),
    logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    logged_by_name TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 8. lead_activity_log
-- ==========================================
CREATE TABLE lead_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    performed_by_name TEXT NOT NULL,
    performed_by_role TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 9. weekly_logs
-- ==========================================
CREATE TABLE weekly_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty_roster(id) ON DELETE SET NULL,
    faculty_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    week_no INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    topics_covered TEXT,
    classes_planned INTEGER,
    classes_taken INTEGER,
    completed_pct NUMERIC(5,2) CHECK (completed_pct >= 0 AND completed_pct <= 100),
    next_week_plan TEXT,
    remarks TEXT,
    updated_by_name TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (course_id, faculty_id, week_no)
);

CREATE TRIGGER update_weekly_logs_updated_at
    BEFORE UPDATE ON weekly_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 10. log_audit_history
-- ==========================================
CREATE TABLE log_audit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES weekly_logs(id) ON DELETE CASCADE,
    updated_by_name TEXT NOT NULL,
    updated_by_faculty_id UUID REFERENCES faculty_roster(id) ON DELETE SET NULL,
    previous_completed_pct NUMERIC(5,2),
    new_completed_pct NUMERIC(5,2),
    previous_classes_taken INTEGER,
    new_classes_taken INTEGER,
    topics_covered TEXT,
    action TEXT DEFAULT 'UPDATE',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_branch ON profiles(branch);
CREATE INDEX idx_leads_branch ON leads(branch);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_course_id ON leads(course_id);
CREATE INDEX idx_follow_ups_lead_id ON follow_ups(lead_id);
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
CREATE INDEX idx_lead_activity_log_lead_id ON lead_activity_log(lead_id);
CREATE INDEX idx_weekly_logs_course_id ON weekly_logs(course_id);
CREATE INDEX idx_weekly_logs_faculty_id ON weekly_logs(faculty_id);
CREATE INDEX idx_weekly_logs_week_no ON weekly_logs(week_no);

-- ==========================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_audit_history ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- PROFILES RLS
-- ------------------------------------------
CREATE POLICY "Users can read all profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------
-- LEADS RLS
-- ------------------------------------------
CREATE POLICY "superadmin_all_leads" ON leads 
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "branch_head_leads" ON leads 
    FOR ALL USING (
        branch = (SELECT branch FROM profiles WHERE id = auth.uid())
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'BRANCH_HEAD'
    );

CREATE POLICY "sales_rep_leads" ON leads 
    FOR ALL USING (
        branch = (SELECT branch FROM profiles WHERE id = auth.uid())
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'SALES_REP'
    );

-- ------------------------------------------
-- FOLLOW UPS RLS (Join through leads.branch)
-- ------------------------------------------
CREATE POLICY "superadmin_all_follow_ups" ON follow_ups
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "branch_head_follow_ups" ON follow_ups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = follow_ups.lead_id 
            AND leads.branch = (SELECT branch FROM profiles WHERE id = auth.uid())
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'BRANCH_HEAD'
    );

CREATE POLICY "sales_rep_follow_ups" ON follow_ups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = follow_ups.lead_id 
            AND leads.branch = (SELECT branch FROM profiles WHERE id = auth.uid())
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'SALES_REP'
    );

-- ------------------------------------------
-- LEAD ACTIVITY LOG RLS (Join through leads.branch)
-- ------------------------------------------
CREATE POLICY "superadmin_all_activity" ON lead_activity_log
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "branch_head_activity" ON lead_activity_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = lead_activity_log.lead_id 
            AND leads.branch = (SELECT branch FROM profiles WHERE id = auth.uid())
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'BRANCH_HEAD'
    );

CREATE POLICY "sales_rep_activity" ON lead_activity_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = lead_activity_log.lead_id 
            AND leads.branch = (SELECT branch FROM profiles WHERE id = auth.uid())
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'SALES_REP'
    );

-- ------------------------------------------
-- ACADEMIC TABLES RLS (courses, faculty_roster, course_subjects, weekly_logs, log_audit_history, institute_settings)
-- ------------------------------------------
-- Authenticated users can read (SELECT). Write operations are typically managed via Superadmin 
-- or Service Role bypassing RLS (e.g., faculty portal uses service role for auth bypass).

CREATE POLICY "authenticated_select_institute_settings" ON institute_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select_faculty_roster" ON faculty_roster
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select_courses" ON courses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select_course_subjects" ON course_subjects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select_weekly_logs" ON weekly_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_select_log_audit_history" ON log_audit_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- To allow superadmin full access explicitly to academic tables:
CREATE POLICY "superadmin_all_institute_settings" ON institute_settings
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "superadmin_all_faculty_roster" ON faculty_roster
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "superadmin_all_courses" ON courses
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "superadmin_all_course_subjects" ON course_subjects
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "superadmin_all_weekly_logs" ON weekly_logs
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

CREATE POLICY "superadmin_all_log_audit_history" ON log_audit_history
    FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'SUPERADMIN');

-- ==========================================
-- 11. syllabus_topics
-- ==========================================
CREATE TABLE IF NOT EXISTS syllabus_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty_roster(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    estimated_classes INTEGER DEFAULT 2,
    order_index INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    completed_week INTEGER,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE syllabus_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_syllabus_topics" ON syllabus_topics FOR ALL USING (true);

