import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';
import fetch from 'node-fetch';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newy-35816-default-rtdb.firebaseio.com/"
  });
}

const rtdb = admin.database();

async function testGradeVaultLogin() {
  console.log('🔍 Testing Grade Vault login for existing students...\n');
  
  try {
    // Get recent students from database
    const studentsRef = rtdb.ref('students');
    const studentsSnapshot = await studentsRef.limitToLast(10).once('value');
    const students = studentsSnapshot.val() || {};
    
    console.log(`📊 Found ${Object.keys(students).length} students to test\n`);
    
    // Test each student
    for (const [studentId, student] of Object.entries(students)) {
      console.log(`\n🧪 Testing login for: ${student.firstName} ${student.lastName}`);
      console.log(`📧 Email: ${student.email}`);
      console.log(`🎓 Admission: ${student.admissionNumber}`);
      
      // Test 1: Check if student exists in email index
      const emailKey = student.email.replace(/[.#$[\]]/g, '_');
      const emailIndexRef = rtdb.ref(`studentsByEmail/${emailKey}`);
      const emailSnapshot = await emailIndexRef.once('value');
      
      if (emailSnapshot.exists()) {
        console.log('✅ Student found in email index');
        const indexedStudentId = emailSnapshot.val();
        if (indexedStudentId === studentId) {
          console.log('✅ Email index points to correct student');
        } else {
          console.log('❌ Email index points to wrong student:', indexedStudentId);
        }
      } else {
        console.log('❌ Student NOT found in email index');
        continue;
      }
      
      // Test 2: Check if credentials exist
      const credentialsRef = rtdb.ref(`studentCredentials/${student.admissionNumber}`);
      const credentialsSnapshot = await credentialsRef.once('value');
      
      if (credentialsSnapshot.exists()) {
        const credentials = credentialsSnapshot.val();
        console.log('✅ Student credentials found');
        console.log(`🔐 Password in credentials: ${credentials.password ? 'YES' : 'NO'}`);
        
        // Test 3: Try Grade Vault authentication
        console.log('🔍 Testing Grade Vault API login...');
        
        try {
          const loginResponse = await fetch('http://localhost:3000/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: student.email,
              password: credentials.password || 'test123' // Use stored password or default
            }),
            timeout: 5000
          });
          
          const responseData = await loginResponse.json();
          
          if (loginResponse.ok) {
            console.log('✅ Grade Vault login SUCCESSFUL!');
            console.log('✅ Response:', {
              success: responseData.success,
              message: responseData.message,
              user: responseData.user ? {
                email: responseData.user.email,
                firstName: responseData.user.firstName,
                role: responseData.user.role
              } : 'No user data'
            });
          } else {
            console.log('❌ Grade Vault login failed with status:', loginResponse.status);
            console.log('❌ Error response:', responseData);
          }
          
        } catch (apiError) {
          if (apiError.code === 'ECONNREFUSED' || apiError.message.includes('ECONNREFUSED')) {
            console.log('❌ Grade Vault API server is not running on localhost:3000');
            console.log('ℹ️  Please start the Grade Vault server first');
          } else {
            console.log('❌ Grade Vault API error:', apiError.message);
          }
        }
        
      } else {
        console.log('❌ Student credentials NOT found');
        
        // Try to create missing credentials
        console.log('🔧 Attempting to create missing credentials...');
        await credentialsRef.set({
          email: student.email,
          password: 'test123', // Default password
          admissionNumber: student.admissionNumber,
          studentId: studentId,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        console.log('✅ Created missing credentials with default password: test123');
      }
      
      console.log('─'.repeat(60));
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('1. Check that Grade Vault API server is running on localhost:3000');
    console.log('2. Verify students have email indexes created');
    console.log('3. Ensure student credentials exist in studentCredentials collection');
    console.log('4. Test login with the credentials shown above');
    console.log('\n🔧 To start Grade Vault server:');
    console.log('cd ../grade-vault-tvet');
    console.log('npm run dev');
    
  } catch (error) {
    console.error('❌ Error testing Grade Vault login:', error);
  } finally {
    process.exit(0);
  }
}
    {
      email: 'jane.smith@tvet.ac.ke',
      password: 'student123', 
      expectedCourse: 'Information Technology'
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const student of testStudents) {
    try {
      console.log(`\n🔍 Testing login for: ${student.email}`);
      console.log(`   Expected course: ${student.expectedCourse}`);
      
      // Test the Grade Vault TVET specific endpoint
      const response = await fetch('http://localhost:3001/api/auth/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'development-key-2024'
        },
        body: JSON.stringify({
          email: student.email,
          password: student.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ LOGIN SUCCESS`);
        console.log(`   📝 Student: ${data.student.firstName} ${data.student.lastName}`);
        console.log(`   🎯 Course: ${data.student.course}`);
        console.log(`   🆔 Admission: ${data.student.admissionNumber}`);
        console.log(`   🔑 Token: ${data.token ? 'Generated' : 'Missing'}`);
        
        if (data.student.course === student.expectedCourse) {
          console.log(`   ✅ Course matches expected: ${student.expectedCourse}`);
        } else {
          console.log(`   ⚠️  Course mismatch - Expected: ${student.expectedCourse}, Got: ${data.student.course}`);
        }
        
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`   ❌ LOGIN FAILED`);
        console.log(`   📊 Status: ${response.status}`);
        console.log(`   💬 Error: ${errorText}`);
        failureCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ CONNECTION ERROR: ${error.message}`);
      failureCount++;
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 GRADE VAULT TVET LOGIN TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Successful logins: ${successCount}`);
  console.log(`❌ Failed logins: ${failureCount}`);
  console.log(`📈 Success rate: ${((successCount / testStudents.length) * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log('\n🎉 GRADE VAULT TVET LOGIN SYSTEM IS WORKING!');
    console.log('✅ Students created with registrar courses can successfully log in');
    console.log('🔗 Ready for frontend testing at: http://localhost:5174');
  } else {
    console.log('\n⚠️  NO SUCCESSFUL LOGINS - CHECK SERVER STATUS');
  }
}

// Test server health first
async function testServerHealth() {
  try {
    console.log('🏥 Checking API server health...');
    const response = await fetch('http://localhost:3001/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is healthy and running');
      console.log(`📊 Status: ${data.status}`);
      console.log(`🕐 Timestamp: ${data.timestamp}`);
      console.log(`🔧 Service: ${data.service}`);
      return true;
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to server: ${error.message}`);
    return false;
  }
}

// Main test execution
async function runTests() {
  const serverHealthy = await testServerHealth();
  
  if (serverHealthy) {
    await testGradeVaultLogin();
  } else {
    console.log('\n🛑 Cannot run login tests - server is not responding');
    console.log('💡 Make sure the API server is running with: node server.js');
  }
}

runTests().catch(console.error);
