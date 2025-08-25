// Test script to create semester plans for student registered units
const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function testStudentSemesterPlan() {
  console.log('🧪 Testing Student Semester Plan Access...\n');
  
  // Common unit IDs that students are likely registered for based on the codebase
  const testUnits = [
    'CS201', // Computer Science unit from mock data
    'IT101', // IT unit commonly used in tests
    'BCS_Y2_S1_001', // Typical unit ID format
    '1', '2', '3' // Simple unit IDs
  ];
  
  for (const unitId of testUnits) {
    console.log(`\n📚 Testing unit: ${unitId}`);
    
    try {
      // 1. Check if semester plan already exists
      console.log('1. Checking existing semester plan...');
      const getResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      const getResult = await getResponse.json();
      
      if (getResponse.ok && getResult.plan && getResult.plan.weekPlans && getResult.plan.weekPlans.length > 0) {
        console.log(`✅ Found existing plan with ${getResult.plan.weekPlans.length} weeks`);
        continue; // Skip creation if plan exists
      }
      
      // 2. Create a comprehensive semester plan
      console.log('2. Creating semester plan...');
      const semesterPlan = {
        semesterStart: '2025-01-13', // Monday of this week
        semesterWeeks: 12,
        weekPlans: []
      };
      
      // Generate 12 weeks of content
      for (let week = 1; week <= 12; week++) {
        const weekStart = new Date('2025-01-13');
        weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekPlan = {
          weekNumber: week,
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          weekMessage: `Week ${week}: ${getWeekTopic(week)}`,
          materials: [
            {
              id: `mat_${week}_1`,
              title: `Week ${week} Lecture Notes`,
              description: `Comprehensive notes for week ${week} covering ${getWeekTopic(week)}`,
              type: 'material',
              dayOfWeek: 'Monday',
              releaseTime: weekStart.toISOString(),
              fileUrl: `https://example.com/materials/week${week}_notes.pdf`,
              fileName: `Week${week}_Notes.pdf`,
              isUploaded: true,
              isVisible: true,
              documents: []
            },
            {
              id: `mat_${week}_2`,
              title: `Week ${week} Lab Guide`,
              description: `Practical exercises and lab work for week ${week}`,
              type: 'material',
              dayOfWeek: 'Wednesday',
              releaseTime: weekStart.toISOString(),
              fileUrl: `https://example.com/materials/week${week}_lab.pdf`,
              fileName: `Week${week}_Lab.pdf`,
              isUploaded: true,
              isVisible: true,
              documents: []
            }
          ],
          assignments: week % 2 === 0 ? [
            {
              id: `assign_${week}_1`,
              title: `Assignment ${Math.ceil(week/2)}`,
              description: `Practical assignment covering topics from weeks ${week-1} and ${week}`,
              type: 'document',
              assignDate: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Wednesday
              dueDate: new Date(weekStart.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(), // Next Wednesday
              maxMarks: 20,
              instructions: 'Submit as PDF document with proper formatting and references',
              fileUrl: `https://example.com/assignments/assignment${Math.ceil(week/2)}.pdf`,
              fileName: `Assignment${Math.ceil(week/2)}.pdf`,
              isUploaded: true,
              requiresAICheck: false,
              documents: []
            }
          ] : [],
          exams: (week === 6 || week === 12) ? [
            {
              id: `exam_${week}_1`,
              title: week === 6 ? 'Midterm Examination' : 'Final Examination',
              description: week === 6 ? 'Comprehensive midterm covering weeks 1-6' : 'Final exam covering all semester content',
              type: week === 6 ? 'cat' : 'exam',
              examDate: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Friday
              examTime: '09:00',
              duration: week === 6 ? 90 : 120,
              venue: 'Main Hall',
              maxMarks: week === 6 ? 50 : 100,
              instructions: 'Bring your student ID and calculator. No mobile phones allowed.',
              isLocked: false,
              questions: [],
              approvalStatus: 'approved',
              approvedBy: 'hod_123',
              approvedAt: new Date().toISOString(),
              hodComments: 'Exam format approved'
            }
          ] : []
        };
        
        semesterPlan.weekPlans.push(weekPlan);
      }
      
      // 3. Save the semester plan
      const createResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(semesterPlan)
      });
      
      const createResult = await createResponse.json();
      
      if (createResponse.ok) {
        console.log(`✅ Created semester plan for ${unitId}`);
        console.log(`   - ${semesterPlan.weekPlans.length} weeks`);
        console.log(`   - ${semesterPlan.weekPlans.reduce((sum, w) => sum + w.materials.length, 0)} materials`);
        console.log(`   - ${semesterPlan.weekPlans.reduce((sum, w) => sum + w.assignments.length, 0)} assignments`);
        console.log(`   - ${semesterPlan.weekPlans.reduce((sum, w) => sum + w.exams.length, 0)} exams`);
      } else {
        console.log(`❌ Failed to create plan for ${unitId}:`, createResult);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${unitId}:`, error.message);
    }
  }
  
  console.log('\n🎯 Testing semester plan retrieval...');
  
  // Test retrieval for each unit
  for (const unitId of testUnits) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.plan && result.plan.weekPlans && result.plan.weekPlans.length > 0) {
        console.log(`✅ ${unitId}: Found plan with ${result.plan.weekPlans.length} weeks`);
      } else {
        console.log(`⚠️ ${unitId}: No plan found or empty plan`);
      }
    } catch (error) {
      console.log(`❌ ${unitId}: Error retrieving plan - ${error.message}`);
    }
  }
}

function getWeekTopic(week) {
  const topics = [
    'Introduction and Course Overview',
    'Fundamental Concepts',
    'Basic Principles and Theory',
    'Practical Applications',
    'Advanced Concepts',
    'Case Studies and Examples',
    'Problem Solving Techniques',
    'Research Methods',
    'Project Development',
    'Integration and Synthesis',
    'Advanced Applications',
    'Review and Final Assessment'
  ];
  
  return topics[week - 1] || `Week ${week} Content`;
}

// Run the test
testStudentSemesterPlan().catch(console.error);
