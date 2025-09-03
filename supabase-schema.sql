-- TVET Connect Kenya - Supabase Database Schema
-- Migration from Firebase Realtime Database and Firestore to Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'student', 
  'lecturer', 
  'admin', 
  'hod', 
  'registrar', 
  'finance'
);

CREATE TYPE file_category AS ENUM (
  'assignment',
  'material', 
  'submission',
  'notes',
  'document'
);

CREATE TYPE notification_type AS ENUM (
  'info',
  'warning', 
  'success',
  'error',
  'assignment',
  'attendance',
  'grade'
);

-- ================================
-- USERS AND AUTHENTICATION
-- ================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  
  -- Student-specific fields
  admission_number TEXT UNIQUE,
  course TEXT,
  year_of_study INTEGER,
  level INTEGER,
  
  -- Staff-specific fields
  employee_id TEXT UNIQUE,
  department TEXT,
  
  -- Status fields
  approved BOOLEAN DEFAULT FALSE,
  blocked BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  phone TEXT,
  profile_image_url TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================
-- ACADEMIC STRUCTURE
-- ================================

-- Departments
CREATE TABLE public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  head_of_department_id UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Academic levels/programs
CREATE TABLE public.academic_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  duration_years INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Units/Courses
CREATE TABLE public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  lecturer_id UUID REFERENCES public.users(id),
  level INTEGER,
  semester INTEGER,
  credit_hours INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Student unit registrations
CREATE TABLE public.student_unit_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.users(id) NOT NULL,
  unit_id UUID REFERENCES public.units(id) NOT NULL,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(student_id, unit_id, academic_year, semester)
);

-- ================================
-- ATTENDANCE SYSTEM
-- ================================

-- Attendance sessions (replaces Firebase attendance records)
CREATE TABLE public.attendance_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.units(id) NOT NULL,
  lecturer_id UUID REFERENCES public.users(id) NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME,
  location TEXT,
  total_students INTEGER DEFAULT 0,
  present_students INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Security fields
  fingerprint TEXT, -- For duplicate detection
  geolocation_lat DECIMAL(10, 8),
  geolocation_lng DECIMAL(11, 8),
  allowed_radius INTEGER DEFAULT 100, -- meters
  
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(unit_id, session_date, session_time)
);

-- Individual student attendance records
CREATE TABLE public.student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) NOT NULL,
  present BOOLEAN NOT NULL DEFAULT FALSE,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  marked_by UUID REFERENCES public.users(id), -- Who marked the attendance
  
  -- Additional tracking
  ip_address INET,
  user_agent TEXT,
  
  UNIQUE(attendance_session_id, student_id)
);

-- ================================
-- NOTIFICATIONS SYSTEM
-- ================================

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  
  -- Metadata
  data JSONB, -- Additional structured data
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================
-- FILE STORAGE SYSTEM
-- ================================

CREATE TABLE public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Storage information
  storage_provider TEXT DEFAULT 'r2', -- r2, s3, local
  storage_path TEXT NOT NULL, -- Path in storage provider
  storage_bucket TEXT,
  public_url TEXT,
  
  -- Classification
  category file_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Relationships
  uploaded_by UUID REFERENCES public.users(id) NOT NULL,
  entity_id UUID, -- Generic foreign key (assignment, unit, etc.)
  entity_type TEXT, -- What kind of entity (assignment, unit, etc.)
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  access_level TEXT DEFAULT 'unit' CHECK (access_level IN ('public', 'unit', 'class', 'private')),
  
  -- Metadata
  description TEXT,
  version INTEGER DEFAULT 1,
  checksum TEXT, -- For integrity verification
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- File access logs
CREATE TABLE public.file_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'upload', 'delete')),
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================
-- ASSIGNMENTS AND SUBMISSIONS
-- ================================

CREATE TABLE public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  unit_id UUID REFERENCES public.units(id) NOT NULL,
  lecturer_id UUID REFERENCES public.users(id) NOT NULL,
  
  -- Assignment details
  instructions TEXT,
  max_score DECIMAL(5,2) DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Settings
  allow_late_submission BOOLEAN DEFAULT FALSE,
  late_penalty_per_day DECIMAL(5,2) DEFAULT 0,
  max_attempts INTEGER DEFAULT 1,
  
  -- File requirements
  allowed_file_types TEXT[] DEFAULT '{}',
  max_file_size BIGINT DEFAULT 10485760, -- 10MB in bytes
  max_files INTEGER DEFAULT 5,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'graded')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Assignment submissions
CREATE TABLE public.assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) NOT NULL,
  
  -- Submission details
  content TEXT, -- Text submission
  submission_text TEXT, -- Additional text
  
  -- Grading
  score DECIMAL(5,2),
  grade TEXT,
  feedback TEXT,
  graded_by UUID REFERENCES public.users(id),
  graded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  attempt_number INTEGER DEFAULT 1,
  is_late BOOLEAN DEFAULT FALSE,
  late_penalty DECIMAL(5,2) DEFAULT 0,
  
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(assignment_id, student_id, attempt_number)
);

-- ================================
-- FINANCIAL MANAGEMENT
-- ================================

CREATE TABLE public.fee_structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_program_id UUID REFERENCES public.academic_programs(id),
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  level INTEGER NOT NULL,
  
  -- Fee breakdown
  tuition_fee DECIMAL(10,2) DEFAULT 0,
  exam_fee DECIMAL(10,2) DEFAULT 0,
  library_fee DECIMAL(10,2) DEFAULT 0,
  lab_fee DECIMAL(10,2) DEFAULT 0,
  activity_fee DECIMAL(10,2) DEFAULT 0,
  medical_fee DECIMAL(10,2) DEFAULT 0,
  caution_money DECIMAL(10,2) DEFAULT 0,
  other_fees JSONB DEFAULT '{}',
  
  total_fee DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(academic_program_id, academic_year, semester, level)
);

CREATE TABLE public.student_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.users(id) NOT NULL,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT UNIQUE NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  paid_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================
-- SYSTEM LOGS AND AUDIT
-- ================================

CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_admission_number ON public.users(admission_number);
CREATE INDEX idx_users_employee_id ON public.users(employee_id);
CREATE INDEX idx_users_email ON public.users(email);

-- Attendance indexes
CREATE INDEX idx_attendance_sessions_unit_date ON public.attendance_sessions(unit_id, session_date);
CREATE INDEX idx_attendance_sessions_lecturer ON public.attendance_sessions(lecturer_id);
CREATE INDEX idx_student_attendance_session ON public.student_attendance(attendance_session_id);
CREATE INDEX idx_student_attendance_student ON public.student_attendance(student_id);

-- Files indexes
CREATE INDEX idx_files_uploaded_by ON public.files(uploaded_by);
CREATE INDEX idx_files_category ON public.files(category);
CREATE INDEX idx_files_entity ON public.files(entity_type, entity_id);

-- Notifications indexes
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id, read_at) WHERE read_at IS NULL;

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_unit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ================================
-- RLS POLICIES
-- ================================

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'hod', 'registrar')
    )
  );

-- Lecturers can view students in their units
CREATE POLICY "Lecturers can view their students" ON public.users
  FOR SELECT USING (
    role = 'student' AND EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.student_unit_registrations sur ON u.id = sur.unit_id
      WHERE u.lecturer_id = auth.uid() AND sur.student_id = users.id
    )
  );

-- Attendance policies
CREATE POLICY "Lecturers can manage their attendance sessions" ON public.attendance_sessions
  FOR ALL USING (lecturer_id = auth.uid());

CREATE POLICY "Students can view their own attendance" ON public.student_attendance
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Lecturers can manage attendance for their sessions" ON public.student_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions 
      WHERE id = attendance_session_id AND lecturer_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their notification read status" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- Files policies
CREATE POLICY "Users can view public files" ON public.files
  FOR SELECT USING (is_public = true AND is_visible = true);

CREATE POLICY "Users can view their own files" ON public.files
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Students can view files from their units" ON public.files
  FOR SELECT USING (
    is_visible = true AND EXISTS (
      SELECT 1 FROM public.student_unit_registrations sur
      WHERE sur.student_id = auth.uid() AND sur.unit_id::text = entity_id::text AND entity_type = 'unit'
    )
  );

CREATE POLICY "Users can upload files" ON public.files
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- ================================
-- FUNCTIONS AND TRIGGERS
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to tables that need them
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_sessions_updated_at BEFORE UPDATE ON public.attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate attendance rate
CREATE OR REPLACE FUNCTION calculate_attendance_rate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.attendance_sessions 
  SET 
    present_students = (
      SELECT COUNT(*) 
      FROM public.student_attendance 
      WHERE attendance_session_id = NEW.attendance_session_id AND present = true
    ),
    total_students = (
      SELECT COUNT(*) 
      FROM public.student_attendance 
      WHERE attendance_session_id = NEW.attendance_session_id
    )
  WHERE id = NEW.attendance_session_id;
  
  UPDATE public.attendance_sessions 
  SET attendance_rate = CASE 
    WHEN total_students > 0 THEN (present_students::decimal / total_students::decimal) * 100 
    ELSE 0 
  END
  WHERE id = NEW.attendance_session_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update attendance rates
CREATE TRIGGER update_attendance_rate 
  AFTER INSERT OR UPDATE OR DELETE ON public.student_attendance
  FOR EACH ROW EXECUTE FUNCTION calculate_attendance_rate();

-- ================================
-- INITIAL DATA
-- ================================

-- Insert default admin user (will be created via migration script)
-- INSERT INTO public.users (id, email, first_name, last_name, role, approved) 
-- VALUES ('admin-uuid-here', 'admin@tvet-kenya.edu', 'System', 'Administrator', 'admin', true);

-- Insert some default departments
INSERT INTO public.departments (name, code, description) VALUES
  ('Computer Science', 'CS', 'Computer Science and Information Technology'),
  ('Engineering', 'ENG', 'Engineering and Technical Studies'),
  ('Business', 'BUS', 'Business and Management Studies'),
  ('Agriculture', 'AGR', 'Agriculture and Veterinary Sciences');

-- ================================
-- VIEWS FOR COMMON QUERIES
-- ================================

-- View for user profiles with role-specific information
CREATE VIEW user_profiles AS
SELECT 
  u.*,
  d.name as department_name,
  CASE 
    WHEN u.role = 'student' THEN u.admission_number
    ELSE u.employee_id
  END as identifier
FROM public.users u
LEFT JOIN public.departments d ON d.code = u.department;

-- View for attendance summary
CREATE VIEW attendance_summary AS
SELECT 
  u.code as unit_code,
  u.name as unit_name,
  COUNT(DISTINCT as_table.id) as total_sessions,
  AVG(as_table.attendance_rate) as average_attendance_rate,
  lecturer.first_name || ' ' || lecturer.last_name as lecturer_name
FROM public.units u
JOIN public.attendance_sessions as_table ON u.id = as_table.unit_id
JOIN public.users lecturer ON u.lecturer_id = lecturer.id
GROUP BY u.id, u.code, u.name, lecturer.first_name, lecturer.last_name;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.attendance_sessions IS 'Attendance sessions (replaces Firebase attendance records)';
COMMENT ON TABLE public.student_attendance IS 'Individual student attendance records';
COMMENT ON TABLE public.files IS 'File storage metadata for R2/S3 files';
COMMENT ON TABLE public.notifications IS 'System notifications';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
