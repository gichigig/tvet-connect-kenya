-- Create comprehensive academic management system tables
-- Skip tables that already exist: profiles, courses, departments, units, student_units, assignment_submissions

-- 1. User Management System
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 2. Institution Management
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('main_campus', 'branch', 'satellite')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  established_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.institution_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.department_heads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID,
  head_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  appointed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Academic Structure
CREATE TABLE IF NOT EXISTS public.course_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  unit_id UUID,
  is_core BOOLEAN DEFAULT true,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 6),
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.unit_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID,
  prerequisite_unit_id UUID,
  is_mandatory BOOLEAN DEFAULT true,
  minimum_grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 3),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_start DATE,
  registration_end DATE,
  is_current BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.intake_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  application_deadline DATE,
  max_students INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Student Management (Extended)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  admission_number TEXT NOT NULL UNIQUE,
  course_id UUID,
  intake_period_id UUID REFERENCES public.intake_periods(id),
  level TEXT CHECK (level IN ('certificate', 'diploma', 'degree', 'masters', 'phd')),
  year INTEGER CHECK (year >= 1 AND year <= 6),
  semester INTEGER CHECK (semester >= 1 AND semester <= 3),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'withdrawn', 'suspended', 'deferred')),
  enrollment_date DATE NOT NULL,
  expected_graduation_date DATE,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  enrollment_date DATE NOT NULL,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'deferred', 'withdrawn', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_unit_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  unit_id UUID,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  registration_date DATE NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'dropped', 'completed', 'failed')),
  grade TEXT,
  marks DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  from_course_id UUID,
  to_course_id UUID,
  transfer_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_graduations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID,
  graduation_date DATE NOT NULL,
  gpa DECIMAL(3,2),
  classification TEXT,
  certificate_number TEXT UNIQUE,
  issued_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  suspended_by UUID NOT NULL,
  reinstatement_conditions TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Lecturer Management
CREATE TABLE IF NOT EXISTS public.lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  employee_number TEXT NOT NULL UNIQUE,
  department_id UUID,
  position TEXT CHECK (position IN ('lecturer', 'senior_lecturer', 'assistant_professor', 'associate_professor', 'professor')),
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'visiting')),
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  office_location TEXT,
  office_hours TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lecturer_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
  qualification_type TEXT NOT NULL CHECK (qualification_type IN ('degree', 'masters', 'phd', 'professional', 'certification')),
  qualification_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  year_obtained INTEGER,
  field_of_study TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lecturer_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
  subject_area TEXT NOT NULL,
  competency_level TEXT CHECK (competency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.unit_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
  unit_id UUID,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  assignment_type TEXT CHECK (assignment_type IN ('primary', 'assistant', 'substitute')),
  assigned_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lecturer_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
  unit_id UUID,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Academic Administration
CREATE TABLE IF NOT EXISTS public.unit_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID,
  department_id UUID,
  allocated_date DATE NOT NULL,
  allocated_by UUID NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  submitted_by UUID NOT NULL,
  reviewed_by UUID,
  submission_date DATE NOT NULL,
  review_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_required')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.unit_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID,
  submitted_by UUID NOT NULL,
  reviewed_by UUID,
  submission_date DATE NOT NULL,
  review_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_required')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  version_number TEXT NOT NULL,
  effective_date DATE NOT NULL,
  description TEXT,
  approved_by UUID,
  approval_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_unit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_graduations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturer_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturer_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturer_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_versions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for admin access
-- Users can read data they have access to
CREATE POLICY "authenticated_users_read" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.institution_branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.semesters FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.intake_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.course_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.unit_prerequisites FOR SELECT TO authenticated USING (true);

-- Admin can manage everything
CREATE POLICY "admin_all_access" ON public.user_roles FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.role_permissions FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.department_heads FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.students FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.student_enrollments FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.student_unit_registrations FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.student_transfers FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.student_graduations FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.student_suspensions FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.lecturers FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.lecturer_qualifications FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.lecturer_specializations FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.unit_assignments FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.lecturer_schedules FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.unit_allocations FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.course_approvals FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.unit_approvals FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.curriculum_versions FOR ALL TO authenticated USING (is_admin_user(auth.uid()));

-- Students can access their own records
CREATE POLICY "students_own_records" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "students_own_enrollments" ON public.student_enrollments FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "students_own_registrations" ON public.student_unit_registrations FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- Lecturers can access their own records and related data
CREATE POLICY "lecturers_own_records" ON public.lecturers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "lecturers_own_qualifications" ON public.lecturer_qualifications FOR ALL TO authenticated USING (
  lecturer_id IN (SELECT id FROM public.lecturers WHERE user_id = auth.uid())
);
CREATE POLICY "lecturers_own_specializations" ON public.lecturer_specializations FOR ALL TO authenticated USING (
  lecturer_id IN (SELECT id FROM public.lecturers WHERE user_id = auth.uid())
);
CREATE POLICY "lecturers_own_assignments" ON public.unit_assignments FOR SELECT TO authenticated USING (
  lecturer_id IN (SELECT id FROM public.lecturers WHERE user_id = auth.uid())
);
CREATE POLICY "lecturers_own_schedules" ON public.lecturer_schedules FOR SELECT TO authenticated USING (
  lecturer_id IN (SELECT id FROM public.lecturers WHERE user_id = auth.uid())
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institution_branches_updated_at BEFORE UPDATE ON public.institution_branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_department_heads_updated_at BEFORE UPDATE ON public.department_heads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON public.semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intake_periods_updated_at BEFORE UPDATE ON public.intake_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_enrollments_updated_at BEFORE UPDATE ON public.student_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_unit_registrations_updated_at BEFORE UPDATE ON public.student_unit_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_transfers_updated_at BEFORE UPDATE ON public.student_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_graduations_updated_at BEFORE UPDATE ON public.student_graduations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_suspensions_updated_at BEFORE UPDATE ON public.student_suspensions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON public.lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_assignments_updated_at BEFORE UPDATE ON public.unit_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecturer_schedules_updated_at BEFORE UPDATE ON public.lecturer_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_allocations_updated_at BEFORE UPDATE ON public.unit_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_approvals_updated_at BEFORE UPDATE ON public.course_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_approvals_updated_at BEFORE UPDATE ON public.unit_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_curriculum_versions_updated_at BEFORE UPDATE ON public.curriculum_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();