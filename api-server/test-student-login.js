import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://newy-35816-default-rtdb.firebaseio.com/'
  });
}

const realtimeDb = admin.database();

async function testStudentLogin(email, password) {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    console.log('=' .repeat(50));
    
    // Step 1: Find student by email (simulating frontend login process)
    console.log('1. Looking up student by email...');
    const emailKey = email.replace(/[.#$[\]]/g, '_');
    const emailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    const emailIndexSnapshot = await emailIndexRef.once('value');
    
    if (!emailIndexSnapshot.exists()) {
      console.log('❌ Student email not found in studentsByEmail index');
      return { success: false, error: 'Student not found' };
    }
    
    const studentId = emailIndexSnapshot.val();
    console.log(`✅ Found student ID: ${studentId}`);
    
    // Step 2: Get student data
    console.log('2. Retrieving student data...');
    const studentRef = realtimeDb.ref(`students/${studentId}`);
    const studentSnapshot = await studentRef.once('value');
    
    if (!studentSnapshot.exists()) {
      console.log('❌ Student data not found');
      return { success: false, error: 'Student data not found' };
    }
    
    const studentData = studentSnapshot.val();
    console.log(`✅ Student found: ${studentData.firstName} ${studentData.lastName}`);
    console.log(`   Course: ${studentData.course || studentData.courseName}`);
    console.log(`   Department: ${studentData.department}`);
    console.log(`   Admission: ${studentData.admissionNumber}`);
    console.log(`   Role: ${studentData.role}`);
    console.log(`   Approved: ${studentData.approved}`);
    
    // Step 3: Check credentials
    console.log('3. Verifying credentials...');
    const credentialsRef = realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`);
    const credentialsSnapshot = await credentialsRef.once('value');
    
    if (!credentialsSnapshot.exists()) {
      console.log('❌ Student credentials not found');
      return { success: false, error: 'Credentials not found' };
    }
    
    const credentials = credentialsSnapshot.val();
    console.log('✅ Credentials found');
    
    // Step 4: Verify password
    console.log('4. Verifying password...');
    const isValidPassword = await bcrypt.compare(password, credentials.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return { success: false, error: 'Invalid password' };
    }
    
    console.log('✅ Password verified successfully');
    
    // Step 5: Check if student is approved and active
    console.log('5. Checking student status...');
    if (!studentData.approved) {
      console.log('⚠️  Student not approved');
      return { success: false, error: 'Student not approved' };
    }
    
    if (studentData.isActive === false) {
      console.log('⚠️  Student account inactive');
      return { success: false, error: 'Student account inactive' };
    }
    
    console.log('✅ Student status: Active and Approved');
    
    // Step 6: Simulate JWT token generation (like backend would do)
    console.log('6. Simulating authentication success...');
    const authResult = {
      success: true,
      student: {
        id: studentId,
        email: studentData.email,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        admissionNumber: studentData.admissionNumber,
        course: studentData.course || studentData.courseName,
        courseId: studentData.courseId,
        department: studentData.department,
        role: studentData.role,
        academicYear: studentData.academicYear,
        semester: studentData.semester
      }
    };
    
    console.log('🎉 LOGIN SUCCESSFUL!');
    console.log('📋 Authentication Details:');
    console.log(`   Student ID: ${authResult.student.id}`);
    console.log(`   Name: ${authResult.student.firstName} ${authResult.student.lastName}`);
    console.log(`   Email: ${authResult.student.email}`);
    console.log(`   Admission: ${authResult.student.admissionNumber}`);
    console.log(`   Course: ${authResult.student.course}`);
    console.log(`   Department: ${authResult.student.department}`);
    
    return authResult;
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return { success: false, error: error.message };
  }
}

async function testAllStudentLogins() {
  try {
    console.log('🧪 Testing login process for all created students...\n');
    
    // Get all students
    const studentsRef = realtimeDb.ref('students');
    const studentsSnapshot = await studentsRef.once('value');
    
    if (!studentsSnapshot.exists()) {
      console.log('❌ No students found for testing');
      return;
    }
    
    const students = studentsSnapshot.val();
    const studentList = Object.entries(students).map(([id, student]) => ({
      id,
      ...student
    }));
    
    console.log(`📊 Found ${studentList.length} students to test\n`);
    
    // Test each student with their known password patterns
    const testCredentials = [
      { email: 'test.student@tvet.ac.ke', password: 'TestPassword123' },
      { email: 'john.doe@tvet.ac.ke', password: 'Password123' },
      { email: 'jane.smith@tvet.ac.ke', password: 'Password223' },
      { email: 'mike.johnson@tvet.ac.ke', password: 'Password323' },
      { email: 'read.student@tvet.ac.ke', password: 'ReadPassword123' }
    ];
    
    const results = [];
    
    for (const student of studentList) {
      // Find matching credentials
      const testCred = testCredentials.find(cred => cred.email === student.email);
      
      if (testCred) {
        const result = await testStudentLogin(testCred.email, testCred.password);
        results.push({
          student: student,
          credentials: testCred,
          result: result
        });
      } else {
        console.log(`\n⚠️  No test credentials found for: ${student.email}`);
        console.log(`   Student: ${student.firstName} ${student.lastName}`);
        console.log(`   Course: ${student.course || student.courseName}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 LOGIN TEST SUMMARY');
    console.log('='.repeat(70));
    
    const successful = results.filter(r => r.result.success);
    const failed = results.filter(r => !r.result.success);
    
    console.log(`✅ Successful logins: ${successful.length}`);
    console.log(`❌ Failed logins: ${failed.length}`);
    console.log(`📊 Total tested: ${results.length}`);
    
    if (successful.length > 0) {
      console.log('\n🎉 WORKING CREDENTIALS FOR GRADE VAULT TVET:');
      console.log('-'.repeat(50));
      successful.forEach((item, index) => {
        console.log(`${index + 1}. ${item.student.firstName} ${item.student.lastName}`);
        console.log(`   📧 Email: ${item.credentials.email}`);
        console.log(`   🔑 Password: ${item.credentials.password}`);
        console.log(`   🎓 Course: ${item.student.course || item.student.courseName}`);
        console.log(`   🏢 Department: ${item.student.department}`);
        console.log('   ' + '-'.repeat(30));
      });
    }
    
    if (failed.length > 0) {
      console.log('\n⚠️  FAILED LOGINS:');
      console.log('-'.repeat(30));
      failed.forEach((item, index) => {
        console.log(`${index + 1}. ${item.credentials.email} - ${item.result.error}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Open Grade Vault TVET login page');
    console.log('2. Use any of the working credentials above');
    console.log('3. Verify student dashboard access');
    console.log('4. Test course content access');
    
  } catch (error) {
    console.error('❌ Error testing student logins:', error);
  } finally {
    process.exit(0);
  }
}

// Run the comprehensive login test
testAllStudentLogins();
