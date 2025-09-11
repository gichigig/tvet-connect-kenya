const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dfxfudddgcsnuqjsptqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGZ1ZGRkZ2NzbnVxanNwdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY2NTI0NiwiZXhwIjoyMDQ2MjQxMjQ2fQ.jJJi9N3FgvTnhUKdHIjwCPqoG7lPDZjHGzaD0q-DXGM'
);

async function checkTableExists() {
  try {
    console.log('🔍 Checking if institution_branches table exists...');
    
    // Try to describe the table structure
    const { data, error } = await supabase
      .from('institution_branches')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Table may not exist or has permission issues:', error);
      
      // Let's try to get a list of tables we can access
      console.log('\n📋 Checking accessible tables...');
      const tables = [
        'profiles', 'departments', 'courses', 'units', 
        'students', 'lecturers', 'institutions', 
        'institution_branches', 'enrollments'
      ];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`❌ ${table}: ${error.message}`);
          } else {
            console.log(`✅ ${table}: accessible`);
            if (data && data.length > 0) {
              console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`);
            }
          }
        } catch (err) {
          console.log(`💥 ${table}: ${err.message}`);
        }
      }
    } else {
      console.log('✅ institution_branches table exists and is accessible');
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

checkTableExists();
