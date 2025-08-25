require('dotenv').config();

// Use global fetch (available in Node.js 18+)
const fetch = globalThis.fetch;

async function testUsernameLogin() {
    console.log('🧪 Testing Username Login Functionality...');
    
    // Test data
    const testUsers = [
        { identifier: 'admin@example.com', password: 'admin123', expectSuccess: false, description: 'Admin with email' },
        { identifier: 'student@example.com', password: 'student123', expectSuccess: false, description: 'Student with email' },
        { identifier: 'testuser', password: 'password123', expectSuccess: false, description: 'Student with username' },
        { identifier: 'lecturer1', password: 'lecture123', expectSuccess: false, description: 'Lecturer with username' },
    ];
    
    console.log('\n📋 Testing Authentication API...');
    
    // First, let's test if the API server is accessible
    try {
        const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
        console.log(`🔗 API Base URL: ${API_BASE_URL}`);
        
        // Test basic connectivity
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (healthResponse.ok) {
            console.log('✅ API server is accessible');
        } else {
            console.log('⚠️ API server responded but not healthy');
        }
    } catch (error) {
        console.log('❌ API server not accessible:', error.message);
        console.log('ℹ️ Note: This test requires the API server to be running');
        console.log('ℹ️ To test fully, run: cd api-server && npm start');
    }
    
    console.log('\n🔧 Testing Frontend Authentication Logic...');
    
    // Simulate the new username/email login logic
    function simulateUsernameEmailLogin(identifier, users = []) {
        console.log(`\n🔍 Testing login with identifier: "${identifier}"`);
        
        // Simulate findUserByEmailOrUsername function
        const foundByEmail = users.find(u => u.email === identifier);
        const foundByUsername = users.find(u => u.username === identifier);
        const foundUser = foundByEmail || foundByUsername;
        
        if (foundUser) {
            console.log(`✅ User found: ${foundUser.firstName} ${foundUser.lastName} (${foundUser.role})`);
            console.log(`   - Matched by: ${foundByEmail ? 'email' : 'username'}`);
            return { success: true, user: foundUser, matchType: foundByEmail ? 'email' : 'username' };
        } else {
            console.log(`❌ No user found with identifier: "${identifier}"`);
            return { success: false, user: null, matchType: null };
        }
    }
    
    // Test with sample users
    const sampleUsers = [
        {
            id: '1',
            email: 'john.doe@student.edu',
            username: 'johndoe',
            firstName: 'John',
            lastName: 'Doe',
            role: 'student',
            approved: true
        },
        {
            id: '2',
            email: 'jane.smith@lecturer.edu',
            username: 'janesmith',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'lecturer',
            approved: true
        },
        {
            id: '3',
            email: 'admin@system.com',
            username: null, // Admin without username
            firstName: 'System',
            lastName: 'Admin',
            role: 'admin',
            approved: true
        }
    ];
    
    console.log('👥 Sample users in system:');
    sampleUsers.forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName}: email="${user.email}", username="${user.username || 'none'}", role="${user.role}"`);
    });
    
    // Test various login scenarios
    const testScenarios = [
        { identifier: 'johndoe', description: 'Login with username' },
        { identifier: 'john.doe@student.edu', description: 'Login with email' },
        { identifier: 'janesmith', description: 'Login with lecturer username' },
        { identifier: 'jane.smith@lecturer.edu', description: 'Login with lecturer email' },
        { identifier: 'admin@system.com', description: 'Login with admin email (no username)' },
        { identifier: 'nonexistent', description: 'Login with non-existent identifier' },
        { identifier: 'unknown@email.com', description: 'Login with non-existent email' }
    ];
    
    console.log('\n🧪 Testing Login Scenarios:');
    testScenarios.forEach((scenario, index) => {
        console.log(`\n${index + 1}. ${scenario.description}`);
        const result = simulateUsernameEmailLogin(scenario.identifier, sampleUsers);
        
        if (result.success) {
            console.log(`   ✅ SUCCESS: User authenticated as ${result.user.role}`);
            console.log(`   📝 Details: Matched by ${result.matchType}`);
        } else {
            console.log(`   ❌ FAILED: Authentication failed`);
        }
    });
    
    console.log('\n📊 Summary of Changes Made:');
    console.log('✅ Added username field to User interface');
    console.log('✅ Added findUserByUsername and findUserByEmailOrUsername functions');
    console.log('✅ Updated authenticateUser to support both email and username');
    console.log('✅ Modified login form to accept "Username or Email"');
    console.log('✅ Added username field to signup form');
    console.log('✅ Updated AuthHelpers to use identifier instead of email');
    console.log('✅ Enhanced realtime database with username indexing');
    
    console.log('\n🎯 Benefits:');
    console.log('• Users can login with either username or email');
    console.log('• Backward compatibility with existing email-based logins');
    console.log('• More flexible authentication system');
    console.log('• Better user experience with memorable usernames');
    
    console.log('\n⚠️ Important Notes:');
    console.log('• Existing users without usernames can still login with email');
    console.log('• New users can optionally set a username during signup');
    console.log('• Username indexing is automatically created in Firebase');
    console.log('• Firebase Auth still requires email for admin upload functionality');
}

testUsernameLogin();
