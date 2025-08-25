// Direct attendance session setup - bypass sync endpoint
const API_BASE_URL = 'http://localhost:3001';

async function setupAttendanceDirectly() {
  console.log('🧪 Setting up attendance sessions directly...');
  
  try {
    // Create attendance sessions first
    const sessionsCreated = [];
    
    const sessions = [
      {
        planId: 'plan-cs101',
        sessionData: {
          sessionId: `cs_session_${Date.now()}`,
          unitId: 'CS101',
          unitCode: 'CS101',
          unitName: 'Introduction to Computer Science',
          lecturer: 'Dr. Jane Smith',
          title: 'CS101 Lecture - Real-time Demo',
          description: 'Real-time attendance for CS101 lecture',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:30',
          venue: 'Computer Lab A',
          weekNumber: 1,
          attendanceCode: 'CS101-DEMO',
          type: 'manual'
        }
      },
      {
        planId: 'plan-math201',
        sessionData: {
          sessionId: `math_session_${Date.now()}`,
          unitId: 'MATH201', 
          unitCode: 'MATH201',
          unitName: 'Advanced Mathematics',
          lecturer: 'Prof. John Doe',
          title: 'MATH201 Tutorial - Real-time Demo',
          description: 'Real-time attendance for math tutorial',
          date: new Date().toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:30',
          venue: 'Math Room B12',
          weekNumber: 1,
          attendanceCode: 'MATH201-DEMO',
          type: 'manual'
        }
      }
    ];

    console.log('\n1. Creating attendance sessions...');
    for (const session of sessions) {
      const response = await fetch(`${API_BASE_URL}/api/lecturer/semester-plans/${session.planId}/attendance`, {
        method: 'POST',
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(session.sessionData)
      });

      if (response.ok) {
        const result = await response.json();
        sessionsCreated.push({
          sessionId: result.sessionId,
          session: result.session
        });
        console.log(`✅ Created: ${session.sessionData.unitCode} - ${session.sessionData.title}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create ${session.sessionData.unitCode}:`, error);
      }
    }

    // Now manually add these to student dashboard content by calling a manual sync
    console.log('\n2. Adding sessions to student dashboards...');
    
    const students = ['ST2023001', 'ST2023002', 'ST2024001', 'student123'];
    
    for (const session of sessionsCreated) {
      for (const studentId of students) {
        try {
          // Call our manual dashboard sync endpoint (if it exists) or add directly
          const syncResponse = await fetch(`${API_BASE_URL}/api/students/${studentId}/dashboard/add-session`, {
            method: 'POST', 
            headers: {
              'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'attendance',
              sessionId: session.sessionId,
              attendanceSession: session.session
            })
          });
          
          if (syncResponse.ok) {
            console.log(`✅ Added ${session.session.unitCode} to ${studentId}'s dashboard`);
          } else {
            // If endpoint doesn't exist, that's ok - we'll add it
            console.log(`ℹ️  Dashboard sync endpoint not found for ${studentId}`);
          }
        } catch (err) {
          // Ignore individual sync errors
        }
      }
    }

    // Test the results
    console.log('\n3. Testing student attendance data...');
    for (const studentId of students) {
      const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/attendance-sessions`, {
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${studentId}: ${data.sessions?.length || 0} sessions`);
        if (data.sessions && data.sessions.length > 0) {
          data.sessions.forEach(session => {
            console.log(`   📝 ${session.unitCode}: ${session.description}`);
          });
        }
      } else {
        console.log(`❌ ${studentId}: Failed to fetch sessions`);
      }
    }

    console.log('\n✨ Setup completed!');
    console.log('📱 Now test in the frontend:');
    console.log('   1. Open http://localhost:5178');
    console.log('   2. Login as any student (ST2023001, ST2023002, etc.)');
    console.log('   3. Go to Attendance tab to see real-time data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupAttendanceDirectly();
