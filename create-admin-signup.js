import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTUzODEsImV4cCI6MjA2ODg3MTM4MX0.3p4lyjB7fjY3N1aaWuaLogP5tjbeZcpf-5ADPU4jtBY';

console.log('🚀 Creating admin user via regular signup...');

// Create regular Supabase client (like frontend would use)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminViaSignup() {
    const adminEmail = 'admin@tvetkenya.com';
    const adminPassword = 'admin123';
    
    try {
        console.log('📝 Signing up admin user...');
        
        // Sign up the user normally (this creates them in auth.users)
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
                data: {
                    role: 'admin',
                    first_name: 'System',
                    last_name: 'Administrator'
                }
            }
        });

        if (signupError) {
            if (signupError.message.includes('already registered')) {
                console.log('⚠️  User already exists. Trying to sign in...');
                
                // Try to sign in
                const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
                    email: adminEmail,
                    password: adminPassword
                });

                if (signinError) {
                    console.log('❌ Sign in failed:', signinError.message);
                    console.log('');
                    console.log('💡 Manual steps to create admin:');
                    console.log('1. Go to Supabase dashboard > Authentication > Users');
                    console.log('2. Click "Add user"');
                    console.log(`3. Email: ${adminEmail}`);
                    console.log(`4. Password: ${adminPassword}`);
                    console.log('5. Auto Confirm User: Yes');
                    console.log('6. Send Email Confirmation: No');
                    return;
                } else {
                    console.log('✅ Existing user signed in successfully!');
                    console.log('   User ID:', signinData.user.id);
                    console.log('   Email:', signinData.user.email);
                }
            } else {
                console.error('❌ Signup error:', signupError.message);
                return;
            }
        } else {
            console.log('✅ User created successfully!');
            console.log('   User ID:', signupData.user?.id);
            console.log('   Email:', signupData.user?.email);
            console.log('   Session:', signupData.session ? 'Created' : 'None (email confirmation needed)');
        }

        console.log('');
        console.log('🎉 Admin user creation process complete!');
        console.log('');
        console.log('📊 Check your Supabase dashboard:');
        console.log('   Users: https://supabase.com/dashboard/project/ympnvccreuhxouyovszg/auth/users');
        console.log('');
        console.log('🔑 Credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('   Login: http://localhost:5176/supabase-login');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Check Supabase Users dashboard to confirm user exists');
        console.log('2. If needed, manually confirm the email in the dashboard');
        console.log('3. Create a profile entry in the profiles table if using one');
        console.log('4. Test login on your app');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

createAdminViaSignup();
