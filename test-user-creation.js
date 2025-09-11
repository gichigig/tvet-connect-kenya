// Test script to verify admin user creation functionality
import { supabaseAdmin } from './src/integrations/supabase/admin.js';

async function testUserCreation() {
    console.log('🧪 Testing admin user creation functionality...');
    
    const testEmail = 'test-admin@example.com';
    const testPassword = 'TestPassword123';
    
    try {
        // Test 1: Check if admin client can connect
        console.log('1️⃣ Testing admin client connection...');
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
            console.error('❌ Admin client connection failed:', listError.message);
            return;
        }
        
        console.log('✅ Admin client connected successfully!');
        console.log(`   Found ${users.length} existing users`);
        
        // Test 2: Try to create a test user
        console.log('2️⃣ Testing user creation...');
        
        // First check if test user already exists and delete if needed
        const existingUser = users.find(u => u.email === testEmail);
        if (existingUser) {
            console.log('🗑️  Removing existing test user...');
            await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        }
        
        // Create test user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true,
            user_metadata: {
                first_name: 'Test',
                last_name: 'Admin',
                role: 'admin'
            }
        });
        
        if (authError) {
            console.error('❌ User creation failed:', authError.message);
            return;
        }
        
        console.log('✅ Test user created successfully!');
        console.log('   User ID:', authData.user.id);
        console.log('   Email:', authData.user.email);
        
        // Test 3: Clean up - delete the test user
        console.log('3️⃣ Cleaning up test user...');
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('✅ Test user deleted successfully!');
        
        console.log('');
        console.log('🎉 All tests passed! Admin user creation is working properly.');
        console.log('');
        console.log('✅ Your admin should now be able to create users through the app interface.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testUserCreation();
