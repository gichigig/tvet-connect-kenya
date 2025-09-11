import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

console.log('Testing Node.js connectivity to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNodeConnectivity() {
  try {
    console.log('1. Testing basic connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' })
      .limit(1);
      
    if (error) {
      console.error('❌ Database query failed:', error);
      return false;
    } else {
      console.log('✅ Database query successful. Profile count:', data?.length || 0);
    }
    
    console.log('2. Testing auth service...');
    
    // Test auth service
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth service error:', authError);
    } else {
      console.log('✅ Auth service accessible');
    }
    
    console.log('3. Testing profiles table structure...');
    
    // Test table structure
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Profiles table access failed:', profileError);
    } else {
      console.log('✅ Profiles table accessible');
      if (profileData && profileData.length > 0) {
        console.log('Available columns:', Object.keys(profileData[0]));
      }
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Network/Connection error:', err.message);
    console.error('Error details:', err);
    return false;
  }
}

testNodeConnectivity()
  .then(success => {
    if (success) {
      console.log('\n🎉 Node.js connectivity test PASSED!');
    } else {
      console.log('\n💥 Node.js connectivity test FAILED!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  });
