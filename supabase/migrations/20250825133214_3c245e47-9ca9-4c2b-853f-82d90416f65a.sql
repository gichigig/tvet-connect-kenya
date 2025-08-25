-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'registrar', 'hod', 'lecturer', 'finance', 'student')),
  department_id UUID REFERENCES public.departments(id),
  course TEXT,
  level INTEGER,
  year INTEGER,
  semester INTEGER,
  admission_number TEXT,
  intake TEXT,
  phone TEXT,
  approved BOOLEAN DEFAULT false,
  blocked BOOLEAN DEFAULT false,
  financial_status TEXT CHECK (financial_status IN ('cleared', 'pending', 'blocked')),
  total_fees_owed DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment_submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  student_name TEXT NOT NULL,
  submission_text TEXT NOT NULL,
  ai_detection_score DECIMAL(5,2),
  ai_detection_status TEXT CHECK (ai_detection_status IN ('pending', 'human', 'ai', 'mixed')),
  human_review_status TEXT CHECK (human_review_status IN ('pending', 'approved', 'flagged')),
  human_reviewer_id UUID REFERENCES auth.users(id),
  human_review_notes TEXT,
  human_reviewed_at TIMESTAMP WITH TIME ZONE,
  final_status TEXT CHECK (final_status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT,
  related_unit_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_type TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create virtual_labs table
CREATE TABLE public.virtual_labs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit_code TEXT,
  access_url TEXT,
  instructions TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiments table
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public.virtual_labs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments
CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admin and registrar can manage departments" ON public.departments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
  )
);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin and registrar can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
  )
);
CREATE POLICY "Admin and registrar can manage profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'registrar')
  )
);

-- Create RLS policies for assignment_submissions
CREATE POLICY "Students can view their own submissions" ON public.assignment_submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can create their own submissions" ON public.assignment_submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Lecturers can view and manage submissions" ON public.assignment_submissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin')
  )
);

-- Create RLS policies for calendar_events
CREATE POLICY "Users can manage their own events" ON public.calendar_events FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for reminders
CREATE POLICY "Users can manage their own reminders" ON public.reminders FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for virtual_labs
CREATE POLICY "Everyone can view virtual labs" ON public.virtual_labs FOR SELECT USING (true);
CREATE POLICY "Lecturers can manage virtual labs" ON public.virtual_labs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin')
  )
);

-- Create RLS policies for experiments
CREATE POLICY "Users can manage their own experiments" ON public.experiments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Lecturers can view all experiments" ON public.experiments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin')
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default departments
INSERT INTO public.departments (name, code, description) VALUES
('Computer Science', 'CS', 'Department of Computer Science and Information Technology'),
('Engineering', 'ENG', 'Department of Engineering'),
('Business', 'BUS', 'Department of Business and Management'),
('Science', 'SCI', 'Department of Science and Mathematics'),
('Arts', 'ARTS', 'Department of Arts and Humanities');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();