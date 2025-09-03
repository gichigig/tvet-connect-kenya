-- =============================================
-- DATABASE INDEXES AND TRIGGERS FOR PERFORMANCE
-- =============================================
-- This file contains all necessary indexes and triggers for optimal database performance

-- =============================================
-- 1. ESSENTIAL INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_course_year_semester ON public.profiles(course, year, semester);
CREATE INDEX IF NOT EXISTS idx_profiles_admission_number ON public.profiles(admission_number);
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON public.profiles(approved);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);

-- Units table indexes
CREATE INDEX IF NOT EXISTS idx_units_code ON public.units(code);
CREATE INDEX IF NOT EXISTS idx_units_course_year_semester ON public.units(course, year, semester);
CREATE INDEX IF NOT EXISTS idx_units_lecturer_id ON public.units(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_units_department_id ON public.units(department_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON public.units(status);
CREATE INDEX IF NOT EXISTS idx_units_course_id ON public.units(course_id);

-- Student unit registrations indexes
CREATE INDEX IF NOT EXISTS idx_student_unit_reg_student_id ON public.student_unit_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_unit_reg_unit_id ON public.student_unit_registrations(unit_id);
CREATE INDEX IF NOT EXISTS idx_student_unit_reg_status ON public.student_unit_registrations(status);
CREATE INDEX IF NOT EXISTS idx_student_unit_reg_academic_year ON public.student_unit_registrations(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_unit_reg_course_year_sem ON public.student_unit_registrations(course, year, semester);

-- Assignments and submissions indexes
CREATE INDEX IF NOT EXISTS idx_assignments_unit_id ON public.assignments(unit_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lecturer_id ON public.assignments(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_visible ON public.assignments(is_visible);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON public.assignment_submissions(final_status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_submitted_at ON public.assignment_submissions(submitted_at);

-- CATs, Exams, Notes indexes
CREATE INDEX IF NOT EXISTS idx_cats_unit_id ON public.cats(unit_id);
CREATE INDEX IF NOT EXISTS idx_cats_lecturer_id ON public.cats(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_cats_scheduled_date ON public.cats(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cats_status ON public.cats(status);

CREATE INDEX IF NOT EXISTS idx_exams_unit_id ON public.exams(unit_id);
CREATE INDEX IF NOT EXISTS idx_exams_lecturer_id ON public.exams(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_exams_scheduled_date ON public.exams(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);

CREATE INDEX IF NOT EXISTS idx_notes_unit_id ON public.notes(unit_id);
CREATE INDEX IF NOT EXISTS idx_notes_lecturer_id ON public.notes(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_notes_visible ON public.notes(is_visible);

-- Results and grading indexes
CREATE INDEX IF NOT EXISTS idx_student_results_student_id ON public.student_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_results_unit_id ON public.student_results(unit_id);
CREATE INDEX IF NOT EXISTS idx_student_results_lecturer_id ON public.student_results(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_student_results_academic_year ON public.student_results(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_results_hod_approval ON public.student_results(hod_approval);
CREATE INDEX IF NOT EXISTS idx_student_results_status ON public.student_results(status);

CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON public.exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_unit_code ON public.exam_results(unit_code);
CREATE INDEX IF NOT EXISTS idx_exam_results_academic_year ON public.exam_results(academic_year);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_date ON public.exam_results(exam_date);

-- Attendance system indexes (for existing tables)
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_lecturer_id ON public.attendance_sessions(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_unit_code ON public.attendance_sessions(unit_code);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_session_date ON public.attendance_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON public.attendance_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_student_attendance_student_id ON public.student_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_unit_code ON public.student_attendance(unit_code);
CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON public.student_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_student_attendance_session_id ON public.student_attendance(session_id);

-- Financial system indexes
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON public.student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON public.student_fees(due_date);
CREATE INDEX IF NOT EXISTS idx_student_fees_academic_year ON public.student_fees(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_fees_fee_type ON public.student_fees(fee_type);

CREATE INDEX IF NOT EXISTS idx_payment_records_student_id ON public.payment_records(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_fee_id ON public.payment_records(fee_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON public.payment_records(payment_date);

CREATE INDEX IF NOT EXISTS idx_fee_structures_course ON public.fee_structures(course);
CREATE INDEX IF NOT EXISTS idx_fee_structures_academic_year ON public.fee_structures(academic_year);
CREATE INDEX IF NOT EXISTS idx_fee_structures_active ON public.fee_structures(is_active);

-- System management indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_department ON public.activity_logs(department);

-- Supply chain indexes
CREATE INDEX IF NOT EXISTS idx_supply_requests_requested_by ON public.supply_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON public.supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_supply_requests_department ON public.supply_requests(department);
CREATE INDEX IF NOT EXISTS idx_supply_requests_request_date ON public.supply_requests(request_date);

-- =============================================
-- 2. COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================

-- Student academic tracking
CREATE INDEX IF NOT EXISTS idx_student_academic_tracking 
  ON public.student_unit_registrations(student_id, academic_year, status);

-- Unit enrollment tracking
CREATE INDEX IF NOT EXISTS idx_unit_enrollment_tracking 
  ON public.student_unit_registrations(unit_id, status, academic_year);

-- Financial status tracking
CREATE INDEX IF NOT EXISTS idx_student_financial_status 
  ON public.student_fees(student_id, status, due_date);

-- Academic performance tracking
CREATE INDEX IF NOT EXISTS idx_academic_performance 
  ON public.student_results(student_id, academic_year, semester, status);

-- Lecturer workload tracking
CREATE INDEX IF NOT EXISTS idx_lecturer_workload 
  ON public.units(lecturer_id, status, year, semester);

-- =============================================
-- 3. TRIGGER FUNCTIONS FOR AUTOMATION
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update unit enrollment count
CREATE OR REPLACE FUNCTION public.update_unit_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  enrollment_count INTEGER;
BEGIN
  -- Calculate enrollment for the unit
  SELECT COUNT(*) INTO enrollment_count
  FROM public.student_unit_registrations
  WHERE unit_id = COALESCE(NEW.unit_id, OLD.unit_id)
    AND status = 'approved';
  
  -- Update the unit's enrolled count
  UPDATE public.units
  SET enrolled = enrollment_count
  WHERE id = COALESCE(NEW.unit_id, OLD.unit_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate student fees balance
CREATE OR REPLACE FUNCTION public.update_student_financial_status()
RETURNS TRIGGER AS $$
DECLARE
  total_owed DECIMAL(10,2);
  student_status TEXT;
BEGIN
  -- Calculate total fees owed
  SELECT COALESCE(SUM(amount - paid_amount), 0) INTO total_owed
  FROM public.student_fees
  WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
    AND status IN ('pending', 'overdue', 'partial');
  
  -- Determine financial status
  IF total_owed = 0 THEN
    student_status := 'cleared';
  ELSIF total_owed > 0 THEN
    student_status := 'pending';
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    total_fees_owed = total_owed,
    financial_status = student_status,
    updated_at = now()
  WHERE user_id = COALESCE(NEW.student_id, OLD.student_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to create activity log
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  action_text TEXT;
  details_text TEXT;
BEGIN
  -- Get user profile information
  SELECT first_name, last_name, role INTO user_profile
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  -- Skip if no user profile found
  IF user_profile IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Determine action based on operation
  IF TG_OP = 'INSERT' THEN
    action_text := 'CREATE';
    details_text := format('Created new %s', TG_TABLE_NAME);
  ELSIF TG_OP = 'UPDATE' THEN
    action_text := 'UPDATE';
    details_text := format('Updated %s', TG_TABLE_NAME);
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'DELETE';
    details_text := format('Deleted %s', TG_TABLE_NAME);
  END IF;
  
  -- Insert activity log
  INSERT INTO public.activity_logs (
    user_id, user_name, user_role, action, details, department
  ) VALUES (
    auth.uid(),
    user_profile.first_name || ' ' || user_profile.last_name,
    user_profile.role,
    action_text,
    details_text,
    user_profile.role
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- =============================================
-- 4. CREATE TRIGGERS
-- =============================================

-- Updated timestamp triggers
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_unit_registrations_updated_at
  BEFORE UPDATE ON public.student_unit_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_results_updated_at
  BEFORE UPDATE ON public.student_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at
  BEFORE UPDATE ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Unit enrollment tracking triggers
CREATE TRIGGER track_unit_enrollment_insert
  AFTER INSERT ON public.student_unit_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unit_enrollment();

CREATE TRIGGER track_unit_enrollment_update
  AFTER UPDATE ON public.student_unit_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unit_enrollment();

CREATE TRIGGER track_unit_enrollment_delete
  AFTER DELETE ON public.student_unit_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unit_enrollment();

-- Financial status tracking triggers
CREATE TRIGGER update_financial_status_insert
  AFTER INSERT ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_financial_status();

CREATE TRIGGER update_financial_status_update
  AFTER UPDATE ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_financial_status();

CREATE TRIGGER update_financial_status_delete
  AFTER DELETE ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_financial_status();

-- User registration trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Activity logging triggers (for critical tables)
CREATE TRIGGER log_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_unit_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_result_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.student_results
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_fee_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity();
