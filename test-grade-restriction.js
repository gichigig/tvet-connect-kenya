// Test script to verify grade access restrictions
const API_BASE_URL = 'http://localhost:3001';
const API_KEY = process.env.VITE_API_KEY || 'test-key';

async function testGradeRestriction() {
  console.log('🧪 Testing Grade Access Restriction for tvet-connect-kenya app');
  console.log('=====================================\n');

  try {
    // Test with tvet-connect-kenya app identifier
    const response = await fetch(`${API_BASE_URL}/api/grades/student/test123`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'X-App-Name': 'tvet-connect-kenya', // This should trigger the block
        'User-Agent': 'tvet-connect-kenya-app/1.0',
      },
    });

    const data = await response.json();
    
    if (response.status === 403) {
      console.log('✅ SUCCESS: Grades API correctly blocked tvet-connect-kenya app');
      console.log('📋 Response:', data.message);
    } else {
      console.log('❌ FAIL: Grades API should have blocked the request');
      console.log('📋 Status:', response.status);
      console.log('📋 Response:', data);
    }

  } catch (error) {
    console.error('❌ ERROR: Test failed with error:', error.message);
  }

  console.log('\n=====================================');
  console.log('Grade restriction test completed');
}

// Run the test
testGradeRestriction();
