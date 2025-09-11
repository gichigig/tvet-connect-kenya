const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dfxfudddgcsnuqjsptqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGZ1ZGRkZ2NzbnVxanNwdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY2NTI0NiwiZXhwIjoyMDQ2MjQxMjQ2fQ.jJJi9N3FgvTnhUKdHIjwCPqoG7lPDZjHGzaD0q-DXGM'
);

async function testBranchCreation() {
  try {
    console.log('🧪 Testing institution branch creation...');
    
    // Get admin user for created_by
    const { data: adminUsers, error: userError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1);

    if (userError) {
      console.error('❌ Error getting admin user:', userError);
      return;
    }

    const createdBy = adminUsers && adminUsers.length > 0 ? adminUsers[0].user_id : 'test-user-id';
    console.log('👤 Using created_by:', createdBy);

    // Test data that matches our schema
    const testBranch = {
      name: 'Test Branch',
      code: 'TB001',
      address: '123 Test Street',
      city: 'Test City',
      region: 'Test Region',
      phone: '+254700000000',
      email: 'test@branch.com',
      status: 'active',
      created_by: createdBy
    };

    console.log('📤 Attempting to insert:', testBranch);

    const { data, error } = await supabase
      .from('institution_branches')
      .insert([testBranch])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating branch:', error);
    } else {
      console.log('✅ Branch created successfully:', data);
      
      // Clean up - delete the test branch
      const { error: deleteError } = await supabase
        .from('institution_branches')
        .delete()
        .eq('id', data.id);
        
      if (deleteError) {
        console.warn('⚠️ Could not clean up test branch:', deleteError);
      } else {
        console.log('🧹 Test branch cleaned up');
      }
    }

  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

testBranchCreation();
