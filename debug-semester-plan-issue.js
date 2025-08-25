// Debug script to test semester plan visibility issue
const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function debugSemesterPlanIssue() {
  console.log('🔍 Debugging Semester Plan Visibility Issue...\n');
  
  // Test if API server is responding
  console.log('1️⃣ Testing API Server Health...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.text();
    console.log('✅ API Server Health:', healthData);
  } catch (error) {
    console.log('❌ API Server Health Check Failed:', error.message);
    return;
  }
  
  // Test semester plan endpoints for our created units
  const testUnits = ['cs201', 'cs101', 'math101', 'eng101'];
  
  console.log('\n2️⃣ Testing Semester Plan Endpoints...');
  for (const unitId of testUnits) {
    try {
      console.log(`\n📚 Testing unit: ${unitId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.plan && data.plan.weekPlans && data.plan.weekPlans.length > 0) {
          console.log(`   ✅ Plan found: ${data.plan.weekPlans.length} weeks`);
          console.log(`   📅 Semester Start: ${data.plan.semesterStart}`);
          console.log(`   📖 First Week Message: ${data.plan.weekPlans[0]?.weekMessage}`);
        } else {
          console.log(`   ⚠️ Plan exists but empty or malformed`);
          console.log(`   Plan data:`, JSON.stringify(data, null, 2));
        }
      } else {
        const errorData = await response.text();
        console.log(`   ❌ Error: ${errorData}`);
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }
  
  // Test frontend API configuration
  console.log('\n3️⃣ Testing Frontend API Configuration...');
  console.log(`   VITE_API_BASE_URL: ${process.env.VITE_API_BASE_URL || 'http://localhost:3001'}`);
  console.log(`   VITE_API_KEY: ${process.env.VITE_API_KEY ? 'Present' : 'Missing'}`);
  
  // Test direct frontend API call simulation
  console.log('\n4️⃣ Simulating Frontend API Call...');
  
  const frontendApiKey = process.env.VITE_API_KEY || 'tvet_1fd0f562039f427aac9bf7bdf515b804';
  const frontendBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
  
  try {
    const testResponse = await fetch(`${frontendBaseUrl}/api/semester/plans/cs201`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': frontendApiKey,
      },
    });
    
    console.log(`   Frontend simulation status: ${testResponse.status}`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log(`   ✅ Frontend simulation successful`);
      console.log(`   Plan weeks: ${testData.plan?.weekPlans?.length || 0}`);
    } else {
      const errorText = await testResponse.text();
      console.log(`   ❌ Frontend simulation failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Frontend simulation error: ${error.message}`);
  }
  
  // Check for CORS issues
  console.log('\n5️⃣ Checking for CORS Issues...');
  try {
    const corsTestResponse = await fetch(`${API_BASE_URL}/api/semester/plans/cs201`, {
      method: 'OPTIONS'
    });
    console.log(`   CORS preflight status: ${corsTestResponse.status}`);
    console.log(`   Access-Control-Allow-Origin: ${corsTestResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   Access-Control-Allow-Methods: ${corsTestResponse.headers.get('Access-Control-Allow-Methods')}`);
  } catch (error) {
    console.log(`   ❌ CORS test failed: ${error.message}`);
  }
  
  // Test semester plan creation (to verify if data persists)
  console.log('\n6️⃣ Testing New Semester Plan Creation...');
  try {
    const testPlan = {
      semesterStart: '2025-01-13',
      semesterWeeks: 2,
      weekPlans: [
        {
          weekNumber: 1,
          startDate: '2025-01-13T00:00:00.000Z',
          endDate: '2025-01-19T23:59:59.999Z',
          weekMessage: 'Test Week 1 - Debug Message',
          materials: [],
          assignments: [],
          exams: []
        },
        {
          weekNumber: 2,
          startDate: '2025-01-20T00:00:00.000Z',
          endDate: '2025-01-26T23:59:59.999Z',
          weekMessage: 'Test Week 2 - Debug Message',
          materials: [],
          assignments: [],
          exams: []
        }
      ]
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/api/semester/plans/debug_test_unit`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPlan)
    });
    
    if (createResponse.ok) {
      console.log('   ✅ Test plan creation successful');
      
      // Immediately try to retrieve it
      const retrieveResponse = await fetch(`${API_BASE_URL}/api/semester/plans/debug_test_unit`, {
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      if (retrieveResponse.ok) {
        const retrievedData = await retrieveResponse.json();
        console.log('   ✅ Test plan retrieval successful');
        console.log(`   Retrieved weeks: ${retrievedData.plan?.weekPlans?.length || 0}`);
      } else {
        console.log('   ❌ Test plan retrieval failed immediately after creation');
      }
    } else {
      const createError = await createResponse.text();
      console.log(`   ❌ Test plan creation failed: ${createError}`);
    }
  } catch (error) {
    console.log(`   ❌ Test plan creation error: ${error.message}`);
  }
  
  console.log('\n🎯 Diagnosis Summary:');
  console.log('If all tests pass but frontend still shows "no semester plan", the issue is likely:');
  console.log('1. Frontend caching/state management issues');
  console.log('2. Component not re-rendering after data changes');
  console.log('3. Unit ID mismatch in the component hierarchy');
  console.log('4. SemesterPlanContext not properly updating state');
}

// Run the diagnostic
debugSemesterPlanIssue().catch(console.error);
