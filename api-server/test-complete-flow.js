// Comprehensive test of Grade Vault authentication and API endpoints
async function testCompleteFlow() {
  const API_URL = 'http://localhost:3001';
  const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';
  
  console.log('🔍 Testing Grade Vault Authentication Flow');
  console.log('==========================================');
  
  // Test 1: Login
  console.log('\n1️⃣ Testing Login...');
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        email: 'testuser@student.tveta.ac.ke', // Using a known test email
        password: 'password123',
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`);
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
      
      const token = loginData.token;
      
      // Test 2: Profile endpoint
      console.log('\n2️⃣ Testing Profile Endpoint...');
      try {
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
          console.log('   Profile keys:', Object.keys(profileData));
        } else {
          const errorText = await profileResponse.text();
          console.log(`❌ Profile endpoint failed: ${profileResponse.status}`);
          console.log(`   Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Profile request error: ${error.message}`);
      }
      
      // Test 3: Grades endpoint
      console.log('\n3️⃣ Testing Grades Endpoint...');
      try {
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
          console.log('   Grades keys:', Object.keys(gradesData));
        } else {
          const errorText = await gradesResponse.text();
          console.log(`❌ Grades endpoint failed: ${gradesResponse.status}`);
          console.log(`   Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Grades request error: ${error.message}`);
      }
      
    } else {
      console.log(`❌ Login failed: ${loginResponse.status}`);
      console.log('   Error:', loginData);
    }
    
  } catch (error) {
    console.log(`❌ Login request error: ${error.message}`);
  }
  
  console.log('\n🏁 Test Complete');
}

// Run the test
testCompleteFlow();
