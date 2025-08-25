import fetch from 'node-fetch';

// Test credentials from our created students
const testCredentials = [
  { 
    email: 'test.student@tvet.ac.ke', 
    password: 'TestPassword123',
    name: 'Test Student'
  },
  { 
    email: 'john.doe@tvet.ac.ke', 
    password: 'Password123',
    name: 'John Doe'
  },
  { 
    email: 'jane.smith@tvet.ac.ke', 
    password: 'Password223',
    name: 'Jane Smith'
  },
  { 
    email: 'mike.johnson@tvet.ac.ke', 
    password: 'Password323',
    name: 'Mike Johnson'
  },
  { 
    email: 'read.student@tvet.ac.ke', 
    password: 'ReadPassword123',
    name: 'Read Student'
  }
];

async function testAPILogin(email, password, studentName, port = 3000) {
  try {
    console.log(`\n🌐 Testing API login for: ${studentName}`);
    console.log('=' .repeat(50));
    
    // Test the /auth/verify endpoint (general login)
    console.log('1. Testing /auth/verify endpoint...');
    const verifyResponse = await fetch(`http://localhost:${port}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'development-key-2024'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ /auth/verify SUCCESS');
      console.log(`   Message: ${verifyData.message}`);
      console.log(`   User: ${verifyData.user.firstName} ${verifyData.user.lastName}`);
      console.log(`   Course: ${verifyData.user.course}`);
      console.log(`   Token received: ${verifyData.token ? 'Yes' : 'No'}`);
    } else {
      const verifyError = await verifyResponse.text();
      console.log('❌ /auth/verify FAILED');
      console.log(`   Status: ${verifyResponse.status}`);
      console.log(`   Error: ${verifyError}`);
    }
    
    // Test the /auth/student-login endpoint (Grade Vault TVET specific)
    console.log('2. Testing /auth/student-login endpoint...');
    const studentResponse = await fetch(`http://localhost:${port}/api/auth/student-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'development-key-2024'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (studentResponse.ok) {
      const studentData = await studentResponse.json();
      console.log('✅ /auth/student-login SUCCESS');
      console.log(`   Message: ${studentData.message}`);
      console.log(`   Student: ${studentData.student.firstName} ${studentData.student.lastName}`);
      console.log(`   Course: ${studentData.student.course}`);
      console.log(`   Admission: ${studentData.student.admissionNumber}`);
      console.log(`   Token received: ${studentData.token ? 'Yes' : 'No'}`);
      
      return {
        success: true,
        student: studentData.student,
        token: studentData.token
      };
    } else {
      const studentError = await studentResponse.text();
      console.log('❌ /auth/student-login FAILED');
      console.log(`   Status: ${studentResponse.status}`);
      console.log(`   Error: ${studentError}`);
      
      return {
        success: false,
        error: studentError
      };
    }
    
  } catch (error) {
    console.error(`❌ API test failed for ${studentName}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkAPIServerStatus() {
  try {
    console.log('🔍 Checking API server status...');
    
    // Try port 3000 first, then 3001
    const ports = [3000, 3001];
    
    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}/health`, {
          headers: {
            'x-api-key': 'development-key-2024'
          }
        });
        
        if (response.ok) {
          console.log(`✅ API server is running on http://localhost:${port}`);
          return port;
        }
      } catch (error) {
        // Try next port
        continue;
      }
    }
    
    console.log('❌ API server is not running on ports 3000 or 3001');
    console.log('   Please start the API server with: start-server-3000.bat');
    return null;
    
  } catch (error) {
    console.log('❌ Error checking server status:', error.message);
    return null;
  }
}

async function runAPILoginTests() {
  try {
    console.log('🧪 Testing API Login Endpoints\n');
    
    // Check if API server is running
    const serverRunning = await checkAPIServerStatus();
    
    if (!serverRunning) {
      console.log('\n🚀 To start the API server:');
      console.log('   1. Open a new terminal');
      console.log('   2. Navigate to the api-server directory');
      console.log('   3. Run: node server.js');
      console.log('   4. Then run this test again');
      return;
    }
    
    console.log('\n📊 Testing login for all created students...\n');
    
    const results = [];
    
    for (const cred of testCredentials) {
      const result = await testAPILogin(cred.email, cred.password, cred.name);
      results.push({
        ...cred,
        result
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 API LOGIN TEST SUMMARY');
    console.log('='.repeat(70));
    
    const successful = results.filter(r => r.result.success);
    const failed = results.filter(r => !r.result.success);
    
    console.log(`✅ Successful API logins: ${successful.length}`);
    console.log(`❌ Failed API logins: ${failed.length}`);
    console.log(`📊 Total tested: ${results.length}`);
    
    if (successful.length > 0) {
      console.log('\n🎉 WORKING CREDENTIALS FOR GRADE VAULT TVET API:');
      console.log('-'.repeat(60));
      successful.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   📧 Email: ${item.email}`);
        console.log(`   🔑 Password: ${item.password}`);
        if (item.result.student) {
          console.log(`   🎓 Course: ${item.result.student.course}`);
          console.log(`   🆔 Admission: ${item.result.student.admissionNumber}`);
        }
        console.log('   ' + '-'.repeat(40));
      });
    }
    
    if (failed.length > 0) {
      console.log('\n⚠️  FAILED API LOGINS:');
      console.log('-'.repeat(40));
      failed.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.email})`);
        console.log(`   Error: ${item.result.error}`);
      });
    }
    
    console.log('\n🎯 FRONTEND TESTING GUIDE:');
    console.log('1. Open the frontend at: http://localhost:5174');
    console.log('2. Navigate to the Grade Vault TVET login page');
    console.log('3. Use any of the working credentials above');
    console.log('4. Verify successful login and dashboard access');
    
    console.log('\n🔧 API ENDPOINTS TESTED:');
    console.log('• POST /api/auth/verify - General authentication');
    console.log('• POST /api/auth/student-login - Grade Vault TVET specific login');
    
  } catch (error) {
    console.error('❌ Error running API login tests:', error);
  }
}

// Run the API tests
runAPILoginTests();
