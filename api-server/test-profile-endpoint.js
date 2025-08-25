import fetch from 'node-fetch';

async function testProfileEndpoint() {
  console.log('🔍 Testing student profile endpoint...\n');
  
  const apiKey = 'tvet_1fd0f562039f427aac9bf7bdf515b804'; // Updated API key
  
  // Test the profile endpoint that Grade Vault is calling
  const testCases = [
    {
      name: 'Profile with admission number',
      url: 'http://localhost:3001/api/auth/profile/ENG001'
    },
    {
      name: 'Alternative profile endpoint',
      url: 'http://localhost:3001/api/me/profile'
    },
    {
      name: 'Me endpoint',
      url: 'http://localhost:3001/api/me'
    }
  ];
  
  for (const test of testCases) {
    console.log(`🔍 Testing: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    try {
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        timeout: 5000
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Endpoint works!');
        console.log('   Response:', data);
      } else {
        const errorData = await response.json();
        console.log('   ❌ Error response:', errorData);
      }
      
    } catch (error) {
      console.log('   ❌ Request failed:', error.message);
    }
    
    console.log('');
  }
}

testProfileEndpoint();
