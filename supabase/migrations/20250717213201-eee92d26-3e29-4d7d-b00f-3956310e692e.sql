-- Digital Certificates and Transcripts
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id),
    certificate_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    issue_date DATE NOT NULL,
    qr_code TEXT UNIQUE,
    verification_hash TEXT UNIQUE,
    pdf_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcripts
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id),
    academic_year TEXT NOT NULL,
    semester INTEGER NOT NULL,
    gpa NUMERIC(3, 2),
    total_credits INTEGER,
    status TEXT DEFAULT 'draft',
    generated_at TIMESTAMP WITH TIME ZONE,
    qr_code TEXT UNIQUE,
    verification_hash TEXT UNIQUE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, academic_year, semester)
);

-- Unit Grades for Transcripts
CREATE TABLE transcript_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID REFERENCES transcripts(id),
    unit_code TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    grade TEXT NOT NULL,
    points NUMERIC(3, 1),
    lecturer_name TEXT
);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Certificates
CREATE POLICY "Students can view their own certificates"
ON certificates
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Administrators can manage all certificates"
ON certificates
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'registrar')
    )
);

-- RLS Policies for Transcripts
CREATE POLICY "Students can view their own transcripts"
ON transcripts
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Administrators can manage all transcripts"
ON transcripts
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'registrar')
    )
);

-- RLS Policies for Transcript Grades
CREATE POLICY "Students can view their transcript grades"
ON transcript_grades
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM transcripts
        WHERE transcripts.id = transcript_grades.transcript_id
        AND transcripts.student_id = auth.uid()
    )
);

CREATE POLICY "Administrators can manage transcript grades"
ON transcript_grades
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'registrar')
    )
);

-- Create verification function
CREATE OR REPLACE FUNCTION generate_verification_hash()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(random()::text || now()::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate verification hash for certificates
CREATE OR REPLACE FUNCTION auto_generate_certificate_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_hash IS NULL THEN
        NEW.verification_hash = generate_verification_hash();
    END IF;
    IF NEW.qr_code IS NULL THEN
        NEW.qr_code = 'CERT-' || substring(NEW.verification_hash, 1, 12);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_certificate_verification
BEFORE INSERT ON certificates
FOR EACH ROW
EXECUTE FUNCTION auto_generate_certificate_hash();

-- Trigger to auto-generate verification hash for transcripts
CREATE OR REPLACE FUNCTION auto_generate_transcript_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_hash IS NULL THEN
        NEW.verification_hash = generate_verification_hash();
    END IF;
    IF NEW.qr_code IS NULL THEN
        NEW.qr_code = 'TRANS-' || substring(NEW.verification_hash, 1, 12);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_transcript_verification
BEFORE INSERT ON transcripts
FOR EACH ROW
EXECUTE FUNCTION auto_generate_transcript_hash();