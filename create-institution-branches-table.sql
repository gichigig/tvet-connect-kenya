-- Create institution_branches table
CREATE TABLE IF NOT EXISTS institution_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR NOT NULL,
  region VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE institution_branches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON institution_branches
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON institution_branches
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON institution_branches
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_institution_branches_updated_at BEFORE UPDATE
    ON institution_branches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
