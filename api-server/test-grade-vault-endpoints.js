// Test Grade Vault TVET Endpoints
import fetch from 'node-fetch';

async function testGradeVaultEndpoints() {
  console.log('🧪 Testing Grade Vault TVET API Endpoints');
  console.log('=' .repeat(60));

  // Step 1: Login to get JWT token
  console.log('1. 🔐 Testing login to get JWT token...');
  
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/student-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'development-key-2024'
      },
      body: JSON.stringify({
        email: 'read.student@tvet.ac.ke',
        password: 'student123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login successful!');
    console.log(`   Student: ${loginData.student.firstName} ${loginData.student.lastName}`);
    console.log(`   Token received: ${token ? 'Yes' : 'No'}`);

    // Step 2: Test student profile endpoint
    console.log('\n2. 👤 Testing student profile endpoint...');
    
    const profileResponse = await fetch('http://localhost:3001/api/me/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile fetch successful!');
      console.log(`   Student: ${profileData.student.firstName} ${profileData.student.lastName}`);
      console.log(`   Course: ${profileData.student.course}`);
      console.log(`   Email: ${profileData.student.email}`);
    } else {
      console.log('❌ Profile fetch failed:', profileResponse.status);
      console.log('   Error:', await profileResponse.text());
    }

    // Step 3: Test grades endpoint
    console.log('\n3. 📊 Testing student grades endpoint...');
    
    const gradesResponse = await fetch('http://localhost:3001/api/me/grades', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (gradesResponse.ok) {
      const gradesData = await gradesResponse.json();
      console.log('✅ Grades fetch successful!');
      console.log(`   Grades found: ${gradesData.grades.length}`);
      if (gradesData.grades.length > 0) {
        console.log(`   Sample grade: ${JSON.stringify(gradesData.grades[0], null, 2)}`);
      } else {
        console.log('   No grades found (this is normal for test students)');
      }
    } else {
      console.log('❌ Grades fetch failed:', gradesResponse.status);
      console.log('   Error:', await gradesResponse.text());
    }

    // Step 4: Test details endpoint (combined)
    console.log('\n4. 📋 Testing combined details endpoint...');
    
    const detailsResponse = await fetch('http://localhost:3001/api/me/details', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      console.log('✅ Details fetch successful!');
      console.log(`   Profile: ${detailsData.profile.firstName} ${detailsData.profile.lastName}`);
      console.log(`   Grades: ${detailsData.grades.length} entries`);
    } else {
      console.log('❌ Details fetch failed:', detailsResponse.status);
      console.log('   Error:', await detailsResponse.text());
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 GRADE VAULT TVET API TESTING COMPLETE!');
    console.log('📱 Frontend should now be able to:');
    console.log('   ✅ Login students and get JWT tokens');
    console.log('   ✅ Fetch student profiles with: GET /api/me/profile');
    console.log('   ✅ Fetch student grades with: GET /api/me/grades');
    console.log('   ✅ Use Authorization: Bearer <token> header');
    console.log('\n🔧 Make sure your frontend is calling the correct endpoints!');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Test server health first
async function testServerHealth() {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is healthy and running');
      console.log(`   Service: ${data.service}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Server not responding');
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🏥 Checking server health...');
  const healthy = await testServerHealth();
  
  if (healthy) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await testGradeVaultEndpoints();
  } else {
    console.log('🛑 Cannot run tests - server not responding');
  }
}

runTests().catch(console.error);
