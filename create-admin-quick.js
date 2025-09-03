import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminQuick() {
    const adminEmail = 'billyblund17@gmail.com';
    const adminPassword = 'bildad';

    console.log('🚀 Quick admin creation for:', adminEmail);

    try {
        // Step 1: Create user in auth.users
        console.log('1️⃣ Creating auth user...');
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
                role: 'admin',
                first_name: 'Billy',
                last_name: 'Admin'
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('✅ User already exists in auth.users');
                
                // Get the existing user
                const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = users.users.find(u => u.email === adminEmail);
                
                if (existingUser) {
                    console.log('👤 Found existing user ID:', existingUser.id);
                    await createProfile(existingUser.id, adminEmail);
                }
            } else {
                throw authError;
            }
        } else {
            console.log('✅ Auth user created:', authData.user.id);
            await createProfile(authData.user.id, adminEmail);
        }

        console.log('');
        console.log('🎉 Admin creation complete!');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 Password:', adminPassword);
        console.log('🌐 Login at: http://localhost:5176/supabase-login');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function createProfile(userId, email) {
    console.log('2️⃣ Creating profile...');
    
    try {
        const profileData = {
            id: userId,
            email: email,
            first_name: 'Billy',
            last_name: 'Admin', 
            role: 'admin',
            approved: true
        };

        const { error } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData); // Use upsert to avoid conflicts

        if (error) {
            console.log('⚠️ Profile creation error:', error.message);
            console.log('Don\'t worry - profile will be created automatically on first login');
        } else {
            console.log('✅ Profile created successfully');
        }
    } catch (error) {
        console.log('⚠️ Profile error:', error.message);
        console.log('Profile will be created automatically on login');
    }
}

createAdminQuick();
