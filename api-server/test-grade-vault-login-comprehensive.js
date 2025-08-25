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
          const loginResponse = await fetch('http://localhost:3001/api/auth/verify', {
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
            console.log('❌ Grade Vault API server is not running on localhost:3001');
            console.log('ℹ️  Please start the API server first');
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
    console.log('1. Check that API server is running on localhost:3001');
    console.log('2. Verify students have email indexes created');
    console.log('3. Ensure student credentials exist in studentCredentials collection');
    console.log('4. Test login with the credentials shown above');
    console.log('\n🔧 To start API server:');
    console.log('cd C:\\Users\\billy\\shiuy\\tvet-connect-kenya\\api-server');
    console.log('node server.js');
    
  } catch (error) {
    console.error('❌ Error testing Grade Vault login:', error);
  } finally {
    process.exit(0);
  }
}

testGradeVaultLogin();
