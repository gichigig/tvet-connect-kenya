import fetch from 'node-fetch';

// Simple test of the student login endpoint
async function testLoginEndpoint() {
  console.log('🔍 Testing student login endpoint directly...\n');
  
  // Try with some common test credentials that might exist
  const testCredentials = [
    { email: 'test.student@example.com', password: 'TestPass123' },
    { email: 'student@test.com', password: 'password123' },
    { email: 'test@example.com', password: 'test123' }
  ];
  
  for (const creds of testCredentials) {
    console.log(`Testing login with: ${creds.email}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Login successful!');
        console.log('📊 Response:', JSON.stringify(data, null, 2));
        break; // Stop on first successful login
      } else {
        console.log(`❌ Login failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
    
    console.log(''); // Empty line between tests
  }
}

testLoginEndpoint();
