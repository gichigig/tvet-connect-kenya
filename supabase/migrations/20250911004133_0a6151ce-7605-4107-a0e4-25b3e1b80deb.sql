-- Create timetable table for class schedules
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  lecturer_id UUID REFERENCES auth.users(id),
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  lecturer_name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT NOT NULL,
  semester_id UUID,
  academic_year_id UUID,
  course TEXT,
  year INTEGER,
  semester INTEGER,
  room_capacity INTEGER,
  class_type TEXT CHECK (class_type IN ('lecture', 'tutorial', 'practical', 'lab', 'seminar')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create retakes table for exam/unit retakes
CREATE TABLE IF NOT EXISTS public.retakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  unit_id UUID REFERENCES public.units(id),
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  exam_id UUID,
  retake_type TEXT NOT NULL CHECK (retake_type IN ('exam', 'unit', 'assignment', 'coursework')),
  original_score NUMERIC,
  retake_reason TEXT NOT NULL,
  retake_date DATE,
  retake_score NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed')),
  approved_by UUID REFERENCES auth.users(id),
  approved_date DATE,
  rejection_reason TEXT,
  fee_required NUMERIC DEFAULT 0,
  fee_paid BOOLEAN DEFAULT false,
  payment_reference TEXT,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retakes ENABLE ROW LEVEL SECURITY;

-- RLS policies for timetable
DROP POLICY IF EXISTS "Everyone can view timetable" ON public.timetable;
CREATE POLICY "Everyone can view timetable" 
  ON public.timetable FOR SELECT 
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage all timetables" ON public.timetable;
CREATE POLICY "Admin can manage all timetables" 
  ON public.timetable FOR ALL 
  USING (is_admin_user(auth.uid()));

-- RLS policies for retakes
DROP POLICY IF EXISTS "Students can view their own retakes" ON public.retakes;
CREATE POLICY "Students can view their own retakes" 
  ON public.retakes FOR SELECT 
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can create their own retake requests" ON public.retakes;
CREATE POLICY "Students can create their own retake requests" 
  ON public.retakes FOR INSERT 
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admin can manage all retakes" ON public.retakes;
CREATE POLICY "Admin can manage all retakes" 
  ON public.retakes FOR ALL 
  USING (is_admin_user(auth.uid()));

-- Create triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_timetable_updated_at ON public.timetable;
CREATE TRIGGER update_timetable_updated_at
  BEFORE UPDATE ON public.timetable
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_retakes_updated_at ON public.retakes;
CREATE TRIGGER update_retakes_updated_at
  BEFORE UPDATE ON public.retakes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timetable_unit_id ON public.timetable(unit_id);
CREATE INDEX IF NOT EXISTS idx_timetable_lecturer_id ON public.timetable(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day_time ON public.timetable(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_timetable_active ON public.timetable(is_active);

CREATE INDEX IF NOT EXISTS idx_retakes_student_id ON public.retakes(student_id);
CREATE INDEX IF NOT EXISTS idx_retakes_unit_id ON public.retakes(unit_id);
CREATE INDEX IF NOT EXISTS idx_retakes_status ON public.retakes(status);
CREATE INDEX IF NOT EXISTS idx_retakes_academic_year ON public.retakes(academic_year, semester);