import fetch from 'node-fetch';

async function testCors() {
  console.log('🔍 Testing CORS from Grade Vault origin...\n');
  
  try {
    // Simulate the exact request that Grade Vault makes
    const response = await fetch('http://localhost:3001/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
        'Origin': 'http://localhost:8081' // Simulate Grade Vault origin
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log(`Status: ${response.status}`);
    console.log('CORS Headers:');
    console.log(`  Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    console.log(`  Access-Control-Allow-Methods: ${response.headers.get('access-control-allow-methods')}`);
    console.log(`  Access-Control-Allow-Headers: ${response.headers.get('access-control-allow-headers')}`);
    
    const data = await response.json();
    console.log('\nResponse:', data);
    
    if (response.headers.get('access-control-allow-origin')) {
      console.log('\n✅ CORS headers are present - CORS issue should be resolved!');
    } else {
      console.log('\n❌ CORS headers missing - issue persists');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCors();
