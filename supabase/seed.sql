-- ==========================================
-- SUPABASE SEED DATA - Academic ERP & Branch CRM
-- ==========================================

-- Note on Auto-creation of Superadmin:
-- The Superadmin profile is intended to be auto-created on the first Google OAuth login
-- using a Supabase Edge Function or Auth Hook, based on the email domain or a predefined admin email list.

-- Note on Branches:
-- The application logic expects three active branches: 
-- 1. Jalandhar
-- 2. Ludhiana
-- 3. Jagraon

-- 1. Insert Default Institute Settings
INSERT INTO institute_settings (id, institute_name, faculty_passcode)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'DSP & DSC',
    'faculty123' -- Note: The application should hash this in a real scenario
)
ON CONFLICT DO NOTHING;

-- 2. Insert Faculty Roster Entries
INSERT INTO faculty_roster (id, name, subject, is_active)
VALUES 
    ('aa000000-0000-0000-0000-000000000001', 'Amit Kumar', 'Quantitative Aptitude', true),
    ('aa000000-0000-0000-0000-000000000002', 'Sneha Sharma', 'Reasoning', true),
    ('aa000000-0000-0000-0000-000000000003', 'Rohan Verma', 'English', true),
    ('aa000000-0000-0000-0000-000000000004', 'Neha Gupta', 'Static GK', true),
    ('aa000000-0000-0000-0000-000000000005', 'Vikram Singh', 'Current Affairs', true),
    ('aa000000-0000-0000-0000-000000000006', 'Priya Patel', 'Computer Knowledge', true)
ON CONFLICT DO NOTHING;

-- 3. Insert a Sample Course
INSERT INTO courses (id, course_name, batch_name, start_date, target_end_date, total_weeks, description)
VALUES (
    'bb000000-0000-0000-0000-000000000001',
    'SSC CGL 2027',
    'Morning Batch',
    '2026-09-28',
    '2027-03-28',
    26,
    'Comprehensive preparation for SSC CGL 2027 including Tier 1 and Tier 2 subjects.'
)
ON CONFLICT DO NOTHING;

-- 4. Link Subjects to the Sample Course via course_subjects
INSERT INTO course_subjects (id, course_id, faculty_id, subject)
VALUES 
    ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Quantitative Aptitude'),
    ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'Reasoning'),
    ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'English'),
    ('cc000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 'Static GK'),
    ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', 'Current Affairs'),
    ('cc000000-0000-0000-0000-000000000006', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000006', 'Computer Knowledge')
ON CONFLICT DO NOTHING;
