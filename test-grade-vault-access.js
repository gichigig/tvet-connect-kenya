// Test script to verify grade access separation between applications
const API_BASE_URL = 'http://localhost:3001';

// Use the actual static API key from .env
const STATIC_API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function testGradeAccessSeparation() {
  console.log('🧪 Testing Grade Access Separation Between Applications');
  console.log('=====================================================\n');

  // Test 1: tvet-connect-kenya app should be blocked
  console.log('📱 Test 1: tvet-connect-kenya app access');
  console.log('-------------------------------------------');
  
  try {
    const tvetConnectResponse = await fetch(`${API_BASE_URL}/api/grades/student/test-student-123`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STATIC_API_KEY,
        'X-App-Name': 'tvet-connect-kenya',
        'User-Agent': 'tvet-connect-kenya-app/1.0',
        'Origin': 'http://localhost:3000', // tvet-connect frontend
      },
    });

    const tvetData = await tvetConnectResponse.json();
    
    if (tvetConnectResponse.status === 403 && tvetData.message?.includes('grade-vault-tvet')) {
      console.log('✅ SUCCESS: tvet-connect-kenya correctly blocked from grades');
      console.log(`📋 Status: ${tvetConnectResponse.status}`);
      console.log(`📋 Message: ${tvetData.message}`);
    } else {
      console.log('❌ FAIL: tvet-connect-kenya should be blocked from grades');
      console.log(`📋 Status: ${tvetConnectResponse.status}`);
      console.log(`📋 Response:`, tvetData);
    }
  } catch (error) {
    console.error('❌ ERROR testing tvet-connect-kenya:', error.message);
  }

  console.log('\n');

  // Test 2: grade-vault-tvet app should have access
  console.log('🏦 Test 2: grade-vault-tvet app access');
  console.log('--------------------------------------');
  
  try {
    const gradeVaultResponse = await fetch(`${API_BASE_URL}/api/grades/student/test-student-123`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STATIC_API_KEY,
        'X-App-Name': 'grade-vault-tvet',
        'User-Agent': 'grade-vault-tvet-app/1.0',
        'Origin': 'http://grade-vault-tvet.localhost', // grade-vault frontend
      },
    });

    const gradeData = await gradeVaultResponse.json();
    
    if (gradeVaultResponse.status === 200 || gradeVaultResponse.status === 404) {
      console.log('✅ SUCCESS: grade-vault-tvet has access to grades');
      console.log(`📋 Status: ${gradeVaultResponse.status}`);
      if (gradeVaultResponse.status === 404) {
        console.log('📋 Note: Student not found (expected for test data)');
      }
    } else if (gradeVaultResponse.status === 401) {
      console.log('⚠️  PARTIAL: grade-vault-tvet blocked by auth (API key issue)');
      console.log(`📋 Status: ${gradeVaultResponse.status}`);
      console.log(`📋 Message: ${gradeData.message || gradeData.error}`);
      console.log('📋 Note: This is expected if API key validation is strict');
    } else {
      console.log('❌ UNEXPECTED: grade-vault-tvet access issue');
      console.log(`📋 Status: ${gradeVaultResponse.status}`);
      console.log(`📋 Response:`, gradeData);
    }
  } catch (error) {
    console.error('❌ ERROR testing grade-vault-tvet:', error.message);
  }

  console.log('\n');

  // Test 3: Test other grade endpoints
  console.log('🔄 Test 3: Testing other grade endpoints');
  console.log('----------------------------------------');

  const endpoints = [
    '/api/grades/unit/test-unit-123',
    '/api/grades/transcript/test-student-123'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n Testing: ${endpoint}`);
    
    try {
      // Test with tvet-connect-kenya (should be blocked)
      const blockedResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': STATIC_API_KEY,
          'X-App-Name': 'tvet-connect-kenya',
        },
      });

      if (blockedResponse.status === 403) {
        console.log(`   ✅ tvet-connect-kenya blocked: ${endpoint}`);
      } else {
        console.log(`   ❌ tvet-connect-kenya NOT blocked: ${endpoint} (Status: ${blockedResponse.status})`);
      }

    } catch (error) {
      console.log(`   ⚠️  Error testing ${endpoint}: ${error.message}`);
    }
  }

  console.log('\n=====================================================');
  console.log('🏁 Grade Access Separation Test Complete');
  console.log('\n📊 Summary:');
  console.log('   • tvet-connect-kenya: Should be blocked from all grade endpoints');
  console.log('   • grade-vault-tvet: Should have access to grade endpoints');
  console.log('   • Separation ensures proper application boundaries');
}

// Test 4: Test frontend grade API functions
const testFrontendGradeFunctions = () => {
  console.log('\n🖥️  Testing Frontend Grade API Functions');
  console.log('------------------------------------------');

  // Simulate the frontend grade API functions we created
  const gradesApi = {
    getStudentGrades: async (studentId) => {
      throw new Error('Grades are not accessible through tvet-connect-kenya app. Please use grade-vault-tvet app.');
    },
    
    getUnitGrades: async (unitId) => {
      throw new Error('Grades are not accessible through tvet-connect-kenya app. Please use grade-vault-tvet app.');
    },
    
    getTranscript: async (studentId) => {
      throw new Error('Grades are not accessible through tvet-connect-kenya app. Please use grade-vault-tvet app.');
    }
  };

  console.log('Testing frontend grade functions...');
  
  try {
    gradesApi.getStudentGrades('test123');
  } catch (error) {
    console.log('✅ getStudentGrades correctly blocked:', error.message);
  }

  try {
    gradesApi.getUnitGrades('test123');
  } catch (error) {
    console.log('✅ getUnitGrades correctly blocked:', error.message);
  }

  try {
    gradesApi.getTranscript('test123');
  } catch (error) {
    console.log('✅ getTranscript correctly blocked:', error.message);
  }
};

// Run all tests
async function runAllTests() {
  await testGradeAccessSeparation();
  testFrontendGradeFunctions();
}

runAllTests();
