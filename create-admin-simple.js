import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

console.log('🚀 Creating admin user in Supabase...');

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const adminEmail = 'admin@tvetkenya.com';
    const adminPassword = 'admin123';
    
    try {
        console.log('📝 Creating user in Supabase auth...');
        
        // Create user using admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                role: 'admin',
                first_name: 'System',
                last_name: 'Administrator',
                full_name: 'System Administrator'
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('⚠️  User already exists in auth. Checking existing user...');
                
                // List users to find existing one
                const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                
                if (listError) {
                    console.error('❌ Error listing users:', listError.message);
                    return;
                }
                
                const existingUser = listData.users.find(u => u.email === adminEmail);
                if (existingUser) {
                    console.log('✅ Found existing user:');
                    console.log('   ID:', existingUser.id);
                    console.log('   Email:', existingUser.email);
                    console.log('   Created:', existingUser.created_at);
                } else {
                    console.log('❌ Could not find existing user');
                }
            } else {
                console.error('❌ Error creating user:', authError.message);
                return;
            }
        } else {
            console.log('✅ Admin user created successfully!');
            console.log('   ID:', authData.user.id);
            console.log('   Email:', authData.user.email);
            console.log('   Created:', authData.user.created_at);
            console.log('   Email Confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
        }

        console.log('');
        console.log('🎉 Admin creation complete!');
        console.log('');
        console.log('📊 Check your Supabase dashboard:');
        console.log('   Users: https://supabase.com/dashboard/project/ympnvccreuhxouyovszg/auth/users');
        console.log('');
        console.log('🔑 Login credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('   Login URL: http://localhost:5176/supabase-login');

        // Test login to make sure it works
        console.log('');
        console.log('🧪 Testing login...');
        
        const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
        });

        if (loginError) {
            console.log('⚠️  Login test failed:', loginError.message);
        } else {
            console.log('✅ Login test successful!');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

createAdmin();
