-- Job and Internship Opportunities
CREATE TYPE job_type AS ENUM ('internship', 'full_time', 'part_time', 'contract');
CREATE TYPE job_status AS ENUM ('open', 'closed', 'in_review');

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    industry TEXT,
    website_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Listings
CREATE TABLE job_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type job_type NOT NULL,
    location TEXT,
    salary_range NUMRANGE,
    required_skills TEXT[],
    minimum_gpa NUMERIC(3, 2),
    application_deadline DATE,
    status job_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Applications
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_listing_id UUID REFERENCES job_listings(id),
    student_id UUID REFERENCES auth.users(id),
    resume_url TEXT,
    cover_letter TEXT,
    application_status TEXT DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_listing_id, student_id)
);

-- Matching Preferences
CREATE TABLE student_job_preferences (
    student_id UUID PRIMARY KEY REFERENCES auth.users(id),
    preferred_industries TEXT[],
    preferred_job_types job_type[],
    minimum_salary NUMERIC(10, 2),
    desired_locations TEXT[]
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_job_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Companies
CREATE POLICY "Administrators can manage companies"
ON companies
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- RLS Policies for Job Listings
CREATE POLICY "Companies can manage their job listings"
ON job_listings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = job_listings.company_id
        AND companies.verified = true
    )
);

CREATE POLICY "All users can view open job listings"
ON job_listings
FOR SELECT
USING (status = 'open');

-- RLS Policies for Job Applications
CREATE POLICY "Students can create their applications"
ON job_applications
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view their own applications"
ON job_applications
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Companies can view applications for their listings"
ON job_applications
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM job_listings jl
        JOIN companies c ON jl.company_id = c.id
        WHERE c.id = (SELECT company_id FROM job_listings WHERE id = job_applications.job_listing_id)
        AND c.verified = true
    )
);

-- RLS Policies for Student Preferences
CREATE POLICY "Students can manage their preferences"
ON student_job_preferences
FOR ALL
USING (student_id = auth.uid());