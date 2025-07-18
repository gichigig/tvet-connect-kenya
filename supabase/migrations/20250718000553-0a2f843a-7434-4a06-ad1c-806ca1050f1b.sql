-- Create assignment submissions table with AI detection
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  submission_text TEXT NOT NULL,
  file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ai_detection_status TEXT NOT NULL DEFAULT 'pending',
  ai_confidence_score DECIMAL(5,2),
  ai_detection_details JSONB,
  human_review_status TEXT DEFAULT 'not_reviewed',
  human_reviewer_id UUID,
  human_review_notes TEXT,
  human_reviewed_at TIMESTAMP WITH TIME ZONE,
  final_status TEXT NOT NULL DEFAULT 'under_review',
  grade DECIMAL(5,2),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can create their own submissions"
ON public.assignment_submissions
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view their own submissions"
ON public.assignment_submissions
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Lecturers can view submissions for their assignments"
ON public.assignment_submissions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'lecturer'
));

CREATE POLICY "Lecturers can update submissions for review"
ON public.assignment_submissions
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'lecturer'
));

-- Create trigger for updated_at
CREATE TRIGGER update_assignment_submissions_updated_at
BEFORE UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();