-- Create comprehensive education management system tables

-- Campus branches table
CREATE TABLE public.campus_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  location TEXT,
  whatsapp_group_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unit assignments (HoD assigns units to lecturers)
CREATE TABLE public.unit_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  campus_branch_id UUID REFERENCES campus_branches(id),
  semester_id UUID,
  academic_year TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student unit registrations with campus selection
CREATE TABLE public.student_unit_registrations (
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
CREATE TABLE public.document_uploads (
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
CREATE TABLE public.semester_plans (
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
CREATE TABLE public.semester_plan_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_plan_id UUID NOT NULL REFERENCES semester_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
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
CREATE TABLE public.timetables (
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
CREATE TABLE public.special_exam_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  unit_id UUID NOT NULL REFERENCES units(id),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('supplementary', 'special', 'retake')),
  reason TEXT NOT NULL,
  hod_approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (hod_approval_status IN ('pending', 'approved', 'rejected')),
  finance_fee_added BOOLEAN NOT NULL DEFAULT false,
  fee_amount DECIMAL(10,2),
  requested_by UUID NOT NULL, -- Registrar
  approved_by UUID, -- HoD
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  exam_scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Guest course viewing (for public access)
CREATE TABLE public.guest_course_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  visitor_ip INET,
  visitor_user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Password reset requests
CREATE TABLE public.password_reset_requests (
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

-- Enable Row Level Security
ALTER TABLE public.campus_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_unit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_exam_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_course_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Campus branches - readable by authenticated users
CREATE POLICY "Authenticated users can view campus branches" 
ON public.campus_branches FOR SELECT 
TO authenticated 
USING (is_active = true);

CREATE POLICY "Admin can manage campus branches" 
ON public.campus_branches FOR ALL 
TO authenticated 
USING (is_admin_user(auth.uid()));

-- Unit assignments - HoDs can manage, lecturers can view their assignments
CREATE POLICY "HoDs can manage unit assignments" 
ON public.unit_assignments FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('hod', 'admin')
  )
);

CREATE POLICY "Lecturers can view their unit assignments" 
ON public.unit_assignments FOR SELECT 
TO authenticated 
USING (lecturer_id = auth.uid());

-- Student unit registrations
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

-- Document uploads
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

-- Semester plans
CREATE POLICY "Lecturers can manage their semester plans" 
ON public.semester_plans FOR ALL 
TO authenticated 
USING (lecturer_id = auth.uid() OR is_admin_user(auth.uid()));

CREATE POLICY "Students can view semester plans for their units" 
ON public.semester_plans FOR SELECT 
TO authenticated 
USING (
  unit_id IN (
    SELECT unit_id FROM student_unit_registrations 
    WHERE student_id = auth.uid() AND registration_status = 'approved'
  )
);

-- Semester plan activities
CREATE POLICY "Lecturers can manage semester plan activities" 
ON public.semester_plan_activities FOR ALL 
TO authenticated 
USING (
  semester_plan_id IN (
    SELECT id FROM semester_plans 
    WHERE lecturer_id = auth.uid()
  ) OR 
  is_admin_user(auth.uid())
);

CREATE POLICY "Students can view semester plan activities" 
ON public.semester_plan_activities FOR SELECT 
TO authenticated 
USING (
  semester_plan_id IN (
    SELECT sp.id FROM semester_plans sp
    JOIN student_unit_registrations sur ON sp.unit_id = sur.unit_id
    WHERE sur.student_id = auth.uid() AND sur.registration_status = 'approved'
  )
);

-- Timetables
CREATE POLICY "Admin can manage timetables" 
ON public.timetables FOR ALL 
TO authenticated 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Authenticated users can view timetables" 
ON public.timetables FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Special exam requests
CREATE POLICY "Registrar can manage special exam requests" 
ON public.special_exam_requests FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('registrar', 'admin')
  )
);

CREATE POLICY "HoDs can approve special exam requests" 
ON public.special_exam_requests FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('hod', 'admin')
  )
);

CREATE POLICY "Students can view their special exam requests" 
ON public.special_exam_requests FOR SELECT 
TO authenticated 
USING (student_id = auth.uid());

-- Guest course views - public access
CREATE POLICY "Allow guest course views" 
ON public.guest_course_views FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Password reset requests - public access for creation
CREATE POLICY "Allow password reset requests" 
ON public.password_reset_requests FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Admin can manage password reset requests" 
ON public.password_reset_requests FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('registrar', 'admin')
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_campus_branches_updated_at
  BEFORE UPDATE ON public.campus_branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unit_assignments_updated_at
  BEFORE UPDATE ON public.unit_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_unit_registrations_updated_at
  BEFORE UPDATE ON public.student_unit_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_uploads_updated_at
  BEFORE UPDATE ON public.document_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_semester_plans_updated_at
  BEFORE UPDATE ON public.semester_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_semester_plan_activities_updated_at
  BEFORE UPDATE ON public.semester_plan_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_exam_requests_updated_at
  BEFORE UPDATE ON public.special_exam_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample campus branches
INSERT INTO public.campus_branches (name, code, location, whatsapp_group_link) VALUES
('Main Campus', 'MAIN', 'City Center', 'https://chat.whatsapp.com/main-campus'),
('North Campus', 'NORTH', 'North District', 'https://chat.whatsapp.com/north-campus'),
('South Campus', 'SOUTH', 'South District', 'https://chat.whatsapp.com/south-campus'),
('East Campus', 'EAST', 'East District', 'https://chat.whatsapp.com/east-campus');