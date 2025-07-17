-- Create exam types enum
CREATE TYPE exam_type AS ENUM ('quiz', 'midterm', 'final', 'practice');

-- Question Bank
CREATE TABLE question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_code TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    answer_options JSONB,
    explanation TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Online Exams
CREATE TABLE online_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    exam_type exam_type NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    passing_marks INTEGER NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false,
    proctoring_enabled BOOLEAN DEFAULT true,
    webcam_required BOOLEAN DEFAULT true,
    allow_tab_switch BOOLEAN DEFAULT false
);

-- Exam Questions (randomly selected from question bank)
CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES online_exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES question_bank(id),
    marks INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    UNIQUE(exam_id, question_number)
);

-- Student Exam Attempts
CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES online_exams(id),
    student_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'in_progress',
    total_score INTEGER,
    submitted_answers JSONB,
    proctoring_flags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- Proctoring Events
CREATE TABLE proctoring_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES exam_attempts(id),
    event_type TEXT NOT NULL,
    event_data JSONB,
    severity TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Question Bank
CREATE POLICY "Lecturers can manage their questions"
ON question_bank
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'lecturer'
    )
);

-- Online Exams
CREATE POLICY "Lecturers can manage exams"
ON online_exams
FOR ALL
USING (created_by = auth.uid());

CREATE POLICY "Students can view published exams"
ON online_exams
FOR SELECT
USING (is_published = true);

-- Exam Questions
CREATE POLICY "Lecturers can manage exam questions"
ON exam_questions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM online_exams
        WHERE online_exams.id = exam_questions.exam_id
        AND online_exams.created_by = auth.uid()
    )
);

CREATE POLICY "Students can view exam questions during exam"
ON exam_questions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM exam_attempts
        WHERE exam_attempts.exam_id = exam_questions.exam_id
        AND exam_attempts.student_id = auth.uid()
        AND exam_attempts.status = 'in_progress'
    )
);

-- Exam Attempts
CREATE POLICY "Students can manage their own attempts"
ON exam_attempts
FOR ALL
USING (student_id = auth.uid());

CREATE POLICY "Lecturers can view attempts for their exams"
ON exam_attempts
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM online_exams
        WHERE online_exams.id = exam_attempts.exam_id
        AND online_exams.created_by = auth.uid()
    )
);

-- Proctoring Events
CREATE POLICY "System can create proctoring events"
ON proctoring_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Lecturers can view proctoring events"
ON proctoring_events
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM exam_attempts ea
        JOIN online_exams oe ON ea.exam_id = oe.id
        WHERE ea.id = proctoring_events.attempt_id
        AND oe.created_by = auth.uid()
    )
);