import fetch from 'node-fetch';

async function testEndpoints() {
  console.log('🔍 Testing Grade Vault API endpoints...\n');
  
  const baseUrl = 'http://localhost:3001/api';
  const apiKey = 'tvet_2f51f9505be74254b1134d52aa57b62b'; // From Grade Vault .env
  
  // Test the exact endpoints Grade Vault is calling
  const tests = [
    {
      name: 'Student Profile',
      url: `${baseUrl}/auth/profile/ENG001`,
      method: 'GET'
    },
    {
      name: 'Student Grades', 
      url: `${baseUrl}/grades/student/ENG001`,
      method: 'GET'
    },
    {
      name: 'API Key Test',
      url: `${baseUrl}/students`,
      method: 'GET'
    }
  ];
  
  for (const test of tests) {
    console.log(`🔍 Testing: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        timeout: 5000
      });
      
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
      
    } catch (error) {
      console.log(`   ❌ Error:`, error.message);
    }
    
    console.log('');
  }
}

testEndpoints();
