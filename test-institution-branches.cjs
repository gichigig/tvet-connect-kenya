const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function createInstitutionBranchesTable() {
  try {
    console.log('Creating institution_branches table...');
    
    // Create the table manually by inserting into the schema
    // Since we can't execute raw SQL, let's try creating it via supabase admin
    
    // For now, let's just test if we can create a record in case the table exists
    const { data: testData, error: testError } = await supabase
      .from('institution_branches')
      .insert({
        name: 'Main Campus',
        code: 'MAIN',
        address: 'University Way, Nairobi',
        city: 'Nairobi',
        region: 'Central',
        phone: '+254-20-1234567',
        email: 'main@tvet.ac.ke'
      })
      .select()
      .single();
    
    if (testError) {
      console.error('Table does not exist. Error:', testError.message);
      console.log('You need to create the institution_branches table in Supabase Dashboard using the SQL:');
      console.log(`
CREATE TABLE institution_branches (
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

ALTER TABLE institution_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON institution_branches FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON institution_branches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON institution_branches FOR UPDATE USING (auth.role() = 'authenticated');
      `);
    } else {
      console.log('✅ Table exists and test record created:', testData);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

createInstitutionBranchesTable();
