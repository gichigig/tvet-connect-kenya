-- Create missing tables only (not the ones that already exist)

-- Create units table if not exists
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

-- Create content table if not exists
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

-- Create student_units table if not exists
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

-- Enable RLS on new tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_units ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Authenticated users can view units" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated lecturers can manage units" ON public.units FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin'))
);

CREATE POLICY "Authenticated users can view content" ON public.content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated lecturers can manage content" ON public.content FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin'))
);

CREATE POLICY "Authenticated students can view their units" ON public.student_units FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Authenticated students can enroll in units" ON public.student_units FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Authenticated lecturers can manage student units" ON public.student_units FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('lecturer', 'hod', 'admin', 'registrar'))
);

-- Create triggers for updated_at columns on new tables
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_units_updated_at BEFORE UPDATE ON public.student_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();