-- RLS Policy for Virtual Labs
ALTER TABLE virtual_labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view active labs" 
ON virtual_labs 
FOR SELECT 
USING (is_active = true);

-- RLS Policy for Experiments
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view lab experiments" 
ON experiments 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM virtual_labs 
    WHERE virtual_labs.id = experiments.lab_id 
    AND virtual_labs.is_active = true
));

-- RLS Policy for Experiment Attempts
ALTER TABLE experiment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create their own attempts" 
ON experiment_attempts 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view their own attempts" 
ON experiment_attempts 
FOR SELECT 
USING (student_id = auth.uid());