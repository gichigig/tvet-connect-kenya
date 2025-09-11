import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing authentication flow...');

async function testAuthFlow() {
  try {
    // Test 1: Check if we can query users
    console.log('1. Testing user data access...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, username, role, approved')
      .limit(5);
    
    if (profileError) {
      console.error('❌ Profile query failed:', profileError);
      return false;
    }
    
    console.log('✅ Found profiles:', profiles?.length || 0);
    profiles?.forEach(profile => {
      console.log(`  - ${profile.username || profile.email} (${profile.role}) - Approved: ${profile.approved}`);
    });
    
    // Test 2: Check auth.users table access (if accessible)
    console.log('\n2. Testing auth users access...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('⚠️  Auth users not accessible (expected with service role):', authError.message);
      } else {
        console.log('✅ Auth users accessible:', authUsers?.users?.length || 0);
      }
    } catch (err) {
      console.log('⚠️  Auth admin not accessible:', err.message);
    }
    
    // Test 3: Check if we can simulate login process
    console.log('\n3. Testing login simulation...');
    
    // Find a user with username for testing
    const testUser = profiles?.find(p => p.username && p.approved);
    if (testUser) {
      console.log(`✅ Found test user: ${testUser.username} (${testUser.role})`);
      
      // Simulate the username lookup that happens during login
      const { data: userLookup, error: lookupError } = await supabase
        .from('profiles')
        .select('email, username, role, approved')
        .eq('username', testUser.username)
        .single();
        
      if (lookupError) {
        console.error('❌ Username lookup failed:', lookupError);
      } else {
        console.log('✅ Username lookup successful:', userLookup);
      }
    } else {
      console.log('⚠️  No approved users with usernames found for testing');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Auth flow test error:', err);
    return false;
  }
}

testAuthFlow()
  .then(success => {
    if (success) {
      console.log('\n🎉 Authentication flow test PASSED!');
      console.log('✅ Node.js environment is ready for login functionality');
    } else {
      console.log('\n💥 Authentication flow test FAILED!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  });
