import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🧪 Testing admin user creation...');

async function testUserCreation() {
  try {
    const testEmail = `test${Date.now()}@example.com`;
    
    console.log('Creating user:', testEmail);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Error:', authError);
      return false;
    }

    console.log('✅ User created successfully!');
    console.log('Email confirmed:', authData.user.email_confirmed_at ? 'YES' : 'NO');
    
    // Cleanup
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Cleanup complete');
    
    return true;
    
  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

testUserCreation()
  .then(success => {
    console.log(success ? '🎉 TEST PASSED!' : '💥 TEST FAILED!');
    process.exit(success ? 0 : 1);
  });
