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

async function verifyTestStudent() {
  try {
    console.log('🔍 Verifying test student creation...\n');
    
    const testEmail = 'test.student@tvet.ac.ke';
    const testAdmissionNumber = 'TS2025001';
    const testPassword = 'TestPassword123';
    
    // 1. Check if student exists in students collection
    console.log('1. Checking students collection...');
    const studentsRef = realtimeDb.ref('students');
    const emailSnapshot = await studentsRef.orderByChild('email').equalTo(testEmail).once('value');
    
    if (emailSnapshot.exists()) {
      const students = emailSnapshot.val();
      const studentId = Object.keys(students)[0];
      const student = students[studentId];
      
      console.log('✅ Student found in students collection:');
      console.log(`   ID: ${studentId}`);
      console.log(`   Name: ${student.firstName} ${student.lastName}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Admission Number: ${student.admissionNumber}`);
      console.log(`   Course: ${student.course} (ID: ${student.courseId})`);
      console.log(`   Department: ${student.department}`);
      console.log(`   Role: ${student.role}`);
      console.log(`   Approved: ${student.approved}`);
    } else {
      console.log('❌ Student not found in students collection');
      return;
    }
    
    // 2. Check email index
    console.log('\n2. Checking studentsByEmail index...');
    const emailKey = testEmail.replace(/[.#$[\]]/g, '_');
    const emailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    const emailIndexSnapshot = await emailIndexRef.once('value');
    
    if (emailIndexSnapshot.exists()) {
      const indexedStudentId = emailIndexSnapshot.val();
      console.log(`✅ Email index found: ${emailKey} -> ${indexedStudentId}`);
    } else {
      console.log('❌ Email index not found');
    }
    
    // 3. Check admission number index
    console.log('\n3. Checking studentsByAdmission index...');
    const admissionIndexRef = realtimeDb.ref(`studentsByAdmission/${testAdmissionNumber}`);
    const admissionIndexSnapshot = await admissionIndexRef.once('value');
    
    if (admissionIndexSnapshot.exists()) {
      const indexedStudentId = admissionIndexSnapshot.val();
      console.log(`✅ Admission index found: ${testAdmissionNumber} -> ${indexedStudentId}`);
    } else {
      console.log('❌ Admission index not found');
    }
    
    // 4. Check credentials
    console.log('\n4. Checking student credentials...');
    const credentialsRef = realtimeDb.ref(`studentCredentials/${testAdmissionNumber}`);
    const credentialsSnapshot = await credentialsRef.once('value');
    
    if (credentialsSnapshot.exists()) {
      const credentials = credentialsSnapshot.val();
      console.log('✅ Credentials found');
      
      // Test password verification
      const isValidPassword = await bcrypt.compare(testPassword, credentials.password);
      console.log(`✅ Password verification: ${isValidPassword ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log('❌ Credentials not found');
    }
    
    // 5. Test authentication flow simulation
    console.log('\n5. Simulating authentication flow...');
    
    // Step 5a: Find student by email (like frontend login)
    const studentByEmailRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    const studentByEmailSnapshot = await studentByEmailRef.once('value');
    
    if (studentByEmailSnapshot.exists()) {
      const studentId = studentByEmailSnapshot.val();
      const studentRef = realtimeDb.ref(`students/${studentId}`);
      const studentSnapshot = await studentRef.once('value');
      
      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.val();
        console.log('✅ Student found by email index');
        
        // Step 5b: Verify credentials
        const credRef = realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`);
        const credSnapshot = await credRef.once('value');
        
        if (credSnapshot.exists()) {
          const credentials = credSnapshot.val();
          const passwordMatch = await bcrypt.compare(testPassword, credentials.password);
          
          if (passwordMatch) {
            console.log('✅ Authentication simulation: SUCCESS');
            console.log('🎉 Student can successfully login to Grade Vault TVET!');
          } else {
            console.log('❌ Authentication simulation: FAILED (password mismatch)');
          }
        } else {
          console.log('❌ Authentication simulation: FAILED (credentials not found)');
        }
      } else {
        console.log('❌ Authentication simulation: FAILED (student data not found)');
      }
    } else {
      console.log('❌ Authentication simulation: FAILED (email index not found)');
    }
    
    console.log('\n📋 Test Login Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Admission Number: ${testAdmissionNumber}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the verification
verifyTestStudent();
