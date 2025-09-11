const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test with both anon key (what the app uses) and service role key
const supabaseAnon = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const supabaseService = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDepartmentCreation() {
  console.log('🧪 Testing Department Creation with Different Auth Levels\n');
  console.log('='.repeat(55));
  
  try {
    // Test 1: With anon key (what the app actually uses)
    console.log('\n1️⃣  Testing with ANON KEY (app configuration)...');
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('departments')
      .insert({
        name: 'Test Anon Department',
        code: 'ANON',
        description: 'Test with anon key'
      })
      .select()
      .single();
    
    if (anonError) {
      console.log('❌ ANON KEY FAILED:', anonError.message);
      console.log('   This is likely the source of your application error');
    } else {
      console.log('✅ ANON KEY SUCCESS:', anonData);
      // Clean up
      await supabaseService.from('departments').delete().eq('id', anonData.id);
    }
    
    // Test 2: With service role key
    console.log('\n2️⃣  Testing with SERVICE ROLE KEY...');
    
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('departments')
      .insert({
        name: 'Test Service Department',
        code: 'SERVICE',
        description: 'Test with service role'
      })
      .select()
      .single();
    
    if (serviceError) {
      console.log('❌ SERVICE ROLE FAILED:', serviceError.message);
    } else {
      console.log('✅ SERVICE ROLE SUCCESS:', serviceData);
      // Clean up
      await supabaseService.from('departments').delete().eq('id', serviceData.id);
    }
    
    // Test 3: Check if user is authenticated in the app
    console.log('\n3️⃣  Checking authentication status...');
    
    const { data: user, error: userError } = await supabaseAnon.auth.getUser();
    
    if (userError || !user.user) {
      console.log('❌ NO AUTHENTICATED USER');
      console.log('   This is likely the root cause!');
      console.log('   The app needs a logged-in user to create departments');
    } else {
      console.log('✅ USER AUTHENTICATED:', user.user.email);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

async function checkRLSPolicies() {
  console.log('\n🔒 Checking RLS Policy Configuration...');
  console.log('='.repeat(40));
  
  try {
    // Check if RLS is enabled on departments table
    const { data: rlsStatus, error: rlsError } = await supabaseService
      .rpc('check_rls_status', { table_name: 'departments' });
    
    if (rlsError) {
      console.log('Could not check RLS status directly');
    }
    
    console.log('\n💡 LIKELY SOLUTIONS:');
    console.log('1. Ensure user is logged in before creating departments');
    console.log('2. Check RLS policies on departments table');
    console.log('3. Verify the policies don\'t create circular references');
    
  } catch (error) {
    console.log('RLS check failed:', error.message);
  }
}

async function main() {
  await testDepartmentCreation();
  await checkRLSPolicies();
  
  console.log('\n🔧 RECOMMENDED FIXES:');
  console.log('='.repeat(25));
  console.log('1. Make sure user is logged in before accessing registrar dashboard');
  console.log('2. Add authentication check in DepartmentManagement component');
  console.log('3. Update RLS policies to be simpler and non-recursive');
  console.log('4. Consider temporarily disabling RLS for development');
}

main().catch(console.error);
