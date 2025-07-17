-- Virtual Labs Domain Table
CREATE TYPE domain_type AS ENUM ('science', 'engineering', 'medical');
CREATE TYPE experiment_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TABLE virtual_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    domain domain_type NOT NULL,
    description TEXT,
    difficulty experiment_difficulty DEFAULT 'beginner',
    learning_objectives TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Experiments Table
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES virtual_labs(id),
    title TEXT NOT NULL,
    description TEXT,
    simulation_url TEXT,
    max_score INTEGER DEFAULT 100,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiment Attempts Tracking
CREATE TABLE experiment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id),
    student_id UUID REFERENCES auth.users(id),
    score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    submission_data JSONB,
    status TEXT DEFAULT 'in_progress'
);