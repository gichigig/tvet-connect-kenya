// Debug API server internal state
const API_BASE_URL = 'http://localhost:3001';

async function debugAPIInternals() {
  console.log('🔍 Debugging API server internal state...');
  
  try {
    // First create a session
    console.log('\n1. Creating test session...');
    const testSession = {
      sessionId: `debug_internal_${Date.now()}`,
      unitId: 'CS101',
      unitCode: 'CS101',
      unitName: 'Computer Science Debugging',
      lecturer: 'Dr. Debug',
      title: 'Internal Debug Session',
      description: 'Testing API internals',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:30',
      venue: 'Debug Lab',
      weekNumber: 1,
      attendanceCode: 'DEBUG-INT',
      type: 'manual'
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/lecturer/semester-plans/debug-internal-plan/attendance`, {
      method: 'POST',
      headers: {
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSession)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Session created:', result.sessionId);

      // Now add a debug endpoint to the API to check internal state
      console.log('\n2. Checking internal state...');
      
      // Create a simple debug request to force logging
      const debugResponse = await fetch(`${API_BASE_URL}/api/students/DEBUG_LOG_STATE/attendance-sessions`, {
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
        }
      });

      // This will trigger the logging in the endpoint, check the server console

      console.log('\n3. Testing with a simple fetch...');
      const simpleFetch = await fetch(`${API_BASE_URL}/api/students/ST2023001/attendance-sessions`, {
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
        }
      });

      const simpleData = await simpleFetch.json();
      console.log('Response from API:', simpleData);
      
      // Let's also manually test the date logic
      const sessionDate = new Date(testSession.date);
      const today = new Date();
      
      console.log('\n4. Date comparison debug:');
      console.log('   Session date string:', testSession.date);
      console.log('   Session Date object:', sessionDate);
      console.log('   Today Date object:', today);
      console.log('   Session date string:', sessionDate.toDateString());
      console.log('   Today date string:', today.toDateString());
      console.log('   Are they equal?:', sessionDate.toDateString() === today.toDateString());

    } else {
      console.log('❌ Failed to create session:', await createResponse.text());
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAPIInternals();
