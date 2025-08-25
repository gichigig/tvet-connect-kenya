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

async function testUserCreatedStudents() {
  console.log('🎓 Testing Grade Vault login for YOUR registrar-created students...\n');
  
  try {
    // Get all students from database
    const studentsRef = rtdb.ref('students');
    const studentsSnapshot = await studentsRef.once('value');
    const students = studentsSnapshot.val() || {};
    
    console.log(`📊 Total students found: ${Object.keys(students).length}\n`);
    
    // Filter out test students (those likely created by test scripts)
    const userCreatedStudents = Object.entries(students).filter(([id, student]) => {
      // Filter out obvious test students
      const email = student.email?.toLowerCase() || '';
      const firstName = student.firstName?.toLowerCase() || '';
      const lastName = student.lastName?.toLowerCase() || '';
      
      // Skip test students
      if (email.includes('test') || 
          email.includes('example') || 
          firstName.includes('test') || 
          lastName.includes('test') ||
          firstName.includes('debug') ||
          email.includes('debug')) {
        return false;
      }
      
      return true;
    });
    
    console.log(`👤 Your registrar-created students: ${userCreatedStudents.length}\n`);
    
    if (userCreatedStudents.length === 0) {
      console.log('❌ No registrar-created students found!');
      console.log('ℹ️  All students appear to be test students');
      console.log('\n📋 All students in database:');
      for (const [id, student] of Object.entries(students).slice(0, 10)) {
        console.log(`- ${student.firstName} ${student.lastName} (${student.email})`);
      }
      return;
    }
    
    // Test each of your students
    let successCount = 0;
    let failureCount = 0;
    
    for (const [studentId, student] of userCreatedStudents) {
      console.log(`\n🧪 Testing login for YOUR student: ${student.firstName} ${student.lastName}`);
      console.log(`📧 Email: ${student.email}`);
      console.log(`🎓 Admission: ${student.admissionNumber}`);
      console.log(`📅 Created: ${student.createdAt}`);
      
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
          failureCount++;
          continue;
        }
      } else {
        console.log('❌ Student NOT found in email index');
        console.log('🔧 This is likely why login fails - missing email index');
        
        // Try to fix missing email index
        console.log('🔧 Attempting to create missing email index...');
        await emailIndexRef.set(studentId);
        console.log('✅ Created missing email index');
      }
      
      // Test 2: Check if credentials exist
      const credentialsRef = rtdb.ref(`studentCredentials/${student.admissionNumber}`);
      const credentialsSnapshot = await credentialsRef.once('value');
      
      let testPassword = 'test123'; // Default password
      
      if (credentialsSnapshot.exists()) {
        const credentials = credentialsSnapshot.val();
        console.log('✅ Student credentials found');
        testPassword = credentials.password || 'test123';
        console.log(`🔐 Will test with stored password`);
      } else {
        console.log('❌ Student credentials NOT found');
        console.log('🔧 Creating missing credentials with default password...');
        await credentialsRef.set({
          email: student.email,
          password: 'test123',
          admissionNumber: student.admissionNumber,
          studentId: studentId,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        console.log('✅ Created missing credentials with password: test123');
      }
      
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
            password: testPassword
          }),
          timeout: 5000
        });
        
        const responseData = await loginResponse.json();
        
        if (loginResponse.ok && responseData.success) {
          console.log('🎉 Grade Vault login SUCCESSFUL!');
          console.log('✅ Your student can now login to Grade Vault');
          console.log('✅ Login credentials:');
          console.log(`   Email: ${student.email}`);
          console.log(`   Password: ${testPassword}`);
          successCount++;
        } else {
          console.log('❌ Grade Vault login failed');
          console.log('❌ Response:', responseData);
          failureCount++;
        }
        
      } catch (apiError) {
        if (apiError.code === 'ECONNREFUSED' || apiError.message.includes('ECONNREFUSED')) {
          console.log('❌ API server is not running on localhost:3001');
          console.log('ℹ️  Please start the API server first');
        } else {
          console.log('❌ API error:', apiError.message);
        }
        failureCount++;
      }
      
      console.log('─'.repeat(60));
    }
    
    // Summary
    console.log(`\n📊 RESULTS FOR YOUR STUDENTS:`);
    console.log(`✅ Successful logins: ${successCount}`);
    console.log(`❌ Failed logins: ${failureCount}`);
    console.log(`📊 Total tested: ${userCreatedStudents.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 SUCCESS! Your students can now login to Grade Vault!');
      console.log('🔗 Grade Vault URL: http://localhost:8080 (or check the port shown when you start Grade Vault)');
    } else {
      console.log('\n❌ All login attempts failed. Common issues:');
      console.log('1. API server not running on port 3001');
      console.log('2. Missing email indexes (we tried to fix these)');
      console.log('3. Missing credentials (we tried to create these)');
    }
    
  } catch (error) {
    console.error('❌ Error testing user-created students:', error);
  } finally {
    process.exit(0);
  }
}

testUserCreatedStudents();
