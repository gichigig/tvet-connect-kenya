import fetch from 'node-fetch';

async function testApiQuick() {
  console.log('🔍 Testing API server...\n');
  
  try {
    // Test with a simple request
    const response = await fetch('http://localhost:3001/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'test123'
      }),
      timeout: 5000
    });
    
    const data = await response.json();
    console.log('✅ API Server is responding!');
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 401 || response.status === 400) {
      console.log('✅ This is expected for non-existent user');
    }
    
  } catch (error) {
    console.log('❌ API Server error:', error.message);
  }
}

testApiQuick();
