import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

console.log('🔧 Fixing admin user login issue...');

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminLogin() {
    try {
        console.log('1️⃣ Getting all users from auth.users...');
        
        // Get all users from auth
        const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (usersError) {
            console.error('❌ Error getting users:', usersError.message);
            return;
        }

        console.log(`📊 Found ${users.users.length} users in auth.users`);
        
        // Find admin users
        const adminUsers = users.users.filter(user => 
            user.email?.includes('admin') || 
            user.email?.includes('nimwaske') ||
            user.user_metadata?.role === 'admin'
        );

        console.log(`👑 Found ${adminUsers.length} potential admin users`);

        for (const user of adminUsers) {
            console.log(`\n🔍 Processing user: ${user.email} (ID: ${user.id})`);
            
            // Check if profile already exists
            const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileCheckError && profileCheckError.code !== 'PGRST116') {
                console.log('⚠️  Error checking profile:', profileCheckError.message);
                continue;
            }

            if (existingProfile) {
                console.log('✅ Profile already exists, updating role...');
                
                // Update existing profile to ensure admin role
                const { error: updateError } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        role: 'admin',
                        approved: true,
                        first_name: user.user_metadata?.first_name || 'System',
                        last_name: user.user_metadata?.last_name || 'Administrator',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (updateError) {
                    console.log('❌ Error updating profile:', updateError.message);
                } else {
                    console.log('✅ Profile updated successfully');
                }
            } else {
                console.log('📝 Creating new profile...');
                
                // Create new profile
                const { error: insertError } = await supabaseAdmin
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        first_name: user.user_metadata?.first_name || 'System',
                        last_name: user.user_metadata?.last_name || 'Administrator',
                        role: 'admin',
                        approved: true,
                        username: user.email.split('@')[0],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.log('❌ Error creating profile:', insertError.message);
                    console.log('Error details:', insertError);
                } else {
                    console.log('✅ Profile created successfully');
                }
            }
        }

        console.log('\n🎉 Admin user fix complete!');
        console.log('\n🧪 Testing login...');
        
        // Test login for the main admin user
        const testEmail = 'nimwaske@gmail.com';
        const testPassword = 'admin123';
        
        const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError) {
            console.log('❌ Login test failed:', loginError.message);
            console.log('');
            console.log('🔧 Manual steps to fix:');
            console.log('1. Go to Supabase Dashboard > SQL Editor');
            console.log('2. Run this SQL:');
            console.log('');
            console.log(`INSERT INTO profiles (id, email, first_name, last_name, role, approved, username, created_at, updated_at)`);
            console.log(`SELECT id, email, raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name', 'admin', true, split_part(email, '@', 1), now(), now()`);
            console.log(`FROM auth.users WHERE email = '${testEmail}';`);
        } else {
            console.log('✅ Login test successful!');
            console.log('User can now login at: http://localhost:5176/supabase-login');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

fixAdminLogin();
