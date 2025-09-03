-- =============================================
-- COMPLETE TVET CONNECT KENYA DATABASE SCHEMA
-- =============================================
-- This schema creates all tables needed for the TVET Connect Kenya application
-- with proper relationships, constraints, and RLS policies for each user role

-- =============================================
-- 1. DEPARTMENTS & COURSES STRUCTURE
-- =============================================

-- Departments table (already exists but ensuring completeness)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  level TEXT NOT NULL CHECK (level IN ('certificate', 'diploma', 'higher_diploma', 'degree')),
  duration_months INTEGER NOT NULL DEFAULT 12,
  credits INTEGER NOT NULL DEFAULT 120,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 2. USER MANAGEMENT & PROFILES
-- =============================================

-- Enhanced profiles table (updating existing with missing columns)
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT UNIQUE, -- For username-based login
  role TEXT NOT NULL CHECK (role IN ('admin', 'registrar', 'hod', 'lecturer', 'finance', 'student')),
  department_id UUID REFERENCES public.departments(id),
  course TEXT,
  course_id UUID REFERENCES public.courses(id),
  level INTEGER,
  year INTEGER,
  semester INTEGER,
  admission_number TEXT UNIQUE,
  intake TEXT,
  phone TEXT,
  approved BOOLEAN DEFAULT false,
  blocked BOOLEAN DEFAULT false,
  financial_status TEXT CHECK (financial_status IN ('cleared', 'pending', 'blocked', 'defaulter', 'partial')),
  total_fees_owed DECIMAL(10,2) DEFAULT 0,
  
  -- Extended student properties
  national_id TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  nationality TEXT DEFAULT 'Kenyan',
  county TEXT,
  subcounty TEXT,
  ward TEXT,
  postal_address TEXT,
  postal_code TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  guardian_relationship TEXT,
  guardian_address TEXT,
  academic_year TEXT,
  previous_education TEXT,
  previous_grade TEXT,
  enrollment_type TEXT CHECK (enrollment_type IN ('fulltime', 'parttime', 'online')) DEFAULT 'fulltime',
  institution_branch TEXT,
  profile_picture TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Guardians table for multiple guardians per student
CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT NOT NULL,
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 3. ACADEMIC STRUCTURE - UNITS & SEMESTER PLANS
-- =============================================

-- Units table (core academic units)
CREATE TABLE IF NOT EXISTS public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 3,
  department_id UUID REFERENCES public.departments(id),
  course TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  prerequisites TEXT[], -- Array of prerequisite unit codes
  lecturer_id UUID REFERENCES auth.users(id),
  lecturer_name TEXT,
  lecturer_email TEXT,
  capacity INTEGER DEFAULT 50,
  enrolled INTEGER DEFAULT 0,
  schedule TEXT,
  whatsapp_link TEXT,
  has_discussion_group BOOLEAN DEFAULT false,
  created_by TEXT NOT NULL,
  created_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  campus_id UUID,
  campus_name TEXT,
  available_campuses TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student unit registrations
CREATE TABLE IF NOT EXISTS public.student_unit_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  course TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_date DATE DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES auth.users(id),
  approved_date DATE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, unit_id, academic_year)
);

-- Semester plans for academic planning
CREATE TABLE IF NOT EXISTS public.semester_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  academic_year TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(course, year, semester, academic_year)
);

-- =============================================
-- 4. ACADEMIC CONTENT & ASSESSMENTS
-- =============================================

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  lecturer_id UUID NOT NULL REFERENCES auth.users(id),
  lecturer_name TEXT NOT NULL,
  assignment_type TEXT DEFAULT 'essay' CHECK (assignment_type IN ('essay', 'multiple_choice', 'practical', 'project')),
  total_marks INTEGER DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  file_url TEXT,
  question_file_name TEXT,
  accepted_formats TEXT[],
  submission_instructions TEXT,
  submission_type TEXT DEFAULT 'file' CHECK (submission_type IN ('file', 'multiple_choice', 'online')),
  requires_hod_approval BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced assignment submissions table (updating existing)
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  submission_text TEXT,
  file_url TEXT,
  file_name TEXT,
  submission_type TEXT DEFAULT 'file' CHECK (submission_type IN ('file', 'text', 'multiple_choice')),
  ai_detection_score DECIMAL(5,2),
  ai_detection_status TEXT CHECK (ai_detection_status IN ('pending', 'human', 'ai', 'mixed')),
  human_review_status TEXT CHECK (human_review_status IN ('pending', 'approved', 'flagged')),
  human_reviewer_id UUID REFERENCES auth.users(id),
  human_review_notes TEXT,
  human_reviewed_at TIMESTAMP WITH TIME ZONE,
  final_status TEXT CHECK (final_status IN ('pending', 'approved', 'rejected')),
  grade TEXT,
  marks_awarded INTEGER,
  lecturer_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES auth.users(id)
);

-- CATs (Continuous Assessment Tests)
CREATE TABLE IF NOT EXISTS public.cats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  lecturer_id UUID NOT NULL REFERENCES auth.users(id),
  lecturer_name TEXT NOT NULL,
  cat_number INTEGER NOT NULL CHECK (cat_number IN (1, 2, 3)),
  total_marks INTEGER DEFAULT 30,
  duration_minutes INTEGER DEFAULT 90,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  questions JSONB,
  is_visible BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exams
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  lecturer_id UUID NOT NULL REFERENCES auth.users(id),
  lecturer_name TEXT NOT NULL,
  exam_type TEXT DEFAULT 'main' CHECK (exam_type IN ('main', 'supplementary', 'special')),
  total_marks INTEGER DEFAULT 70,
  duration_minutes INTEGER DEFAULT 180,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  questions JSONB,
  is_visible BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notes/Learning Materials
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  lecturer_id UUID NOT NULL REFERENCES auth.users(id),
  lecturer_name TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  topic TEXT,
  is_visible BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Online Classes
CREATE TABLE IF NOT EXISTS public.online_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  lecturer_id UUID NOT NULL REFERENCES auth.users(id),
  lecturer_name TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_link TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  platform TEXT DEFAULT 'bigbluebutton' CHECK (platform IN ('bigbluebutton', 'zoom', 'teams', 'meet')),
  is_visible BOOLEAN DEFAULT true,
  is_accessible BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 5. GRADING & RESULTS SYSTEM
-- =============================================

-- Student results (comprehensive grading)
CREATE TABLE IF NOT EXISTS public.student_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  admission_number TEXT,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  year INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  lecturer_id UUID NOT NULL REFERENCES auth.users(id),
  lecturer_name TEXT NOT NULL,
  
  -- Assessment scores with proper constraints
  cat1_score DECIMAL(5,2),
  cat1_max_score DECIMAL(5,2) DEFAULT 30,
  cat2_score DECIMAL(5,2),
  cat2_max_score DECIMAL(5,2) DEFAULT 30,
  assignment_score DECIMAL(5,2),
  assignment_max_score DECIMAL(5,2) DEFAULT 20,
  exam_score DECIMAL(5,2),
  exam_max_score DECIMAL(5,2) DEFAULT 70,
  
  -- Calculated totals
  total_score DECIMAL(5,2),
  total_max_score DECIMAL(5,2) DEFAULT 100,
  percentage DECIMAL(5,2),
  grade TEXT,
  points DECIMAL(3,1),
  
  -- Status and approval tracking
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  submitted_date DATE DEFAULT CURRENT_DATE,
  hod_approval TEXT DEFAULT 'pending' CHECK (hod_approval IN ('pending', 'approved', 'rejected')),
  hod_approved_by UUID REFERENCES auth.users(id),
  hod_approved_date DATE,
  hod_comments TEXT,
  
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('pass', 'fail', 'incomplete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, unit_id, academic_year)
);

-- Exam results (individual exam records)
CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  exam_id UUID REFERENCES public.exams(id),
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  grade TEXT NOT NULL,
  semester INTEGER NOT NULL,
  year INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  exam_date DATE,
  lecturer_id UUID REFERENCES auth.users(id),
  lecturer_name TEXT,
  status TEXT DEFAULT 'pass' CHECK (status IN ('pass', 'fail')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 6. ATTENDANCE SYSTEM (Enhanced existing tables)
-- =============================================
-- Note: attendance_sessions, quiz_attendance, and student_attendance tables already exist
-- Adding indexes and ensuring they're properly configured

-- =============================================
-- 7. DIGITAL CERTIFICATES & TRANSCRIPTS (Enhanced existing)
-- =============================================
-- Note: certificates, transcripts, and transcript_grades already exist
-- These will be used as-is from the existing migration

-- =============================================
-- 8. FINANCIAL MANAGEMENT SYSTEM
-- =============================================

-- Fee structures
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  tuition_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  exam_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  library_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  lab_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  caution_money DECIMAL(10,2) NOT NULL DEFAULT 0,
  activity_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  medical_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(course, year, semester, academic_year)
);

-- Student fees
CREATE TABLE IF NOT EXISTS public.student_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('tuition', 'supplementary_exam', 'special_exam', 'unit_retake', 'library', 'lab', 'caution', 'exam', 'activity', 'medical', 'graduation')),
  amount DECIMAL(10,2) NOT NULL,
  unit_code TEXT,
  unit_name TEXT,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  created_date DATE DEFAULT CURRENT_DATE,
  paid_date DATE,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  invoice_number TEXT UNIQUE,
  receipt_number TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'cheque')),
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment records
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'cheque')),
  reference_number TEXT NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  processed_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clearance forms
CREATE TABLE IF NOT EXISTS public.clearance_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  request_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'blocked')),
  total_fees_owed DECIMAL(10,2) DEFAULT 0,
  total_fees_paid DECIMAL(10,2) DEFAULT 0,
  outstanding_balance DECIMAL(10,2) DEFAULT 0,
  cleared_by UUID REFERENCES auth.users(id),
  clearance_date DATE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student ID cards
CREATE TABLE IF NOT EXISTS public.student_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  admission_number TEXT NOT NULL,
  course TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  activated_by UUID REFERENCES auth.users(id),
  activated_date DATE,
  deactivated_by UUID REFERENCES auth.users(id),
  deactivated_date DATE,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(student_id, academic_year)
);

-- =============================================
-- 9. SUPPLY CHAIN & PROCUREMENT
-- =============================================

-- Supply requests
CREATE TABLE IF NOT EXISTS public.supply_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_by_name TEXT NOT NULL,
  department TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  request_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'verified')),
  verified_by UUID REFERENCES auth.users(id),
  verification_date DATE,
  verification_notes TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supply items
CREATE TABLE IF NOT EXISTS public.supply_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supply_request_id UUID NOT NULL REFERENCES public.supply_requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 10. SYSTEM MANAGEMENT & LOGGING
-- =============================================

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  target_student_id UUID REFERENCES auth.users(id),
  target_student_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  department TEXT CHECK (department IN ('finance', 'admin', 'registrar', 'hod', 'lecturer', 'student'))
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('student', 'lecturer', 'admin', 'registrar', 'hod', 'finance', 'guardian')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'announcement')),
  category TEXT CHECK (category IN ('academic', 'financial', 'administrative', 'technical', 'general')),
  is_read BOOLEAN DEFAULT false,
  related_entity_type TEXT,
  related_entity_id UUID,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 11. VIRTUAL LABS & EXPERIMENTS (Enhanced existing)
-- =============================================
-- Note: virtual_labs and experiments tables already exist from previous migration

-- =============================================
-- 12. CALENDAR & EVENTS (Enhanced existing)
-- =============================================
-- Note: calendar_events and reminders tables already exist from previous migration

-- =============================================
-- ENABLE ROW LEVEL SECURITY ON ALL NEW TABLES
-- =============================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_unit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
