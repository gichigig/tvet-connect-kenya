// Test script to verify frontend can fetch real-time attendance data
const API_BASE_URL = 'http://localhost:5178'; // Frontend URL
const API_URL = 'http://localhost:3001/api'; // API URL

async function testFrontendAttendanceIntegration() {
  console.log('🧪 Testing frontend attendance integration...');
  
  try {
    // Test direct API call (what the frontend should be making)
    console.log('\n1. Testing direct API call...');
    const response = await fetch(`${API_URL}/students/ST2023001/attendance-sessions`, {
      headers: {
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct API call successful:');
      console.log(`   - Found ${data.sessions?.length || 0} attendance sessions`);
      console.log(`   - Total count: ${data.totalCount || 0}`);
      
      if (data.sessions && data.sessions.length > 0) {
        console.log('   - Sample session:', {
          id: data.sessions[0].id,
          unitCode: data.sessions[0].unitCode,
          unitName: data.sessions[0].unitName,
          isActive: data.sessions[0].isActive
        });
      }
    } else {
      console.log('❌ Direct API call failed:', response.status, await response.text());
    }

    // Test if we can access the frontend
    console.log('\n2. Testing frontend accessibility...');
    const frontendResponse = await fetch(API_BASE_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible at', API_BASE_URL);
    } else {
      console.log('❌ Frontend is not accessible');
    }

    console.log('\n✨ Integration test completed!');
    console.log('📱 To test manually:');
    console.log('   1. Open http://localhost:5178 in your browser');
    console.log('   2. Login as a student (e.g., ST2023001)');
    console.log('   3. Navigate to the Attendance tab');
    console.log('   4. You should see real-time attendance sessions instead of mock data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendAttendanceIntegration();
