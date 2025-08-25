import fetch from 'node-fetch';

async function testLogin() {
  console.log('🔍 Testing Grade Vault login flow...\n');
  
  // Use a real student email from your database
  const testCredentials = {
    email: 'test@example.com', // Replace with actual student email
    password: 'test123'
  };
  
  try {
    console.log('🔐 Testing login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
      },
      body: JSON.stringify(testCredentials),
      timeout: 5000
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginResponse.ok && loginData.token) {
      console.log('✅ Login successful! JWT token received');
      const token = loginData.token;
      
      // Test profile endpoint with JWT
      console.log('\n🔍 Testing profile with JWT...');
      const profileResponse = await fetch('http://localhost:3001/api/me/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile endpoint works!');
        console.log('Profile data:', profileData);
      } else {
        const errorData = await profileResponse.json();
        console.log('❌ Profile endpoint failed:', errorData);
      }
      
      // Test me endpoint with JWT
      console.log('\n🔍 Testing /api/me with JWT...');
      const meResponse = await fetch('http://localhost:3001/api/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ /api/me endpoint works!');
        console.log('Me data:', meData);
      } else {
        const errorData = await meResponse.json();
        console.log('❌ /api/me endpoint failed:', errorData);
      }
      
    } else {
      console.log('❌ Login failed:', loginData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('ℹ️  Note: Update the email in this script to test with a real student');
testLogin();
