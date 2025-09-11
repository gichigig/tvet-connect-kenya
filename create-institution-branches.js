const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createInstitutionBranchesTable() {
  try {
    console.log('Creating institution_branches table...');
    
    const sql = fs.readFileSync('create-institution-branches-table.sql', 'utf8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error creating table:', error);
      return;
    }
    
    console.log('✅ Institution branches table created successfully!');
    
    // Test the table by inserting a sample record
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
      console.error('Error testing table:', testError);
    } else {
      console.log('✅ Test record created:', testData);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

createInstitutionBranchesTable();
