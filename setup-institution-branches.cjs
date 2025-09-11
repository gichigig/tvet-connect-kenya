const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dfxfudddgcsnuqjsptqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGZ1ZGRkZ2NzbnVxanNwdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY2NTI0NiwiZXhwIjoyMDQ2MjQxMjQ2fQ.jJJi9N3FgvTnhUKdHIjwCPqoG7lPDZjHGzaD0q-DXGM'
);

async function setupInstitutionBranches() {
  try {
    console.log('🔧 Setting up institution_branches table...');
    
    // First, try to access the table to see if it exists
    console.log('1️⃣ Checking if institution_branches table exists...');
    const { data: existingData, error: existingError } = await supabase
      .from('institution_branches')
      .select('*')
      .limit(1);
    
    if (existingError && existingError.code === 'PGRST106') {
      console.log('❌ Table does not exist. Creating it via SQL...');
      
      // Create the table using raw SQL
      const createTableSQL = `
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
      `;
      
      const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });
      
      if (sqlError) {
        console.error('❌ Could not create table via RPC:', sqlError);
        console.log('📝 You need to manually create the table in Supabase Dashboard:');
        console.log(createTableSQL);
        return;
      }
      
      console.log('✅ Table created successfully');
      
    } else if (existingError) {
      console.error('❌ Other error accessing table:', existingError);
      return;
    } else {
      console.log('✅ Table already exists');
    }
    
    // Test creating a sample branch
    console.log('2️⃣ Testing branch creation...');
    
    // Get a user for created_by
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    const createdBy = users && users.length > 0 ? users[0].user_id : 'dummy-id';
    
    const testBranch = {
      name: 'Main Campus',
      code: 'MAIN01',
      address: '123 University Avenue',
      city: 'Nairobi',
      region: 'Nairobi County',
      phone: '+254712345678',
      email: 'main@university.ac.ke',
      status: 'active',
      created_by: createdBy
    };
    
    const { data: branchData, error: branchError } = await supabase
      .from('institution_branches')
      .insert([testBranch])
      .select()
      .single();
    
    if (branchError) {
      console.error('❌ Error creating test branch:', branchError);
    } else {
      console.log('✅ Test branch created successfully:', branchData);
      
      // Clean up
      await supabase.from('institution_branches').delete().eq('id', branchData.id);
      console.log('🧹 Cleaned up test branch');
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

setupInstitutionBranches();
