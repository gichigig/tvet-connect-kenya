// Debug script to test Grade Vault authentication step by step
const API_URL = 'http://localhost:3001';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function debugAuthentication() {
  console.log('🔍 Debug: Grade Vault Authentication Flow');
  console.log('==========================================');
  
  console.log(`API_URL: ${API_URL}`);
  console.log(`API_KEY: ${API_KEY}`);
  
  // Step 1: Test login
  console.log('\n1️⃣ Testing login...');
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        email: 'student1@student.tveta.ac.ke', // Try different email
        password: 'student123',
      }),
    });
    
    console.log(`Login response status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('User data:', JSON.stringify(loginData.user, null, 2));
      console.log('Token exists:', !!loginData.token);
      console.log('Token preview:', loginData.token ? loginData.token.substring(0, 50) + '...' : 'NO TOKEN');
      
      const token = loginData.token;
      
      // Step 2: Test profile with detailed debugging
      console.log('\n2️⃣ Testing profile endpoint...');
      console.log('Making request to:', `${API_URL}/api/me/profile`);
      console.log('Headers:');
      console.log('  Content-Type: application/json');
      console.log('  x-api-key:', API_KEY);
      console.log('  Authorization: Bearer', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      const profileResponse = await fetch(`${API_URL}/api/me/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log(`Profile response status: ${profileResponse.status}`);
      console.log('Profile response headers:', Object.fromEntries(profileResponse.headers.entries()));
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile request successful');
        console.log('Profile data structure:', Object.keys(profileData));
        console.log('Has profile field:', !!profileData.profile);
        console.log('Has student field:', !!profileData.student);
      } else {
        const errorText = await profileResponse.text();
        console.log('❌ Profile request failed');
        console.log('Error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('Parsed error:', errorJson);
        } catch (e) {
          console.log('Could not parse error as JSON');
        }
      }
      
      // Step 3: Test grades endpoint
      console.log('\n3️⃣ Testing grades endpoint...');
      const gradesResponse = await fetch(`${API_URL}/api/me/grades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log(`Grades response status: ${gradesResponse.status}`);
      
      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        console.log('✅ Grades request successful');
        console.log('Grades data structure:', Object.keys(gradesData));
      } else {
        const errorText = await gradesResponse.text();
        console.log('❌ Grades request failed');
        console.log('Error response:', errorText);
      }
      
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed');
      console.log('Error response:', errorText);
      
      // Try alternative login credentials
      console.log('\n🔄 Trying alternative credentials...');
      const altLoginResponse = await fetch(`${API_URL}/api/auth/verify`, {
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
      
      if (altLoginResponse.ok) {
        const altLoginData = await altLoginResponse.json();
        console.log('✅ Alternative login successful');
        console.log('User:', altLoginData.user.firstName, altLoginData.user.lastName);
      } else {
        const altErrorText = await altLoginResponse.text();
        console.log('❌ Alternative login also failed');
        console.log('Error:', altErrorText);
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed with error:', error.message);
  }
  
  console.log('\n🏁 Debug complete');
}

debugAuthentication();
