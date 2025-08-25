import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://newy-35816-default-rtdb.firebaseio.com/'
  });
}

const realtimeDb = admin.database();

async function testStudentEmailLookup(email) {
  console.log(`🔍 Testing email lookup for: ${email}\n`);
  
  try {
    // Test 1: Check studentsByEmail index
    console.log('1. Checking studentsByEmail index...');
    const emailKey = email.replace(/[.#$[\]]/g, '_');
    console.log(`   Email key: ${emailKey}`);
    
    const emailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    const emailIndexSnapshot = await emailIndexRef.once('value');
    
    if (emailIndexSnapshot.exists()) {
      const studentId = emailIndexSnapshot.val();
      console.log(`   ✅ Found student ID in index: ${studentId}`);
      
      // Test 2: Get student data using the ID
      console.log('2. Retrieving student data...');
      const studentRef = realtimeDb.ref(`students/${studentId}`);
      const studentSnapshot = await studentRef.once('value');
      
      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.val();
        console.log(`   ✅ Student data found:`);
        console.log(`      Name: ${studentData.firstName} ${studentData.lastName}`);
        console.log(`      Email: ${studentData.email}`);
        console.log(`      Password: ${studentData.password ? 'SET' : 'NOT SET'}`);
        console.log(`      Approved: ${studentData.approved}`);
        console.log(`      Active: ${studentData.accountActive}`);
        console.log(`      Admission: ${studentData.admissionNumber}`);
        
        // Test 3: Check studentCredentials
        if (studentData.admissionNumber) {
          console.log('3. Checking studentCredentials...');
          const credentialsRef = realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`);
          const credSnapshot = await credentialsRef.once('value');
          
          if (credSnapshot.exists()) {
            const credentials = credSnapshot.val();
            console.log(`   ✅ Credentials found:`);
            console.log(`      Email: ${credentials.email}`);
            console.log(`      Password: ${credentials.password ? 'SET' : 'NOT SET'}`);
            console.log(`      Password value: ${credentials.password}`);
          } else {
            console.log('   ❌ No credentials found');
          }
        }
        
        return {
          found: true,
          student: studentData,
          studentId
        };
      } else {
        console.log('   ❌ Student data not found');
        return { found: false, error: 'Student data not found' };
      }
    } else {
      console.log('   ❌ Email not found in index');
      
      // Fallback: Try direct email search in students collection
      console.log('2. Trying direct email search...');
      const studentsRef = realtimeDb.ref('students');
      const directSnapshot = await studentsRef.orderByChild('email').equalTo(email).once('value');
      
      if (directSnapshot.exists()) {
        console.log('   ✅ Found student via direct search');
        const students = directSnapshot.val();
        const studentId = Object.keys(students)[0];
        const studentData = students[studentId];
        
        console.log(`      Missing email index for: ${email}`);
        console.log(`      Student: ${studentData.firstName} ${studentData.lastName}`);
        
        return {
          found: true,
          student: studentData,
          studentId,
          missingIndex: true
        };
      } else {
        console.log('   ❌ Student not found via direct search either');
        return { found: false, error: 'Student not found' };
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing email lookup:', error);
    return { found: false, error: error.message };
  }
}

// Test with a few potential emails
async function runTests() {
  const testEmails = [
    'test.student@example.com',
    'student@test.com',
    // Add any specific email you've created students with
  ];
  
  console.log('🧪 Testing Student Email Lookup System\n');
  
  for (const email of testEmails) {
    const result = await testStudentEmailLookup(email);
    console.log('=' .repeat(60));
    if (!result.found) {
      console.log(`No student found for ${email}\n`);
    }
  }
  
  // Also list some students to see what's actually in the database
  console.log('\n📋 Recent students in database:');
  const studentsRef = realtimeDb.ref('students');
  const recentStudents = await studentsRef.limitToLast(3).once('value');
  
  if (recentStudents.exists()) {
    const students = recentStudents.val();
    Object.entries(students).forEach(([id, student]) => {
      console.log(`   ${student.firstName} ${student.lastName} - ${student.email}`);
    });
  } else {
    console.log('   No students found in database');
  }
}

runTests();
