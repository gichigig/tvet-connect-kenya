-- Continue creating remaining tables from the comprehensive academic management system
-- Part 2: Financial, Examination, Assessment, Scheduling, Communication, Admissions, Planning, Facilities, Reports

-- 7. Financial Management
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  level TEXT CHECK (level IN ('certificate', 'diploma', 'degree', 'masters', 'phd')),
  academic_year_id UUID REFERENCES public.academic_years(id),
  tuition_fee DECIMAL(10,2) NOT NULL,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  examination_fee DECIMAL(10,2) DEFAULT 0,
  library_fee DECIMAL(10,2) DEFAULT 0,
  activity_fee DECIMAL(10,2) DEFAULT 0,
  technology_fee DECIMAL(10,2) DEFAULT 0,
  other_fees JSONB,
  total_fee DECIMAL(10,2) NOT NULL,
  installment_plan BOOLEAN DEFAULT false,
  installments JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structures(id),
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'waived')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method_id UUID,
  transaction_reference TEXT,
  payment_date DATE NOT NULL,
  processed_by UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fee_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  waiver_type TEXT NOT NULL CHECK (waiver_type IN ('scholarship', 'bursary', 'staff_discount', 'hardship', 'merit', 'partial')),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  reason TEXT NOT NULL,
  approved_by UUID,
  approval_date DATE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank_transfer', 'mobile_money', 'card', 'cheque', 'online')),
  provider TEXT,
  account_details JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.financial_aid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  aid_type TEXT NOT NULL CHECK (aid_type IN ('loan', 'grant', 'scholarship', 'work_study', 'emergency_fund')),
  amount DECIMAL(10,2) NOT NULL,
  provider TEXT,
  description TEXT,
  conditions TEXT,
  disbursement_schedule JSONB,
  academic_year_id UUID REFERENCES public.academic_years(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'rejected', 'suspended')),
  awarded_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL,
  spent_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
  academic_year_id UUID REFERENCES public.academic_years(id),
  approved_by UUID,
  approval_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_allocation_id UUID REFERENCES public.budget_allocations(id),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vendor TEXT,
  receipt_number TEXT,
  expense_date DATE NOT NULL,
  approved_by UUID,
  approval_date DATE,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Examination and Assessment System
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  unit_id UUID,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('cat', 'midterm', 'final', 'makeup', 'supplementary')),
  total_marks INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  instructions TEXT,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  created_by UUID NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT,
  invigilator_id UUID,
  max_students INTEGER,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_exam_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  registration_date DATE NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'sat', 'absent', 'disqualified')),
  seat_number TEXT,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, exam_id)
);

CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_exam_registration_id UUID NOT NULL REFERENCES public.student_exam_registrations(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL,
  grade TEXT,
  remarks TEXT,
  marked_by UUID,
  marked_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'verified', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grade_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN ('percentage', 'gpa', 'letter')),
  min_score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  grade TEXT NOT NULL,
  grade_point DECIMAL(3,2),
  description TEXT,
  is_passing BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  gpa DECIMAL(3,2),
  cumulative_gpa DECIMAL(3,2),
  total_credits INTEGER,
  transcript_data JSONB NOT NULL,
  generated_by UUID,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_official BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'issued')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('completion', 'graduation', 'award', 'transcript')),
  certificate_number TEXT NOT NULL UNIQUE,
  course_id UUID,
  gpa DECIMAL(3,2),
  classification TEXT,
  issued_date DATE NOT NULL,
  issued_by UUID NOT NULL,
  verification_code TEXT UNIQUE,
  digital_signature TEXT,
  is_revoked BOOLEAN DEFAULT false,
  revoked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Assignments and Grading (already exists but adding grades table)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  unit_id UUID,
  lecturer_id UUID,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_marks INTEGER NOT NULL,
  assignment_type TEXT CHECK (assignment_type IN ('essay', 'project', 'practical', 'presentation', 'quiz')),
  submission_format TEXT CHECK (submission_format IN ('online', 'physical', 'both')),
  instructions TEXT,
  rubric JSONB,
  is_group_assignment BOOLEAN DEFAULT false,
  max_group_size INTEGER,
  late_submission_penalty DECIMAL(5,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  unit_id UUID,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('assignment', 'cat', 'exam', 'project', 'participation')),
  assessment_id UUID,
  marks_obtained DECIMAL(5,2) NOT NULL,
  total_marks DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((marks_obtained / total_marks) * 100) STORED,
  grade TEXT,
  semester_id UUID REFERENCES public.semesters(id),
  academic_year_id UUID REFERENCES public.academic_years(id),
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  comments TEXT,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.continuous_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  total_marks INTEGER NOT NULL,
  weight_percentage DECIMAL(5,2) NOT NULL,
  assessment_date DATE NOT NULL,
  semester_id UUID REFERENCES public.semesters(id),
  created_by UUID NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.final_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  unit_id UUID,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  continuous_assessment_marks DECIMAL(5,2),
  exam_marks DECIMAL(5,2),
  total_marks DECIMAL(5,2) NOT NULL,
  final_grade TEXT NOT NULL,
  grade_points DECIMAL(3,2),
  is_supplementary BOOLEAN DEFAULT false,
  calculated_by UUID,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, unit_id, semester_id, is_supplementary)
);

-- Enable RLS for all new tables
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_aid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exam_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuous_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_grades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admin access policies
CREATE POLICY "admin_all_access" ON public.fee_structures FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.student_fees FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.fee_payments FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.fee_waivers FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.financial_aid FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.budget_allocations FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.expenditures FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.exams FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.exam_schedules FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.student_exam_registrations FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.exam_results FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.transcripts FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.certificates FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.assignments FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.grades FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.continuous_assessments FOR ALL TO authenticated USING (is_admin_user(auth.uid()));
CREATE POLICY "admin_all_access" ON public.final_grades FOR ALL TO authenticated USING (is_admin_user(auth.uid()));

-- Read access for authenticated users
CREATE POLICY "authenticated_users_read" ON public.payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_read" ON public.grade_scales FOR SELECT TO authenticated USING (true);

-- Student access to their own records
CREATE POLICY "students_own_fees" ON public.student_fees FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "students_own_payments" ON public.fee_payments FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "students_own_grades" ON public.grades FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "students_own_transcripts" ON public.transcripts FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- Lecturer access for their subjects
CREATE POLICY "lecturers_manage_exams" ON public.exams FOR ALL TO authenticated USING (
  created_by = auth.uid() OR is_admin_user(auth.uid())
);
CREATE POLICY "lecturers_manage_assignments" ON public.assignments FOR ALL TO authenticated USING (
  lecturer_id = auth.uid() OR is_admin_user(auth.uid())
);
CREATE POLICY "lecturers_manage_grades" ON public.grades FOR ALL TO authenticated USING (
  graded_by = auth.uid() OR is_admin_user(auth.uid())
);

-- Apply triggers for updated_at timestamps
CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON public.fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_fees_updated_at BEFORE UPDATE ON public.student_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_payments_updated_at BEFORE UPDATE ON public.fee_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_waivers_updated_at BEFORE UPDATE ON public.fee_waivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_aid_updated_at BEFORE UPDATE ON public.financial_aid FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_allocations_updated_at BEFORE UPDATE ON public.budget_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenditures_updated_at BEFORE UPDATE ON public.expenditures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_schedules_updated_at BEFORE UPDATE ON public.exam_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_exam_registrations_updated_at BEFORE UPDATE ON public.student_exam_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_results_updated_at BEFORE UPDATE ON public.exam_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grade_scales_updated_at BEFORE UPDATE ON public.grade_scales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON public.transcripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_continuous_assessments_updated_at BEFORE UPDATE ON public.continuous_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_final_grades_updated_at BEFORE UPDATE ON public.final_grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();