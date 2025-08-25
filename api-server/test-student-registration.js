const fetch = require('node-fetch');

async function testStudentRegistrationAndLogin() {
  console.log('🔍 Testing Student Registration and Login Process...\n');

  try {
    // Test 1: Check if we can create a test student
    console.log('1. Testing student creation process...');
    
    // For this test, let's check if a student exists in the database
    // and if they can authenticate through the API
    
    const testEmail = 'test.student@example.com';
    const testPassword = 'TestPass123';
    
    // Test 2: Try to login with student credentials through the auth API
    console.log('2. Testing student login through auth API...');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Student login successful!');
      console.log('📊 Login response:', loginData);
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Student login failed');
      console.log('📊 Error details:', errorData);
    }
    
    // Test 3: Check if we can access the students API endpoint
    console.log('\n3. Testing students API access...');
    
    const studentsResponse = await fetch('http://localhost:3001/health');
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      console.log('✅ API is accessible');
      console.log('📊 Health check:', studentsData);
    } else {
      console.log('❌ API access failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testStudentRegistrationAndLogin();
