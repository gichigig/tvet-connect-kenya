const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ympnvccreuhxouyovszg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY'
);

async function testDb() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('departments').select('*').limit(5);
    if (error) {
      console.log('❌ Database error:', error.message);
      return;
    }
    
    console.log('✅ Database connected successfully');
    console.log('📊 Found', data.length, 'departments');
    if (data.length > 0) {
      console.log('🏢 Departments:');
      data.forEach(d => {
        console.log(`  - ${d.name} (${d.code})`);
        console.log(`    Fields:`, Object.keys(d));
        console.log(`    Full data:`, d);
      });
    }
    
    // Test creating a department
    console.log('\n🧪 Testing department creation...');
    const testDept = {
      name: 'Test Department',
      code: 'TEST001',
      description: 'Test department for connectivity check'
    };
    
    const { data: newDept, error: createError } = await supabase
      .from('departments')
      .insert(testDept)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Create error:', createError.message);
    } else {
      console.log('✅ Department created successfully:', newDept.name);
      
      // Clean up test data
      await supabase.from('departments').delete().eq('id', newDept.id);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testDb();
