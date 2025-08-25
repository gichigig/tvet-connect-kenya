// Test the Grade Vault login flow and JWT tokens
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function testLogin() {
  try {
    console.log('Testing login with registrar-created student...');
    
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        email: 'janedoe@student.tveta.ac.ke',
        password: 'password123',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User data:', data.user);
      console.log('JWT token received:', data.token ? 'YES' : 'NO');
      
      if (data.token) {
        // Test JWT token with protected endpoint
        console.log('\n🔒 Testing protected endpoint with JWT...');
        
        const profileResponse = await fetch(`${API_URL}/api/me/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${data.token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Profile endpoint accessible!');
          console.log('Profile data:', profileData);
        } else {
          console.log('❌ Profile endpoint failed:', profileResponse.status);
          const errorData = await profileResponse.json().catch(() => ({}));
          console.log('Error:', errorData);
        }

        // Test grades endpoint
        console.log('\n📊 Testing grades endpoint with JWT...');
        
        const gradesResponse = await fetch(`${API_URL}/api/me/grades`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${data.token}`,
          },
        });

        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          console.log('✅ Grades endpoint accessible!');
          console.log('Grades data:', gradesData);
        } else {
          console.log('❌ Grades endpoint failed:', gradesResponse.status);
          const errorData = await gradesResponse.json().catch(() => ({}));
          console.log('Error:', errorData);
        }
      }
    } else {
      console.log('❌ Login failed:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testLogin();
