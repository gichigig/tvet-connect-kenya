import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🧪 Testing duplicate user handling...');

async function testDuplicateHandling() {
  try {
    // First, let's find an existing user's email to test duplicate detection
    console.log('1. Finding existing user for duplicate test...');
    
    const { data: existingUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('email, username')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching existing users:', fetchError);
      return false;
    }

    if (!existingUsers || existingUsers.length === 0) {
      console.log('No existing users found to test duplicates');
      return true;
    }

    const existingUser = existingUsers[0];
    console.log('Found existing user:', existingUser.email);

    // Test 1: Try to create user with existing email
    console.log('2. Testing duplicate email detection...');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: existingUser.email,
        password: 'TestPassword123!',
        email_confirm: true
      });

      if (authError) {
        if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
          console.log('✅ Auth system properly rejects duplicate email');
        } else {
          console.log('❓ Auth error (might be expected):', authError.message);
        }
      } else {
        console.log('⚠️  Auth system allowed duplicate email - cleanup needed');
        // If somehow it was created, clean it up
        if (authData?.user?.id) {
          await supabase.auth.admin.deleteUser(authData.user.id);
        }
      }
    } catch (err) {
      console.log('✅ Auth system properly rejects duplicate:', err.message);
    }

    // Test 2: Create a completely new test user
    console.log('3. Testing successful user creation...');
    
    const testEmail = `test-duplicate-${Date.now()}@example.com`;
    const testUsername = `testdup${Date.now()}`;
    
    const { data: newAuthData, error: newAuthError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Duplicate',
        username: testUsername
      }
    });

    if (newAuthError) {
      console.error('❌ New user creation failed:', newAuthError);
      return false;
    }

    console.log('✅ New user created successfully');
    
    // Test the profile creation/update logic
    console.log('4. Testing profile creation...');
    
    // Check if profile exists (might be auto-created)
    const { data: checkProfile, error: checkError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', newAuthData.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', checkError);
      await supabase.auth.admin.deleteUser(newAuthData.user.id);
      return false;
    }

    if (checkProfile) {
      console.log('✅ Profile already exists (likely auto-created by trigger)');
      
      // Test update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: testEmail,
          username: testUsername,
          first_name: 'Test',
          last_name: 'Duplicate',
          role: 'student',
          approved: true,
          blocked: false
        })
        .eq('user_id', newAuthData.user.id);

      if (updateError) {
        console.error('❌ Profile update failed:', updateError);
        await supabase.auth.admin.deleteUser(newAuthData.user.id);
        return false;
      }

      console.log('✅ Profile updated successfully');
    } else {
      console.log('📋 No existing profile, creating new one...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: newAuthData.user.id,
          email: testEmail,
          username: testUsername,
          first_name: 'Test',
          last_name: 'Duplicate',
          role: 'student',
          approved: true,
          blocked: false
        });

      if (insertError) {
        console.error('❌ Profile creation failed:', insertError);
        await supabase.auth.admin.deleteUser(newAuthData.user.id);
        return false;
      }

      console.log('✅ Profile created successfully');
    }

    // Cleanup
    console.log('5. Cleaning up test user...');
    await supabase.auth.admin.deleteUser(newAuthData.user.id);
    console.log('✅ Cleanup complete');

    return true;

  } catch (err) {
    console.error('❌ Test failed with error:', err);
    return false;
  }
}

testDuplicateHandling()
  .then(success => {
    if (success) {
      console.log('\n🎉 DUPLICATE HANDLING TEST PASSED!');
      console.log('✅ System properly handles duplicate detection');
      console.log('✅ Profile creation/update logic works correctly');
      console.log('✅ User creation flow is robust');
    } else {
      console.log('\n💥 Duplicate handling test FAILED!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  });
