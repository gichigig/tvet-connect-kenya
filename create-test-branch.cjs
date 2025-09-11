const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dfxfudddgcsnuqjsptqh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGZ1ZGRkZ2NzbnVxanNwdHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY2NTI0NiwiZXhwIjoyMDQ2MjQxMjQ2fQ.jJJi9N3FgvTnhUKdHIjwCPqoG7lPDZjHGzaD0q-DXGM'
);

async function createTestInstitutionBranch() {
  try {
    console.log('🏢 Creating test institution branch...');
    
    // Get the first admin user to be the creator
    const { data: adminUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (userError) {
      console.error('❌ Error getting admin user:', userError);
      return;
    }

    if (!adminUser) {
      console.log('📝 No admin user found. Creating with dummy creator ID');
      // Use a dummy creator ID if no admin found
    }

    const creatorId = adminUser?.user_id || 'dummy-creator-id';
    console.log('👤 Using creator ID:', creatorId);

    // Create test institution branch
    const branchData = {
      name: 'Main Campus',
      location: 'Nairobi Central',
      contact_email: 'maincampus@university.ac.ke',
      contact_phone: '+254712345678',
      address: '123 University Way, Nairobi',
      capacity: 1000,
      established_year: 2010,
      created_by: creatorId
    };

    const { data, error } = await supabase
      .from('institution_branches')
      .insert([branchData])
      .select();

    if (error) {
      console.error('❌ Error creating institution branch:', error);
      return;
    }

    console.log('✅ Institution branch created successfully:', data[0]);

    // Verify by checking all branches
    console.log('\n🔍 Checking all institution branches...');
    const { data: allBranches, error: fetchError } = await supabase
      .from('institution_branches')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching branches:', fetchError);
      return;
    }

    console.log('📊 Total branches found:', allBranches?.length || 0);
    if (allBranches && allBranches.length > 0) {
      allBranches.forEach((branch, i) => {
        console.log(`   ${i+1}. ${branch.name} (${branch.location}) - Created by: ${branch.created_by}`);
      });
    }

  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

createTestInstitutionBranch();
