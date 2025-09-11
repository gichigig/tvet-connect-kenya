-- Final batch: Scheduling, Communication, Admissions, Planning, Facilities, Reports, and System Management

-- 10. Scheduling and Attendance
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID,
  lecturer_id UUID REFERENCES public.lecturers(id),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT,
  class_type TEXT CHECK (class_type IN ('lecture', 'tutorial', 'practical', 'lab')),
  semester_id UUID REFERENCES public.semesters(id),
  max_students INTEGER,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_schedule_id UUID REFERENCES public.class_schedules(id),
  unit_id UUID,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  recorded_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, class_schedule_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS public.lecturer_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'sick_leave', 'annual_leave')),
  recorded_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(lecturer_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS public.makeup_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_class_schedule_id UUID REFERENCES public.class_schedules(id),
  unit_id UUID,
  lecturer_id UUID REFERENCES public.lecturers(id),
  makeup_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT,
  reason TEXT NOT NULL,
  scheduled_by UUID NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('registration', 'exam', 'holiday', 'graduation', 'orientation', 'semester_start', 'semester_end')),
  start_date DATE NOT NULL,
  end_date DATE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  is_public BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Communication System
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT CHECK (announcement_type IN ('general', 'academic', 'administrative', 'emergency', 'event')),
  target_audience TEXT[] NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  is_published BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('info', 'warning', 'success', 'error', 'reminder')),
  category TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  action_text TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'private' CHECK (message_type IN ('private', 'group', 'broadcast')),
  parent_message_id UUID REFERENCES public.messages(id),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  sender_email TEXT,
  subject TEXT,
  template_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  cost DECIMAL(5,2),
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Admissions System
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT NOT NULL UNIQUE,
  course_id UUID,
  intake_period_id UUID REFERENCES public.intake_periods(id),
  applicant_first_name TEXT NOT NULL,
  applicant_last_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  nationality TEXT,
  previous_education JSONB,
  application_status TEXT DEFAULT 'submitted' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted')),
  application_date DATE NOT NULL,
  reviewed_by UUID,
  review_date DATE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admission_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('academic', 'document', 'test_score', 'interview')),
  requirement_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  minimum_score DECIMAL(5,2),
  weight_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID,
  verification_date DATE,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admission_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('accept', 'reject', 'waitlist', 'conditional')),
  decision_date DATE NOT NULL,
  decided_by UUID NOT NULL,
  conditions TEXT,
  offer_expiry_date DATE,
  response_deadline DATE,
  applicant_response TEXT CHECK (applicant_response IN ('accept', 'decline')),
  response_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.waiting_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  course_id UUID,
  intake_period_id UUID REFERENCES public.intake_periods(id),
  position INTEGER NOT NULL,
  added_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'offered', 'expired')),
  offer_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. Academic Planning System
CREATE TABLE IF NOT EXISTS public.semester_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  planned_units JSONB NOT NULL,
  total_credits INTEGER,
  advisor_id UUID,
  advisor_approval BOOLEAN DEFAULT false,
  approval_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'registered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, semester_id)
);

CREATE TABLE IF NOT EXISTS public.academic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  cumulative_gpa DECIMAL(3,2),
  total_credits_earned INTEGER DEFAULT 0,
  total_credits_attempted INTEGER DEFAULT 0,
  academic_standing TEXT CHECK (academic_standing IN ('good_standing', 'probation', 'suspension', 'dismissal')),
  progress_percentage DECIMAL(5,2),
  expected_graduation_date DATE,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  calculated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.graduation_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('credit_hours', 'core_units', 'elective_units', 'gpa', 'project', 'internship')),
  requirement_name TEXT NOT NULL,
  minimum_value DECIMAL(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  source_institution TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  unit_code TEXT,
  credits INTEGER NOT NULL,
  grade_received TEXT,
  equivalent_unit_id UUID,
  transfer_status TEXT DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'approved', 'rejected')),
  evaluated_by UUID,
  evaluation_date DATE,
  evaluation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  standing TEXT NOT NULL CHECK (standing IN ('excellent', 'good_standing', 'satisfactory', 'probation', 'suspension')),
  gpa DECIMAL(3,2),
  reason TEXT,
  effective_date DATE NOT NULL,
  review_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'superseded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Facilities Management
CREATE TABLE IF NOT EXISTS public.library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT,
  publication_year INTEGER,
  category TEXT,
  subject_area TEXT,
  location TEXT,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'lost', 'damaged')),
  acquisition_date DATE,
  price DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.book_borrowings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.library_books(id),
  borrowed_date DATE NOT NULL,
  due_date DATE NOT NULL,
  returned_date DATE,
  status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')),
  renewed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.library_fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrowing_id UUID NOT NULL REFERENCES public.book_borrowings(id),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fine_type TEXT NOT NULL CHECK (fine_type IN ('overdue', 'lost_book', 'damage')),
  amount DECIMAL(8,2) NOT NULL,
  days_overdue INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived')),
  paid_date DATE,
  waived_by UUID,
  waived_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.digital_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('ebook', 'journal', 'database', 'video', 'software')),
  provider TEXT,
  access_url TEXT,
  description TEXT,
  subject_areas TEXT[],
  access_level TEXT CHECK (access_level IN ('public', 'student', 'staff', 'premium')),
  subscription_start DATE,
  subscription_end DATE,
  max_concurrent_users INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15. Accommodation System
CREATE TABLE IF NOT EXISTS public.hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gender_restriction TEXT CHECK (gender_restriction IN ('male', 'female', 'mixed')),
  total_capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  warden_id UUID,
  location TEXT,
  facilities TEXT[],
  rules_regulations TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  room_type TEXT CHECK (room_type IN ('single', 'double', 'triple', 'quad')),
  max_occupancy INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  floor_number INTEGER,
  facilities TEXT[],
  monthly_fee DECIMAL(8,2),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(hostel_id, room_number)
);

CREATE TABLE IF NOT EXISTS public.room_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  academic_year_id UUID REFERENCES public.academic_years(id),
  allocation_date DATE NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  status TEXT DEFAULT 'allocated' CHECK (status IN ('allocated', 'checked_in', 'checked_out', 'cancelled')),
  allocated_by UUID,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hostel_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_allocation_id UUID NOT NULL REFERENCES public.room_allocations(id),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  amount DECIMAL(8,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_amount DECIMAL(8,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 16. Transport System
CREATE TABLE IF NOT EXISTS public.transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  route_code TEXT NOT NULL UNIQUE,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  stops JSONB,
  distance_km DECIMAL(5,2),
  estimated_duration_minutes INTEGER,
  vehicle_capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.transport_routes(id),
  booking_date DATE NOT NULL,
  journey_type TEXT CHECK (journey_type IN ('morning', 'evening', 'both')),
  academic_year_id UUID REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transport_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.transport_bookings(id),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  monthly_fee DECIMAL(8,2) NOT NULL,
  months_covered INTEGER DEFAULT 1,
  total_amount DECIMAL(8,2) NOT NULL,
  paid_amount DECIMAL(8,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 17. System Management
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  category TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  file_size_bytes BIGINT,
  file_location TEXT,
  error_message TEXT,
  initiated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_level TEXT NOT NULL CHECK (error_level IN ('info', 'warning', 'error', 'critical')),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  request_url TEXT,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL,
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  status TEXT CHECK (status IN ('active', 'expired', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 18. Reports and Analytics
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  description TEXT,
  query_template TEXT,
  parameters JSONB,
  output_format TEXT CHECK (output_format IN ('pdf', 'excel', 'csv', 'json')),
  is_scheduled BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  recipients TEXT[] NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  widget_type TEXT NOT NULL,
  widget_title TEXT NOT NULL,
  configuration JSONB NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  dimensions JSONB,
  date_recorded DATE NOT NULL,
  hour_recorded INTEGER CHECK (hour_recorded >= 0 AND hour_recorded <= 23),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(metric_name, date_recorded, hour_recorded)
);

-- Enable RLS for all new tables
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturer_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.makeup_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduation_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
-- Admin access to everything
CREATE POLICY "admin_all_access" ON public.class_schedules FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.attendance_records FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.lecturer_attendance FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.makeup_classes FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.announcements FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.applications FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.admission_requirements FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.application_documents FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.admission_decisions FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.waiting_lists FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.semester_plans FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.academic_progress FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.graduation_requirements FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.credit_transfers FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.academic_standings FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.library_books FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.book_borrowings FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.library_fines FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.digital_resources FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.hostels FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.rooms FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.room_allocations FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.hostel_fees FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.transport_routes FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.transport_bookings FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.transport_fees FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.system_settings FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.audit_logs FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.backup_logs FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.error_logs FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.session_logs FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.reports FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.report_schedules FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.analytics_data FOR ALL TO authenticated USING (is_admin_user(auth.uid()));

-- Public read access for appropriate tables
CREATE POLICY "authenticated_users_read" ON public.academic_calendar FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "authenticated_users_read" ON public.digital_resources FOR SELECT TO authenticated USING (access_level IN ('public', 'student'));

-- User-specific access
CREATE POLICY "users_own_notifications" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_own_messages" ON public.messages FOR ALL TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "users_own_dashboard" ON public.dashboard_widgets FOR ALL TO authenticated USING (user_id = auth.uid());

-- Student-specific access
CREATE POLICY "students_own_semester_plans" ON public.semester_plans FOR ALL TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "students_own_progress" ON public.academic_progress FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "students_own_borrowings" ON public.book_borrowings FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- Apply triggers for updated_at timestamps where applicable
CREATE TRIGGER update_class_schedules_updated_at BEFORE UPDATE ON public.class_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecturer_attendance_updated_at BEFORE UPDATE ON public.lecturer_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_makeup_classes_updated_at BEFORE UPDATE ON public.makeup_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_calendar_updated_at BEFORE UPDATE ON public.academic_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admission_requirements_updated_at BEFORE UPDATE ON public.admission_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admission_decisions_updated_at BEFORE UPDATE ON public.admission_decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waiting_lists_updated_at BEFORE UPDATE ON public.waiting_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_semester_plans_updated_at BEFORE UPDATE ON public.semester_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_progress_updated_at BEFORE UPDATE ON public.academic_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_graduation_requirements_updated_at BEFORE UPDATE ON public.graduation_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_transfers_updated_at BEFORE UPDATE ON public.credit_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_standings_updated_at BEFORE UPDATE ON public.academic_standings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON public.library_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_borrowings_updated_at BEFORE UPDATE ON public.book_borrowings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_library_fines_updated_at BEFORE UPDATE ON public.library_fines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digital_resources_updated_at BEFORE UPDATE ON public.digital_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hostels_updated_at BEFORE UPDATE ON public.hostels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_allocations_updated_at BEFORE UPDATE ON public.room_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hostel_fees_updated_at BEFORE UPDATE ON public.hostel_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_routes_updated_at BEFORE UPDATE ON public.transport_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_bookings_updated_at BEFORE UPDATE ON public.transport_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_fees_updated_at BEFORE UPDATE ON public.transport_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON public.report_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON public.dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();