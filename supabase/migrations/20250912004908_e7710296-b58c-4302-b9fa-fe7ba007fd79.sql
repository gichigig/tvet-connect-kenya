-- Create only the tables that don't exist yet

-- Campus branches table (if not exists)
CREATE TABLE IF NOT EXISTS public.campus_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  location TEXT,
  whatsapp_group_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student unit registrations with campus selection
CREATE TABLE IF NOT EXISTS public.student_unit_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  campus_branch_id UUID REFERENCES campus_branches(id),
  registration_status TEXT NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
  can_change_campus BOOLEAN NOT NULL DEFAULT true,
  change_deadline TIMESTAMP WITH TIME ZONE,
  joined_whatsapp BOOLEAN NOT NULL DEFAULT false,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, unit_id)
);

-- Document uploads table (assignments, notes, etc.)
CREATE TABLE IF NOT EXISTS public.document_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  document_type TEXT NOT NULL CHECK (document_type IN ('assignment', 'notes', 'lecture_material', 'exam', 'timetable', 'syllabus', 'announcement')),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  campus_branch_id UUID REFERENCES campus_branches(id),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  due_date TIMESTAMP WITH TIME ZONE,
  semester TEXT,
  academic_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Semester plans table
CREATE TABLE IF NOT EXISTS public.semester_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  campus_branch_id UUID REFERENCES campus_branches(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(unit_id, semester, academic_year, campus_branch_id)
);

-- Semester plan activities
CREATE TABLE IF NOT EXISTS public.semester_plan_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_plan_id UUID NOT NULL REFERENCES semester_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('lecture', 'assignment', 'exam', 'lab', 'online_class', 'review', 'break')),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  online_class_link TEXT,
  meeting_platform TEXT,
  meeting_id TEXT,
  passcode TEXT,
  required_materials TEXT[],
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  timetable_type TEXT NOT NULL CHECK (timetable_type IN ('weekly', 'exam', 'special')),
  file_url TEXT,
  campus_branch_id UUID REFERENCES campus_branches(id),
  semester TEXT,
  academic_year TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Special exam requests (supplementary, retakes)
CREATE TABLE IF NOT EXISTS public.special_exam_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  unit_id UUID NOT NULL REFERENCES units(id),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('supplementary', 'special', 'retake')),
  reason TEXT NOT NULL,
  hod_approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (hod_approval_status IN ('pending', 'approved', 'rejected')),
  finance_fee_added BOOLEAN NOT NULL DEFAULT false,
  fee_amount DECIMAL(10,2),
  requested_by UUID NOT NULL,
  approved_by UUID,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  exam_scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Guest course viewing (for public access)
CREATE TABLE IF NOT EXISTS public.guest_course_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  visitor_ip INET,
  visitor_user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Password reset requests
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  admission_number TEXT,
  user_found BOOLEAN NOT NULL DEFAULT false,
  registrar_notified BOOLEAN NOT NULL DEFAULT false,
  reset_link_sent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  request_ip INET,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on new tables
ALTER TABLE public.campus_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_unit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_exam_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_course_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campus branches
CREATE POLICY "Authenticated users can view campus branches" 
ON public.campus_branches FOR SELECT 
TO authenticated 
USING (is_active = true);

CREATE POLICY "Admin can manage campus branches" 
ON public.campus_branches FOR ALL 
TO authenticated 
USING (is_admin_user(auth.uid()));

-- RLS Policies for student unit registrations
CREATE POLICY "Students can manage their unit registrations" 
ON public.student_unit_registrations FOR ALL 
TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Lecturers can view registrations for their units" 
ON public.student_unit_registrations FOR SELECT 
TO authenticated 
USING (
  unit_id IN (
    SELECT unit_id FROM unit_assignments 
    WHERE lecturer_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin can view all registrations" 
ON public.student_unit_registrations FOR ALL 
TO authenticated 
USING (is_admin_user(auth.uid()));

-- RLS Policies for document uploads
CREATE POLICY "Lecturers can manage documents for their units" 
ON public.document_uploads FOR ALL 
TO authenticated 
USING (
  uploaded_by = auth.uid() OR 
  unit_id IN (
    SELECT unit_id FROM unit_assignments 
    WHERE lecturer_id = auth.uid() AND is_active = true
  ) OR
  is_admin_user(auth.uid())
);

CREATE POLICY "Students can view documents for their registered units" 
ON public.document_uploads FOR SELECT 
TO authenticated 
USING (
  is_visible = true AND (
    unit_id IN (
      SELECT unit_id FROM student_unit_registrations 
      WHERE student_id = auth.uid() AND registration_status = 'approved'
    ) OR
    campus_branch_id IN (
      SELECT campus_branch_id FROM student_unit_registrations 
      WHERE student_id = auth.uid() AND registration_status = 'approved'
    ) OR
    campus_branch_id IS NULL
  )
);

-- Storage policies for documents
CREATE POLICY "Authenticated users can upload documents" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view documents based on unit access" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'documents' AND (
    -- Uploaded by current user
    owner = auth.uid() OR 
    -- Admin access
    is_admin_user(auth.uid()) OR
    -- Student access to documents for their units
    EXISTS (
      SELECT 1 FROM document_uploads du 
      JOIN student_unit_registrations sur ON du.unit_id = sur.unit_id
      WHERE du.file_url LIKE '%' || name || '%' 
      AND sur.student_id = auth.uid() 
      AND sur.registration_status = 'approved'
      AND du.is_visible = true
    )
  )
);

-- Insert sample campus branches
INSERT INTO public.campus_branches (name, code, location, whatsapp_group_link) VALUES
('Main Campus', 'MAIN', 'City Center', 'https://chat.whatsapp.com/main-campus'),
('North Campus', 'NORTH', 'North District', 'https://chat.whatsapp.com/north-campus'),
('South Campus', 'SOUTH', 'South District', 'https://chat.whatsapp.com/south-campus'),
('East Campus', 'EAST', 'East District', 'https://chat.whatsapp.com/east-campus')
ON CONFLICT (code) DO NOTHING;