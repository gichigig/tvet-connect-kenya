// Create attendance sessions for existing students
const API_BASE_URL = 'http://localhost:3001';

async function createAttendanceForExistingStudents() {
  console.log('🧪 Creating attendance for existing students...');
  
  try {
    // First, let's create some basic unit enrollments for common students
    console.log('\n1. Creating unit enrollments...');
    
    const students = ['ST2023001', 'ST2023002', 'ST2024001', 'student123'];
    const units = [
      { id: 'CS101', code: 'CS101', name: 'Introduction to Computer Science' },
      { id: 'MATH201', code: 'MATH201', name: 'Advanced Mathematics' },
      { id: 'ENG101', code: 'ENG101', name: 'English Communication' }
    ];

    // Create enrollments for students
    for (const studentId of students) {
      for (const unit of units) {
        try {
          const enrollResponse = await fetch(`${API_BASE_URL}/api/students/${studentId}/enroll`, {
            method: 'POST',
            headers: {
              'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              unitId: unit.id,
              unitCode: unit.code,
              unitName: unit.name
            })
          });
          
          if (enrollResponse.ok) {
            console.log(`✅ Enrolled ${studentId} in ${unit.code}`);
          }
        } catch (err) {
          // Ignore enrollment errors (might already be enrolled)
        }
      }
    }

    // Now create attendance sessions
    console.log('\n2. Creating attendance sessions...');
    
    const attendanceSessions = [
      {
        planId: 'plan-cs101',
        sessionId: `cs_session_${Date.now()}`,
        unitId: 'CS101',
        unitCode: 'CS101',
        unitName: 'Introduction to Computer Science',
        lecturer: 'Dr. Jane Smith',
        title: 'CS101 Lecture - Variables and Data Types',
        description: 'Mark your attendance for today\'s computer science lecture on variables',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:30',
        venue: 'Computer Lab A',
        weekNumber: 1,
        attendanceCode: 'CS101-VAR',
        type: 'manual'
      },
      {
        planId: 'plan-math201', 
        sessionId: `math_session_${Date.now()}`,
        unitId: 'MATH201',
        unitCode: 'MATH201',
        unitName: 'Advanced Mathematics',
        lecturer: 'Prof. John Doe',
        title: 'MATH201 Tutorial - Calculus',
        description: 'Interactive mathematics tutorial on calculus fundamentals',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:30',
        venue: 'Math Room B12',
        weekNumber: 1,
        attendanceCode: 'MATH201-CALC',
        type: 'manual'
      },
      {
        planId: 'plan-eng101',
        sessionId: `eng_session_${Date.now()}`,
        unitId: 'ENG101',
        unitCode: 'ENG101', 
        unitName: 'English Communication',
        lecturer: 'Ms. Sarah Wilson',
        title: 'English Communication - Presentation Skills',
        description: 'Practice session for presentation and communication skills',
        date: new Date().toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '12:30',
        venue: 'Language Lab',
        weekNumber: 1,
        attendanceCode: 'ENG101-PRES',
        type: 'manual'
      }
    ];

    for (const session of attendanceSessions) {
      const response = await fetch(`${API_BASE_URL}/api/lecturer/semester-plans/${session.planId}/attendance`, {
        method: 'POST',
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(session)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created attendance session: ${session.unitCode} - ${session.title}`);
        
        // Sync to dashboard
        await fetch(`${API_BASE_URL}/api/lecturer/semester-plans/${session.planId}/sync-dashboard`, {
          method: 'POST',
          headers: {
            'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: result.sessionId,
            type: 'attendance'
          })
        });
        
        console.log(`✅ Synced ${session.unitCode} to dashboard`);
      } else {
        console.log(`❌ Failed to create session for ${session.unitCode}:`, await response.text());
      }
    }

    // Test fetching for each student
    console.log('\n3. Testing attendance data for students...');
    for (const studentId of students) {
      const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/attendance-sessions`, {
        headers: {
          'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${studentId}: ${data.sessions?.length || 0} attendance sessions available`);
        if (data.sessions && data.sessions.length > 0) {
          console.log(`   📝 Available sessions: ${data.sessions.map(s => s.unitCode).join(', ')}`);
        }
      } else {
        console.log(`❌ Failed to fetch attendance for ${studentId}`);
      }
    }

    console.log('\n✨ Setup completed! Students now have real attendance sessions.');
    console.log('📱 Login as any of these students to see real-time attendance:');
    console.log('   - ST2023001, ST2023002, ST2024001, student123');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createAttendanceForExistingStudents();
