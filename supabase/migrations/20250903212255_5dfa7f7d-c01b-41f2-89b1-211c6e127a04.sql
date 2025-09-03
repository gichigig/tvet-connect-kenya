-- Create comprehensive database schema for TVET Connect App

-- Create departments table first
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (main user data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin', 'hod', 'registrar', 'finance')) DEFAULT 'student',
    course TEXT,
    admission_number TEXT,
    intake TEXT,
    phone TEXT,
    financial_status TEXT,
    approved BOOLEAN DEFAULT false,
    blocked BOOLEAN DEFAULT false,
    department_id UUID REFERENCES public.departments(id),
    total_fees_owed NUMERIC DEFAULT 0,
    level INTEGER,
    year INTEGER,
    semester INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create units table
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    lecturer_id UUID NOT NULL,
    lecturer_name TEXT NOT NULL,
    department TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content table (notes, assignments)
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('notes', 'assignment')),
    title TEXT NOT NULL,
    description TEXT,
    unit_id UUID NOT NULL,
    unit_code TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    lecturer_id UUID NOT NULL,
    files JSONB,
    is_visible BOOLEAN DEFAULT true,
    topic TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    assignment_type TEXT CHECK (assignment_type IN ('file_upload', 'multiple_choice', 'question_file')),
    accepted_formats TEXT[],
    questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id TEXT NOT NULL,
    student_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    submission_text TEXT NOT NULL,
    ai_detection_score NUMERIC,
    ai_detection_status TEXT,
    human_reviewer_id UUID,
    human_review_status TEXT,
    human_review_notes TEXT,
    human_reviewed_at TIMESTAMP WITH TIME ZONE,
    final_status TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_units table (enrollment)
CREATE TABLE IF NOT EXISTS public.student_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    unit_id UUID NOT NULL,
    unit_code TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'failed')),
    grade TEXT,
    semester INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, unit_id)
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    related_unit_code TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    notification_type TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create virtual_labs table
CREATE TABLE IF NOT EXISTS public.virtual_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit_code TEXT,
    access_url TEXT,
    instructions TEXT,
    difficulty_level TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiments table
CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated admin and registrar can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated admin and registrar can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated admin and registrar can manage profiles" ON public.profiles;

-- Create RLS policies for departments
CREATE POLICY "Authenticated users can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated admin and registrar can manage departments" ON public.departments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'registrar'))
);

-- Create RLS policies for profiles
CREATE POLICY "Authenticated users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated admin and registrar can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'registrar'))
);
CREATE POLICY "Authenticated admin and registrar can manage profiles" ON public.profiles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'registrar'))
);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Create RLS policies for other tables
CREATE POLICY "Authenticated users can manage their own events" ON public.calendar_events FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can manage their own reminders" ON public.reminders FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can view virtual labs" ON public.virtual_labs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated lecturers can manage virtual labs" ON public.virtual_labs FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin'))
);
CREATE POLICY "Authenticated users can manage their own experiments" ON public.experiments FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated lecturers can view all experiments" ON public.experiments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin'))
);
CREATE POLICY "Authenticated students can view their own submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Authenticated students can create their own submissions" ON public.assignment_submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Authenticated lecturers can view and manage submissions" ON public.assignment_submissions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin'))
);

-- Create or replace function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_units_updated_at BEFORE UPDATE ON public.student_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user data if not exists
INSERT INTO public.departments (name, code, description) VALUES
('Computer Science', 'CS', 'Computer Science and Information Technology'),
('Engineering', 'ENG', 'Engineering and Technical Studies'),
('Business', 'BUS', 'Business and Commerce Studies')
ON CONFLICT (code) DO NOTHING;