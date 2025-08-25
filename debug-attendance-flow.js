// Debug attendance sessions storage
const API_BASE_URL = 'http://localhost:3001';

async function debugAttendanceSessions() {
  console.log('🔍 Debugging attendance sessions...');
  
  try {
    // Create a test session
    console.log('\n1. Creating test session...');
    const testSession = {
      sessionId: `debug_session_${Date.now()}`,
      unitId: 'CS101',
      unitCode: 'CS101',
      unitName: 'Introduction to Computer Science',
      lecturer: 'Dr. Debug',
      title: 'Debug Test Session',
      description: 'Testing real-time attendance debugging',
      date: new Date().toISOString().split('T')[0], // Today's date
      startTime: '10:00',
      endTime: '11:30',
      venue: 'Debug Lab',
      weekNumber: 1,
      attendanceCode: 'DEBUG-CS101',
      type: 'manual'
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/lecturer/semester-plans/debug-plan/attendance`, {
      method: 'POST',
      headers: {
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSession)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Session created:', {
        sessionId: result.sessionId,
        planId: result.session.planId,
        unitCode: result.session.unitCode,
        date: result.session.date,
        isActive: result.session.isActive !== false
      });

      // Now test the student endpoint immediately
      console.log('\n2. Testing student endpoint...');
      const studentResponse = await fetch(`${API_BASE_URL}/api/students/ST2023001/attendance-sessions`, {
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
        }
      });

      if (studentResponse.ok) {
        const studentData = await studentResponse.json();
        console.log('✅ Student data:', {
          totalSessions: studentData.sessions?.length || 0,
          sessions: studentData.sessions?.map(s => ({
            id: s.id,
            unitCode: s.unitCode,
            date: s.date,
            isActive: s.isActive
          })) || []
        });

        if (studentData.sessions && studentData.sessions.length > 0) {
          console.log('🎉 SUCCESS: Real-time attendance is working!');
          console.log('   The AttendancePortal will now show this data instead of mock data.');
        } else {
          console.log('❌ No sessions found for student. Let me check the date filter...');
          
          // Check if the issue is date filtering
          const today = new Date().toISOString().split('T')[0];
          console.log(`   Session date: ${result.session.date}`);
          console.log(`   Today's date: ${today}`);
          console.log(`   Dates match: ${result.session.date === today}`);
        }
      } else {
        console.log('❌ Failed to fetch student sessions:', await studentResponse.text());
      }

    } else {
      console.log('❌ Failed to create session:', await createResponse.text());
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAttendanceSessions();
