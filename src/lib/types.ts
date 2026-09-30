export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'BRANCH_HEAD' | 'SALES_REP';
export type Branch = 'Jalandhar' | 'Ludhiana' | 'Jagraon';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'ENROLLED' | 'LOST';
export type LeadSource = 'Walk-in' | 'Social Media' | 'Phone Call' | 'Referral' | 'Website' | 'Other';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'MISSED';

export interface AdminPermissions {
  user_management?: boolean;
  faculty_settings?: boolean;
  courses?: boolean;
  sales_pipeline?: boolean;
  academics?: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  branch: Branch | null;
  permissions?: AdminPermissions | null;
  raw_password?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  subject: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  course_name: string;
  batch_name: string | null;
  start_date: string;
  target_end_date: string;
  total_weeks: number;
  description: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  course_subjects?: CourseSubject[];
}

export interface CourseSubject {
  id: string;
  course_id: string;
  faculty_id: string;
  subject: string;
  faculty_roster?: FacultyMember;
}

export interface Lead {
  id: string;
  branch: Branch | string;
  student_name: string;
  phone: string;
  email?: string | null;
  course_id?: string | null;
  lead_source?: LeadSource | string | null;
  source?: string;
  status: LeadStatus | string;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  scheduled_date: string;
  scheduled_time?: string | null;
  notes: string | null;
  status: FollowUpStatus | string;
  logged_by?: string | null;
  logged_by_name?: string | null;
  completed_at?: string | null;
  created_at: string;
  leads?: {
    student_name: string;
    phone: string;
    branch: string;
  };
}

export interface LeadActivityLog {
  id: string;
  lead_id: string;
  performed_by?: string | null;
  performed_by_name: string;
  performed_by_role: string;
  action_type: string;
  action_details?: string | null;
  created_at: string;
}

export interface WeeklyLog {
  id: string;
  course_id: string;
  faculty_id: string;
  faculty_name: string;
  subject: string;
  week_no: number;
  week_start_date: string;
  week_end_date: string;
  topics_covered: string | null;
  classes_planned: number | null;
  classes_taken: number | null;
  completed_pct: number | null;
  next_week_plan: string | null;
  remarks: string | null;
  updated_by_name: string;
  updated_at: string;
}

export interface LogAuditHistory {
  id: string;
  log_id: string;
  updated_by_name: string;
  updated_by_faculty_id?: string | null;
  previous_completed_pct: number | null;
  new_completed_pct: number | null;
  previous_classes_taken: number | null;
  new_classes_taken: number | null;
  topics_covered: string | null;
  action: string;
  created_at: string;
}

export interface InstituteSettings {
  id: string;
  institute_name: string;
  faculty_passcode: string;
  updated_at: string;
}

export interface FacultySession {
  facultyId: string;
  facultyName: string;
  subject: string;
  isAuthenticated: true;
  role: 'FACULTY';
}

export interface StaffSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  branch: Branch | null;
  isAuthenticated: true;
}

export type AppSession = FacultySession | StaffSession;
