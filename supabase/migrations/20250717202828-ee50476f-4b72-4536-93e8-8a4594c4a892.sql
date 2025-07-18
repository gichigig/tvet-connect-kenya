-- Create attendance sessions table
CREATE TABLE public.attendance_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_code TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    lecturer_id UUID NOT NULL,
    lecturer_name TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('manual', 'quiz')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    attendance_code TEXT,
    description TEXT,
    location_required BOOLEAN NOT NULL DEFAULT false,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    allowed_radius INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz attendance table
CREATE TABLE public.quiz_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    unit_code TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    lecturer_id UUID NOT NULL,
    time_limit INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT false,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    questions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student attendance records table
CREATE TABLE public.student_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    session_id UUID,
    quiz_id UUID,
    unit_code TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    attendance_type TEXT NOT NULL CHECK (attendance_type IN ('manual', 'quiz')),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    quiz_score INTEGER,
    quiz_answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_attendance_session FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_attendance FOREIGN KEY (quiz_id) REFERENCES public.quiz_attendance(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance_sessions
CREATE POLICY "Lecturers can view their own attendance sessions"
ON public.attendance_sessions
FOR SELECT
USING (lecturer_id = auth.uid());

CREATE POLICY "Lecturers can create attendance sessions"
ON public.attendance_sessions
FOR INSERT
WITH CHECK (lecturer_id = auth.uid());

CREATE POLICY "Lecturers can update their own attendance sessions"
ON public.attendance_sessions
FOR UPDATE
USING (lecturer_id = auth.uid());

CREATE POLICY "Lecturers can delete their own attendance sessions"
ON public.attendance_sessions
FOR DELETE
USING (lecturer_id = auth.uid());

CREATE POLICY "Students can view active attendance sessions"
ON public.attendance_sessions
FOR SELECT
USING (is_active = true);

-- RLS Policies for quiz_attendance
CREATE POLICY "Lecturers can manage their own quiz attendance"
ON public.quiz_attendance
FOR ALL
USING (lecturer_id = auth.uid());

CREATE POLICY "Students can view active quiz attendance"
ON public.quiz_attendance
FOR SELECT
USING (is_active = true);

-- RLS Policies for student_attendance
CREATE POLICY "Students can view their own attendance records"
ON public.student_attendance
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create their own attendance records"
ON public.student_attendance
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Lecturers can view attendance records for their sessions"
ON public.student_attendance
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions 
        WHERE attendance_sessions.id = student_attendance.session_id 
        AND attendance_sessions.lecturer_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.quiz_attendance 
        WHERE quiz_attendance.id = student_attendance.quiz_id 
        AND quiz_attendance.lecturer_id = auth.uid()
    )
);

-- Create indexes for performance
CREATE INDEX idx_attendance_sessions_lecturer_id ON public.attendance_sessions(lecturer_id);
CREATE INDEX idx_attendance_sessions_active ON public.attendance_sessions(is_active);
CREATE INDEX idx_attendance_sessions_date ON public.attendance_sessions(session_date);
CREATE INDEX idx_quiz_attendance_lecturer_id ON public.quiz_attendance(lecturer_id);
CREATE INDEX idx_quiz_attendance_active ON public.quiz_attendance(is_active);
CREATE INDEX idx_student_attendance_student_id ON public.student_attendance(student_id);
CREATE INDEX idx_student_attendance_date ON public.student_attendance(attendance_date);
CREATE INDEX idx_student_attendance_unit_code ON public.student_attendance(unit_code);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_attendance_sessions_updated_at
    BEFORE UPDATE ON public.attendance_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_attendance_updated_at
    BEFORE UPDATE ON public.quiz_attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();