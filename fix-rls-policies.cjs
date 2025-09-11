const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies to prevent infinite recursion...\n');
  
  try {
    // First, let's check what policies exist on the departments table
    console.log('1. Checking existing policies on departments table...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'departments');
    
    if (policiesError) {
      console.log('Could not query policies directly. Proceeding with fix...\n');
    } else {
      console.log('Existing policies:', policies);
    }
    
    // Let's try to create a department directly to see the exact error
    console.log('2. Testing department creation...');
    
    const { data: testData, error: testError } = await supabase
      .from('departments')
      .insert({
        name: 'Test Department',
        code: 'TEST',
        description: 'Test department for RLS fix'
      })
      .select()
      .single();
    
    if (testError) {
      console.log('Error details:', testError);
      
      // The error suggests the issue is with profiles table RLS, not departments
      // Let's try to fix the profiles table RLS policy
      console.log('\n3. The issue appears to be with profiles table RLS...');
      console.log('   This suggests the departments table might have a policy that references profiles');
      console.log('   and the profiles table has a recursive policy.\n');
      
      // Let's try a simpler approach - temporarily disable RLS on departments for testing
      console.log('4. Testing with service role key (should bypass RLS)...');
      
      // Since we're using service role key, RLS should be bypassed
      // If we still get this error, it means the policy itself has a logic error
      
      console.log('5. Suggested fix: Check and update RLS policies in Supabase Dashboard');
      console.log('\nGo to Supabase Dashboard > Authentication > Policies and:');
      console.log('- Review the "profiles" table policies');
      console.log('- Look for any policy that might reference itself');
      console.log('- Simplify the policies to avoid circular references');
      console.log('\nCommon problematic policy patterns:');
      console.log('- auth.uid() = profiles.user_id WHERE profiles.id = auth.uid()');
      console.log('- Policies that query the same table they\'re protecting');
      
    } else {
      console.log('✅ Department created successfully:', testData);
      
      // Clean up test data
      await supabase.from('departments').delete().eq('id', testData.id);
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

async function createSimplePolicies() {
  console.log('\n🛠️  Creating simple, non-recursive RLS policies...\n');
  
  const policies = [
    {
      table: 'departments',
      name: 'departments_select_policy',
      operation: 'SELECT',
      policy: 'true' // Allow all users to read departments
    },
    {
      table: 'departments',
      name: 'departments_insert_policy', 
      operation: 'INSERT',
      policy: 'auth.role() = \'authenticated\'' // Allow authenticated users to insert
    },
    {
      table: 'departments',
      name: 'departments_update_policy',
      operation: 'UPDATE', 
      policy: 'auth.role() = \'authenticated\''
    },
    {
      table: 'departments',
      name: 'departments_delete_policy',
      operation: 'DELETE',
      policy: 'auth.role() = \'authenticated\''
    }
  ];
  
  console.log('Recommended policies for departments table:');
  policies.forEach(policy => {
    console.log(`- ${policy.name}: ${policy.operation} using (${policy.policy})`);
  });
  
  console.log('\nTo apply these policies:');
  console.log('1. Go to Supabase Dashboard > Database > Tables > departments');
  console.log('2. Click on "RLS" tab');
  console.log('3. Delete existing problematic policies');
  console.log('4. Create new policies with the above configurations');
}

async function main() {
  console.log('🔍 SUPABASE RLS POLICY DIAGNOSTIC\n');
  console.log('='.repeat(40));
  
  await fixRLSPolicies();
  await createSimplePolicies();
  
  console.log('\n📋 IMMEDIATE ACTIONS NEEDED:');
  console.log('1. Go to Supabase Dashboard');
  console.log('2. Navigate to Database > Tables > profiles');
  console.log('3. Check RLS policies for circular references');
  console.log('4. Simplify or disable problematic policies');
  console.log('5. Test department creation again');
}

main().catch(console.error);
