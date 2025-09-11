-- Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('main', 'branch')),
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    hod_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Create students table (enhanced version)
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admission_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    national_id VARCHAR(20),
    guardian_phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    institution_branch VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('certificate', 'diploma', 'degree')),
    semester INTEGER,
    academic_year VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
CREATE INDEX IF NOT EXISTS idx_institutions_active ON institutions(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_created_by ON departments(created_by);
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);

-- Enable Row Level Security
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Allow authenticated users to read institutions" ON institutions
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow registrars to insert institutions" ON institutions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow registrars to update their institutions" ON institutions
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- RLS Policies for departments  
CREATE POLICY "Allow authenticated users to read departments" ON departments
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow registrars to insert departments" ON departments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow registrars to update their departments" ON departments
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- RLS Policies for students
CREATE POLICY "Allow authenticated users to read students" ON students
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow registrars to insert students" ON students
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow registrars to update students" ON students
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Insert some default institutions
INSERT INTO institutions (name, type, address, created_by) VALUES
('Main Campus', 'main', 'University Main Campus, Nairobi', (SELECT id FROM auth.users LIMIT 1)),
('Mombasa Branch', 'branch', 'Mombasa Branch Campus, Mombasa', (SELECT id FROM auth.users LIMIT 1)),
('Kisumu Branch', 'branch', 'Kisumu Branch Campus, Kisumu', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert some default departments (will need a valid registrar user ID)
-- These will be created by registrars in the app

-- Create function for admission number generation
CREATE OR REPLACE FUNCTION generate_admission_number(dept_code TEXT, year_suffix TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    student_count INTEGER;
    next_number INTEGER;
    admission_number TEXT;
BEGIN
    -- Use provided year or current year
    current_year := COALESCE(year_suffix, EXTRACT(YEAR FROM CURRENT_DATE)::TEXT);
    current_year := RIGHT(current_year, 2); -- Get last 2 digits
    
    -- Count existing students for this department and year
    SELECT COUNT(*) INTO student_count
    FROM students
    WHERE admission_number LIKE dept_code || '/' || current_year || '/%';
    
    -- Generate next number
    next_number := student_count + 1;
    
    -- Format admission number: DEPT/YY/001
    admission_number := dept_code || '/' || current_year || '/' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN admission_number;
END;
$$ LANGUAGE plpgsql;
