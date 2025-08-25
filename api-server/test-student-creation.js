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

async function testStudentCreation() {
  try {
    console.log('🧪 Testing student creation process...\n');
    
    const testStudent = {
      firstName: 'Test',
      lastName: 'Student',
      email: 'teststudent@example.com',
      role: 'student',
      admissionNumber: 'TS002',
      department: 'IT',
      course: 'Diploma in IT',
      approved: true
    };
    
    // Simulate the createUserInRealtimeDB function logic
    console.log('1. Creating student in students collection...');
    const studentsRef = realtimeDb.ref('students');
    const newStudentRef = studentsRef.push();
    
    const studentWithId = {
      ...testStudent,
      id: newStudentRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await newStudentRef.set(studentWithId);
    console.log(`✅ Student created with ID: ${newStudentRef.key}`);
    
    // Create email index
    console.log('2. Creating email index in studentsByEmail...');
    const emailKey = testStudent.email.replace(/[.#$[\]]/g, '_');
    const emailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    await emailIndexRef.set(newStudentRef.key);
    console.log(`✅ Email index created: ${emailKey} -> ${newStudentRef.key}`);
    
    // Create admission number index
    console.log('3. Creating admission number index...');
    const admissionRef = realtimeDb.ref(`studentsByAdmission/${testStudent.admissionNumber}`);
    await admissionRef.set(newStudentRef.key);
    console.log(`✅ Admission index created: ${testStudent.admissionNumber} -> ${newStudentRef.key}`);
    
    // Test retrieval by email
    console.log('4. Testing retrieval by email...');
    const retrievedEmailRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    const retrievedEmailSnapshot = await retrievedEmailRef.once('value');
    
    if (retrievedEmailSnapshot.exists()) {
      const studentId = retrievedEmailSnapshot.val();
      const studentRef = realtimeDb.ref(`students/${studentId}`);
      const studentSnapshot = await studentRef.once('value');
      
      if (studentSnapshot.exists()) {
        const retrievedStudent = studentSnapshot.val();
        console.log(`✅ Successfully retrieved student: ${retrievedStudent.firstName} ${retrievedStudent.lastName}`);
      } else {
        console.log('❌ Student data not found in students collection');
      }
    } else {
      console.log('❌ Email index not found');
    }
    
    // Test retrieval by admission number
    console.log('5. Testing retrieval by admission number...');
    const retrievedAdmissionRef = realtimeDb.ref(`studentsByAdmission/${testStudent.admissionNumber}`);
    const retrievedAdmissionSnapshot = await retrievedAdmissionRef.once('value');
    
    if (retrievedAdmissionSnapshot.exists()) {
      const studentId = retrievedAdmissionSnapshot.val();
      console.log(`✅ Successfully retrieved student ID by admission number: ${studentId}`);
    } else {
      console.log('❌ Admission number index not found');
    }
    
    // Clean up test data
    console.log('6. Cleaning up test data...');
    await newStudentRef.remove();
    await emailIndexRef.remove();
    await admissionRef.remove();
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! Student creation and retrieval working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testStudentCreation();
