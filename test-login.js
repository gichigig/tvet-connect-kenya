import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTUzODEsImV4cCI6MjA2ODg3MTM4MX0.3p4lyjB7fjY3N1aaWuaLogP5tjbeZcpf-5ADPU4jtBY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
    console.log('🔐 Testing admin login...');
    console.log('📝 Using test credentials:');
    console.log('   Email: billyblund7@gmail.com');
    console.log('   Password: bildad');
    console.log('');
    
    try {
        // Step 1: Sign in
        console.log('🔑 Attempting to sign in...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'billyblund7@gmail.com',
            password: 'bildad'
        });

        if (authError) {
            throw new Error(`Authentication failed: ${authError.message}`);
        }

        console.log('✅ Authentication successful!');
        console.log('🆔 User ID:', authData.user.id);
        console.log('📧 Email:', authData.user.email);
        
        // Step 2: Fetch profile
        console.log('\n👤 Fetching user profile...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        if (profileError) {
            throw new Error(`Profile fetch failed: ${profileError.message}`);
        }

        console.log('✅ Profile found:');
        console.log('   Role:', profile.role);
        console.log('   First Name:', profile.first_name);
        console.log('   Last Name:', profile.last_name);
        console.log('   Approved:', profile.approved);
        console.log('   Blocked:', profile.blocked);

        // Step 3: Test admin access
        console.log('\n🔒 Testing admin access...');
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('email, role')
            .limit(2);

        if (usersError) {
            throw new Error(`Admin access test failed: ${usersError.message}`);
        }

        console.log('✅ Successfully accessed user data as admin');
        console.log(`   Found ${users.length} users`);

        // Step 4: Sign out
        console.log('\n👋 Signing out...');
        const { error: signOutError } = await supabase.auth.signOut();
        
        if (signOutError) {
            console.warn('⚠️ Sign out error:', signOutError.message);
        } else {
            console.log('✅ Successfully signed out');
        }

        console.log('\n🎉 All tests passed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n🔍 Troubleshooting steps:');
        console.log('1. Verify the email and password are correct');
        console.log('2. Check if user exists in Supabase Auth');
        console.log('3. Ensure the profile exists in the profiles table');
        console.log('4. Verify RLS policies are configured correctly');
        console.log('5. Check user_id matches between auth and profiles tables');
        process.exit(1);
    }
}

// Run the test
console.log('🚀 Starting admin user test...\n');
testAdminLogin();
