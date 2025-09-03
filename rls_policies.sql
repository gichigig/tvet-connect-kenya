-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- =============================================
-- This file contains all RLS policies for proper access control based on user roles

-- =============================================
-- 1. COURSES & DEPARTMENTS POLICIES
-- =============================================

-- Courses policies
CREATE POLICY "Everyone can view active courses" 
  ON public.courses FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admin and registrar can manage courses" 
  ON public.courses FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

-- =============================================
-- 2. ENHANCED PROFILES POLICIES (Update existing)
-- =============================================

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin and registrar can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin and registrar can manage profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Admin and registrar can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar', 'finance', 'hod')
    )
  );

CREATE POLICY "Admin and registrar can manage profiles" 
  ON public.profiles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Allow profile creation on signup" 
  ON public.profiles FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Guardians policies
CREATE POLICY "Students can view their own guardians" 
  ON public.guardians FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Students can manage their own guardians" 
  ON public.guardians FOR ALL 
  USING (student_id = auth.uid());

CREATE POLICY "Admin and registrar can view all guardians" 
  ON public.guardians FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar', 'finance')
    )
  );

CREATE POLICY "Admin and registrar can manage guardians" 
  ON public.guardians FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

-- =============================================
-- 3. UNITS & ACADEMIC STRUCTURE POLICIES
-- =============================================

-- Units policies
CREATE POLICY "Everyone can view active units" 
  ON public.units FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Registrar and admin can manage units" 
  ON public.units FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Lecturers can view their assigned units" 
  ON public.units FOR SELECT 
  USING (
    lecturer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar', 'hod')
    )
  );

CREATE POLICY "Lecturers can update their assigned units" 
  ON public.units FOR UPDATE 
  USING (lecturer_id = auth.uid());

-- Student unit registrations policies
CREATE POLICY "Students can view their own registrations" 
  ON public.student_unit_registrations FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Students can create their own registrations" 
  ON public.student_unit_registrations FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their pending registrations" 
  ON public.student_unit_registrations FOR UPDATE 
  USING (student_id = auth.uid() AND status = 'pending');

CREATE POLICY "Registrar can manage all unit registrations" 
  ON public.student_unit_registrations FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Lecturers can view registrations for their units" 
  ON public.student_unit_registrations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.units 
      WHERE id = unit_id AND lecturer_id = auth.uid()
    )
  );

-- Semester plans policies
CREATE POLICY "Everyone can view active semester plans" 
  ON public.semester_plans FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admin and registrar can manage semester plans" 
  ON public.semester_plans FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

-- =============================================
-- 4. ACADEMIC CONTENT POLICIES
-- =============================================

-- Assignments policies
CREATE POLICY "Students can view visible assignments for their units" 
  ON public.assignments FOR SELECT 
  USING (
    is_visible = true AND 
    EXISTS (
      SELECT 1 FROM public.student_unit_registrations 
      WHERE student_id = auth.uid() 
        AND unit_id = assignments.unit_id 
        AND status = 'approved'
    )
  );

CREATE POLICY "Lecturers can manage their unit assignments" 
  ON public.assignments FOR ALL 
  USING (lecturer_id = auth.uid());

CREATE POLICY "Admin and HOD can view all assignments" 
  ON public.assignments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hod')
    )
  );

-- Enhanced assignment submissions policies
DROP POLICY IF EXISTS "Students can view their own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students can create their own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Lecturers can view and manage submissions" ON public.assignment_submissions;

CREATE POLICY "Students can view their own submissions" 
  ON public.assignment_submissions FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Students can create their own submissions" 
  ON public.assignment_submissions FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own ungraded submissions" 
  ON public.assignment_submissions FOR UPDATE 
  USING (student_id = auth.uid() AND grade IS NULL);

CREATE POLICY "Lecturers can manage submissions for their assignments" 
  ON public.assignment_submissions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments 
      WHERE id = assignment_id AND lecturer_id = auth.uid()
    )
  );

CREATE POLICY "Admin and HOD can view all submissions" 
  ON public.assignment_submissions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hod')
    )
  );

-- CATs policies
CREATE POLICY "Students can view accessible CATs for their units" 
  ON public.cats FOR SELECT 
  USING (
    is_visible = true AND is_accessible = true AND 
    EXISTS (
      SELECT 1 FROM public.student_unit_registrations 
      WHERE student_id = auth.uid() 
        AND unit_id = cats.unit_id 
        AND status = 'approved'
    )
  );

CREATE POLICY "Lecturers can manage their unit CATs" 
  ON public.cats FOR ALL 
  USING (lecturer_id = auth.uid());

CREATE POLICY "Admin and HOD can view all CATs" 
  ON public.cats FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hod')
    )
  );

-- Exams policies
CREATE POLICY "Students can view accessible exams for their units" 
  ON public.exams FOR SELECT 
  USING (
    is_visible = true AND is_accessible = true AND 
    EXISTS (
      SELECT 1 FROM public.student_unit_registrations 
      WHERE student_id = auth.uid() 
        AND unit_id = exams.unit_id 
        AND status = 'approved'
    )
  );

CREATE POLICY "Lecturers can manage their unit exams" 
  ON public.exams FOR ALL 
  USING (lecturer_id = auth.uid());

CREATE POLICY "Admin and HOD can view all exams" 
  ON public.exams FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hod')
    )
  );

-- Notes policies
CREATE POLICY "Students can view accessible notes for their units" 
  ON public.notes FOR SELECT 
  USING (
    is_visible = true AND is_accessible = true AND 
    EXISTS (
      SELECT 1 FROM public.student_unit_registrations 
      WHERE student_id = auth.uid() 
        AND unit_id = notes.unit_id 
        AND status = 'approved'
    )
  );

CREATE POLICY "Lecturers can manage their unit notes" 
  ON public.notes FOR ALL 
  USING (lecturer_id = auth.uid());

CREATE POLICY "Admin and HOD can view all notes" 
  ON public.notes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hod')
    )
  );

-- Online classes policies
CREATE POLICY "Students can view accessible online classes for their units" 
  ON public.online_classes FOR SELECT 
  USING (
    is_visible = true AND is_accessible = true AND 
    EXISTS (
      SELECT 1 FROM public.student_unit_registrations 
      WHERE student_id = auth.uid() 
        AND unit_id = online_classes.unit_id 
        AND status = 'approved'
    )
  );

CREATE POLICY "Lecturers can manage their unit online classes" 
  ON public.online_classes FOR ALL 
  USING (lecturer_id = auth.uid());

CREATE POLICY "Admin and HOD can view all online classes" 
  ON public.online_classes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'hod')
    )
  );

-- =============================================
-- 5. GRADING & RESULTS POLICIES
-- =============================================

-- Student results policies
CREATE POLICY "Students can view their own results" 
  ON public.student_results FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers can manage results for their units" 
  ON public.student_results FOR ALL 
  USING (lecturer_id = auth.uid());

CREATE POLICY "HOD can approve results in their department" 
  ON public.student_results FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.units u ON u.id = student_results.unit_id
      WHERE p.user_id = auth.uid() 
        AND p.role = 'hod' 
        AND p.department_id = u.department_id
    )
  );

CREATE POLICY "Admin and registrar can view all results" 
  ON public.student_results FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

-- Exam results policies
CREATE POLICY "Students can view their own exam results" 
  ON public.exam_results FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Lecturers can manage exam results for their units" 
  ON public.exam_results FOR ALL 
  USING (lecturer_id = auth.uid());

CREATE POLICY "Admin and registrar can view all exam results" 
  ON public.exam_results FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar', 'hod')
    )
  );

-- =============================================
-- 6. FINANCIAL MANAGEMENT POLICIES
-- =============================================

-- Fee structures policies
CREATE POLICY "Students can view fee structures for their course" 
  ON public.fee_structures FOR SELECT 
  USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND course = fee_structures.course
    )
  );

CREATE POLICY "Finance and admin can manage fee structures" 
  ON public.fee_structures FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'finance', 'registrar')
    )
  );

-- Student fees policies
CREATE POLICY "Students can view their own fees" 
  ON public.student_fees FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Finance staff can manage all student fees" 
  ON public.student_fees FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'finance')
    )
  );

CREATE POLICY "Registrar can view student fees" 
  ON public.student_fees FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'finance', 'registrar')
    )
  );

-- Payment records policies
CREATE POLICY "Students can view their own payment records" 
  ON public.payment_records FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Finance staff can manage payment records" 
  ON public.payment_records FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'finance')
    )
  );

-- Clearance forms policies
CREATE POLICY "Students can view their own clearance forms" 
  ON public.clearance_forms FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Students can create their own clearance requests" 
  ON public.clearance_forms FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Finance staff can manage clearance forms" 
  ON public.clearance_forms FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'finance')
    )
  );

-- Student cards policies
CREATE POLICY "Students can view their own student cards" 
  ON public.student_cards FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Admin and registrar can manage student cards" 
  ON public.student_cards FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
    )
  );

-- =============================================
-- 7. SUPPLY CHAIN POLICIES
-- =============================================

-- Supply requests policies
CREATE POLICY "Users can view their own supply requests" 
  ON public.supply_requests FOR SELECT 
  USING (requested_by = auth.uid());

CREATE POLICY "Users can create their own supply requests" 
  ON public.supply_requests FOR INSERT 
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can update their pending supply requests" 
  ON public.supply_requests FOR UPDATE 
  USING (requested_by = auth.uid() AND status = 'pending');

CREATE POLICY "Admin can manage all supply requests" 
  ON public.supply_requests FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Supply items policies
CREATE POLICY "Users can view items for their supply requests" 
  ON public.supply_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.supply_requests 
      WHERE id = supply_request_id AND requested_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage items for their supply requests" 
  ON public.supply_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.supply_requests 
      WHERE id = supply_request_id AND requested_by = auth.uid()
    )
  );

CREATE POLICY "Admin can view all supply items" 
  ON public.supply_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 8. SYSTEM MANAGEMENT POLICIES
-- =============================================

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs" 
  ON public.activity_logs FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all activity logs" 
  ON public.activity_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert activity logs" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can manage all notifications" 
  ON public.notifications FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
