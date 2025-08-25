// Test script to create semester plans for actual unit IDs
const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function createTestSemesterPlan() {
  console.log('🧪 Creating Test Semester Plan for Real Unit ID...\n');
  
  // Based on the codebase analysis, units are created with timestamp IDs
  // Let's create semester plans for the most common unit codes that would exist
  const unitIdsToTest = [
    'cs201', // Common unit code
    'cs101', // Another common unit code
    'math101',
    'eng101'
  ];
  
  for (const unitId of unitIdsToTest) {
    console.log(`\n📚 Creating semester plan for unit: ${unitId}`);
    
    try {
      // Create a comprehensive semester plan with 8 weeks
      const semesterPlan = {
        semesterStart: '2025-01-13', // Current week
        semesterWeeks: 8,
        weekPlans: []
      };
      
      // Generate 8 weeks of content
      for (let week = 1; week <= 8; week++) {
        const weekStart = new Date('2025-01-13');
        weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekPlan = {
          weekNumber: week,
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          weekMessage: `This is Week ${week} - ${getWeekDescription(week)}`,
          materials: [
            {
              id: `material_${unitId}_week${week}_1`,
              title: `Week ${week} Lecture Notes`,
              description: `Comprehensive lecture notes covering ${getWeekDescription(week)}`,
              type: 'material',
              dayOfWeek: 'Monday',
              releaseTime: weekStart.toISOString(),
              fileUrl: `https://example.com/notes/week${week}.pdf`,
              fileName: `Week_${week}_Notes.pdf`,
              isUploaded: true,
              isVisible: true,
              documents: []
            },
            {
              id: `material_${unitId}_week${week}_2`,
              title: `Week ${week} Reading Materials`,
              description: `Additional reading materials for week ${week}`,
              type: 'material',
              dayOfWeek: 'Wednesday',
              releaseTime: weekStart.toISOString(),
              fileUrl: `https://example.com/readings/week${week}.pdf`,
              fileName: `Week_${week}_Readings.pdf`,
              isUploaded: true,
              isVisible: true,
              documents: []
            }
          ],
          assignments: week % 3 === 0 ? [
            {
              id: `assignment_${unitId}_week${week}`,
              title: `Assignment ${Math.ceil(week/3)}`,
              description: `Practical assignment covering material from week ${week}`,
              type: 'document',
              assignDate: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tuesday
              dueDate: new Date(weekStart.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(), // Next Tuesday
              maxMarks: 25,
              instructions: 'Complete all questions and submit as PDF. Show your working.',
              fileUrl: `https://example.com/assignments/assignment${Math.ceil(week/3)}.pdf`,
              fileName: `Assignment_${Math.ceil(week/3)}.pdf`,
              isUploaded: true,
              requiresAICheck: false,
              documents: []
            }
          ] : [],
          exams: week === 8 ? [
            {
              id: `exam_${unitId}_final`,
              title: 'Final Examination',
              description: 'Comprehensive final exam covering all course material',
              type: 'exam',
              examDate: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Saturday
              examTime: '09:00',
              duration: 120,
              venue: 'Main Examination Hall',
              maxMarks: 100,
              instructions: 'Bring your student ID, calculator allowed. No mobile phones.',
              isLocked: false,
              questions: [],
              approvalStatus: 'approved',
              approvedBy: 'hod_001',
              approvedAt: new Date().toISOString(),
              hodComments: 'Final exam approved for scheduling'
            }
          ] : (week === 4 ? [
            {
              id: `cat_${unitId}_midterm`,
              title: 'Midterm CAT',
              description: 'Continuous Assessment Test covering weeks 1-4',
              type: 'cat',
              examDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Thursday
              examTime: '14:00',
              duration: 60,
              venue: 'Classroom A',
              maxMarks: 30,
              instructions: 'Answer all questions in the provided answer booklet.',
              isLocked: false,
              questions: [],
              approvalStatus: 'approved',
              approvedBy: 'hod_001',
              approvedAt: new Date().toISOString(),
              hodComments: 'CAT approved for administration'
            }
          ] : [])
        };
        
        semesterPlan.weekPlans.push(weekPlan);
      }
      
      // Create the semester plan
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
        console.log(`✅ Successfully created semester plan for ${unitId}`);
        console.log(`   📚 ${semesterPlan.weekPlans.length} weeks planned`);
        console.log(`   📖 ${semesterPlan.weekPlans.reduce((sum, w) => sum + w.materials.length, 0)} materials`);
        console.log(`   📝 ${semesterPlan.weekPlans.reduce((sum, w) => sum + w.assignments.length, 0)} assignments`);
        console.log(`   📋 ${semesterPlan.weekPlans.reduce((sum, w) => sum + w.exams.length, 0)} exams/CATs`);
      } else {
        console.log(`❌ Failed to create plan for ${unitId}:`, createResult.error || createResult.message);
      }
      
    } catch (error) {
      console.log(`❌ Error creating plan for ${unitId}:`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🔍 Testing plan retrieval...');
  
  // Test retrieving the plans
  for (const unitId of unitIdsToTest) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.plan && result.plan.weekPlans && result.plan.weekPlans.length > 0) {
        console.log(`✅ ${unitId}: Retrieved plan with ${result.plan.weekPlans.length} weeks`);
        console.log(`   First week: ${result.plan.weekPlans[0].weekMessage}`);
      } else {
        console.log(`⚠️ ${unitId}: No plan found (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${unitId}: Error - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

function getWeekDescription(week) {
  const descriptions = [
    'Course Introduction and Overview',
    'Fundamental Concepts and Principles',
    'Core Theory and Applications',
    'Practical Exercises and Examples',
    'Advanced Topics and Case Studies',
    'Problem-Solving Techniques',
    'Project Work and Implementation',
    'Review and Assessment Preparation'
  ];
  
  return descriptions[week - 1] || `Week ${week} Content`;
}

// Run the test
createTestSemesterPlan().catch(console.error);
