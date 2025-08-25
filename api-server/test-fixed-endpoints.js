// Test the fixed endpoints
const API_URL = 'http://localhost:3001';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function testFixedEndpoints() {
  console.log('🔧 Testing Fixed API Endpoints');
  console.log('===============================');
  
  // First, get a valid JWT token
  console.log('\n1️⃣ Getting JWT token...');
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        email: 'janedoe@student.tveta.ac.ke', // Using registrar-created student
        password: 'password123',
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      console.log('✅ JWT token obtained');
      const token = loginData.token;
      
      // Test profile endpoint
      console.log('\n2️⃣ Testing /api/me/profile...');
      const profileResponse = await fetch(`${API_URL}/api/me/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile endpoint working');
        console.log('   Response structure:', Object.keys(profileData));
        console.log('   Has profile field:', !!profileData.profile);
        console.log('   Has student field:', !!profileData.student);
      } else {
        const errorData = await profileResponse.json().catch(() => ({}));
        console.log(`❌ Profile failed: ${profileResponse.status}`);
        console.log('   Error:', errorData);
      }
      
      // Test grades endpoint
      console.log('\n3️⃣ Testing /api/me/grades...');
      const gradesResponse = await fetch(`${API_URL}/api/me/grades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        console.log('✅ Grades endpoint working');
        console.log('   Response structure:', Object.keys(gradesData));
        console.log('   Has grades field:', !!gradesData.grades);
        console.log('   Grades count:', gradesData.grades ? gradesData.grades.length : 0);
      } else {
        const errorData = await gradesResponse.json().catch(() => ({}));
        console.log(`❌ Grades failed: ${gradesResponse.status}`);
        console.log('   Error:', errorData);
      }
      
    } else {
      console.log('❌ Could not get JWT token');
      console.log('   Response:', loginData);
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
  }
  
  console.log('\n🏁 Test Complete');
}

testFixedEndpoints();
