const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ympnvccreuhxouyovszg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY'
);

async function checkTables() {
  try {
    console.log('🏢 Checking institution_branches table...');
    const { data, error } = await supabase.from('institution_branches').select('*').limit(1);
    if (error) {
      console.log('❌ institution_branches table error:', error.message);
    } else {
      console.log('✅ institution_branches table exists');
    }
    
    console.log('📚 Checking units table...');
    const { data: units, error: unitsError } = await supabase.from('units').select('*').limit(1);
    if (unitsError) {
      console.log('❌ units table error:', unitsError.message);
    } else {
      console.log('✅ units table exists');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
}

checkTables();
