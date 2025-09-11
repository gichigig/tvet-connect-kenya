const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dfxfudddgcsnuqjsptqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGZ1ZGRkZ2NzbnVxanNwdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY2NTI0NiwiZXhwIjoyMDQ2MjQxMjQ2fQ.jJJi9N3FgvTnhUKdHIjwCPqoG7lPDZjHGzaD0q-DXGM'
);

async function checkTableSchema() {
  try {
    console.log('🔍 Checking institution_branches table schema...');
    
    // Try to get one row to see the actual structure
    const { data, error } = await supabase
      .from('institution_branches')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Table exists. Sample row structure:', data);
      if (data && data.length > 0) {
        console.log('📋 Available columns:', Object.keys(data[0]));
      } else {
        console.log('📝 Table is empty');
      }
    }
    
    // Also try to see all tables
    console.log('\n🗂️ Checking all available tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('Could not get table names via RPC');
    } else {
      console.log('Available tables:', tables);
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

checkTableSchema();
