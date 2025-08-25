// Test script to create attendance sessions for real-time testing
const API_BASE_URL = 'http://localhost:3001';

async function createTestAttendanceSession() {
  console.log('Creating test attendance session...');
  
  try {
    // First, create a semester plan attendance session
    const response = await fetch(`${API_BASE_URL}/api/lecturer/semester-plans/test-plan-123/attendance`, {
      method: 'POST',
      headers: {
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: `session_${Date.now()}`,
        unitId: 'CS101',
        unitCode: 'CS101',
        unitName: 'Introduction to Computer Science',
        lecturer: 'Dr. Jane Smith',
        title: 'Regular Lecture Attendance',
        description: 'Mark your attendance for today\'s computer science lecture',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:30',
        venue: 'Lab A',
        weekNumber: 1,
        attendanceCode: 'CS101-TODAY'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Attendance session created:', result);

      // Now sync it to a test student dashboard
      const studentId = 'test-student-123';
      const syncResponse = await fetch(`${API_BASE_URL}/api/students/${studentId}/dashboard/attendance`, {
        method: 'POST',
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attendanceSessionId: result.sessionId,
          unitId: 'CS101'
        })
      });

      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        console.log('✅ Attendance session synced to student dashboard:', syncResult);
      } else {
        console.error('❌ Failed to sync to student dashboard:', syncResponse.status);
      }

    } else {
      console.error('❌ Failed to create attendance session:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Error creating test attendance session:', error);
  }
}

async function createTestMathSession() {
  console.log('Creating test math attendance session...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/lecturer/semester-plans/test-plan-456/attendance`, {
      method: 'POST',
      headers: {
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: `math_session_${Date.now()}`,
        unitId: 'MATH201',
        unitCode: 'MATH201',
        unitName: 'Advanced Mathematics',
        lecturer: 'Prof. John Doe',
        title: 'Mathematics Tutorial',
        description: 'Location-based attendance required for mathematics tutorial',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:30',
        venue: 'Room B12',
        weekNumber: 1,
        attendanceCode: 'MATH201-LOC',
        locationRequired: true,
        latitude: -1.2921,
        longitude: 36.8219,
        radius: 100
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Math attendance session created:', result);

      // Sync to test student
      const studentId = 'test-student-123';
      const syncResponse = await fetch(`${API_BASE_URL}/api/students/${studentId}/dashboard/attendance`, {
        method: 'POST',
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attendanceSessionId: result.sessionId,
          unitId: 'MATH201'
        })
      });

      if (syncResponse.ok) {
        console.log('✅ Math session synced to student dashboard');
      }
    } else {
      console.error('❌ Failed to create math session:', response.status);
    }
  } catch (error) {
    console.error('❌ Error creating math session:', error);
  }
}

async function testStudentAttendanceAPI() {
  console.log('Testing student attendance API...');
  
  try {
    const studentId = 'test-student-123';
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/attendance-sessions`, {
      headers: {
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Student attendance sessions:', result);
    } else {
      console.error('❌ Failed to fetch student sessions:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing student API:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting attendance session tests...\n');
  
  await createTestAttendanceSession();
  console.log('');
  
  await createTestMathSession();
  console.log('');
  
  await testStudentAttendanceAPI();
  console.log('');
  
  console.log('✨ Tests completed! Check the student dashboard for real-time attendance sessions.');
  console.log('📱 Open the app and login as a student to see the real-time data.');
}

runTests();
