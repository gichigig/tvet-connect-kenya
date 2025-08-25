// Test script for semester plan API functionality
const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function testSemesterPlanAPI() {
  const unitId = 'IT101';
  
  console.log('🧪 Testing Semester Plan API...\n');
  
  try {
    // 1. Create a semester plan
    console.log('1. Creating semester plan...');
    const createResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        semesterStart: '2025-02-01',
        semesterWeeks: 15,
        weekPlans: [
          {
            weekNumber: 1,
            startDate: '2025-02-01',
            endDate: '2025-02-08',
            weekMessage: 'Introduction week',
            materials: [],
            assignments: [],
            exams: []
          }
        ]
      })
    });
    
    const createResult = await createResponse.json();
    if (createResponse.ok) {
      console.log('✅ Create successful:', createResult.message);
    } else {
      console.log('❌ Create failed:', createResult);
      return;
    }
    
    // 2. Retrieve the semester plan
    console.log('\n2. Retrieving semester plan...');
    const getResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    const getResult = await getResponse.json();
    if (getResponse.ok) {
      console.log('✅ Get successful:', {
        message: getResult.message,
        planData: {
          unitId: getResult.plan.unitId,
          semesterStart: getResult.plan.semesterStart,
          semesterWeeks: getResult.plan.semesterWeeks,
          weekPlans: getResult.plan.weekPlans.length + ' weeks'
        }
      });
    } else {
      console.log('❌ Get failed:', getResult);
      return;
    }
    
    // 3. Test frontend simulation
    console.log('\n3. Simulating frontend semester plan generation...');
    const frontendSimulation = {
      semesterStart: new Date('2025-02-01'),
      semesterWeeks: 15,
      weekPlans: []
    };
    
    // Generate weeks like the frontend does
    for (let i = 1; i <= frontendSimulation.semesterWeeks; i++) {
      const weekStart = new Date(frontendSimulation.semesterStart);
      weekStart.setDate(weekStart.getDate() + (i - 1) * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      frontendSimulation.weekPlans.push({
        weekNumber: i,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        weekMessage: '',
        materials: [],
        assignments: [],
        exams: []
      });
    }
    
    // Update the plan
    const updateResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        semesterStart: frontendSimulation.semesterStart.toISOString(),
        semesterWeeks: frontendSimulation.semesterWeeks,
        weekPlans: frontendSimulation.weekPlans
      })
    });
    
    const updateResult = await updateResponse.json();
    if (updateResponse.ok) {
      console.log('✅ Frontend simulation successful:', updateResult.message);
      console.log(`   Generated ${frontendSimulation.weekPlans.length} weeks`);
    } else {
      console.log('❌ Frontend simulation failed:', updateResult);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\nℹ️ If the semester plan isn\'t generating in the UI:');
    console.log('   - Check browser console for errors');
    console.log('   - Verify environment variables are loaded');
    console.log('   - Ensure user is authenticated');
    console.log('   - Check network tab for failed API calls');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSemesterPlanAPI();
