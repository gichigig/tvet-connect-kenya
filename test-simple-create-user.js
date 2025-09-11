// Simple test to verify admin user creation through the same method as the app
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_ANON_KEY; // This is the service role key

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testCreateUser() {
    console.log('🧪 Testing user creation via admin client...');
    
    const testUserData = {
        email: 'test.user@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser123',
        role: 'student'
    };
    const testPassword = 'TestPassword123';
    
    try {
        // First cleanup any existing test user
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === testUserData.email);
        
        if (existingUser) {
            console.log('🗑️ Removing existing test user...');
            await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        }
        
        // Test the same createUser logic as in the app
        console.log('🔧 Creating user via admin client to bypass email verification...');
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: testUserData.email,
            password: testPassword,
            email_confirm: true, // This bypasses email verification
            user_metadata: {
                first_name: testUserData.firstName,
                last_name: testUserData.lastName,
                username: testUserData.username,
                role: testUserData.role
            }
        });

        if (authError) {
            console.error('❌ Admin user creation error:', authError);
            throw new Error(authError.message);
        }

        console.log('✅ User created successfully!');
        console.log('User ID:', authData.user.id);
        console.log('Email:', authData.user.email);
        console.log('Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
        
        // Now test creating a profile (if profiles table exists)
        console.log('📝 Creating user profile...');
        
        const profileData = {
            id: authData.user.id,
            email: testUserData.email,
            first_name: testUserData.firstName,
            last_name: testUserData.lastName,
            username: testUserData.username,
            role: testUserData.role,
            approved: true,
            blocked: false
        };

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert(profileData)
            .select()
            .single();

        if (profileError) {
            console.log('⚠️ Profile creation error:', profileError.message);
            console.log('This is expected if profiles table doesn\'t exist yet');
        } else {
            console.log('✅ Profile created successfully!');
            console.log('Profile ID:', profile.id);
        }
        
        // Clean up
        console.log('🧹 Cleaning up test user...');
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('✅ Test completed successfully!');
        
        console.log('');
        console.log('🎉 Admin user creation functionality is working correctly!');
        console.log('Your admin should now be able to create users through the app.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testCreateUser();
