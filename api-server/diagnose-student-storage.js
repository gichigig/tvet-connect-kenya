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
const db = admin.firestore();

async function diagnoseStudentStorage() {
  console.log('🔍 Diagnosing Student Storage and Authentication Setup...\n');
  
  try {
    // Check Firestore students collection
    console.log('1. Checking Firestore students collection...');
    const firestoreStudents = await db.collection('students').limit(5).get();
    
    if (firestoreStudents.empty) {
      console.log('❌ No students found in Firestore');
    } else {
      console.log(`✅ Found ${firestoreStudents.size} students in Firestore:`);
      firestoreStudents.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.firstName} ${data.lastName} (${data.email})`);
        console.log(`     Admission: ${data.admissionNumber}`);
        console.log(`     Approved: ${data.approved}`);
        console.log(`     Active: ${data.accountActive}`);
      });
    }
    
    console.log('\n2. Checking Realtime Database students collection...');
    const realtimeStudents = await realtimeDb.ref('students').limitToFirst(5).once('value');
    
    if (!realtimeStudents.exists()) {
      console.log('❌ No students found in Realtime Database students collection');
    } else {
      console.log('✅ Found students in Realtime Database:');
      const students = realtimeStudents.val();
      Object.entries(students).forEach(([id, student]) => {
        console.log(`   - ${student.firstName} ${student.lastName} (${student.email})`);
        console.log(`     ID: ${id}`);
        console.log(`     Password stored: ${student.password ? 'YES' : 'NO'}`);
        console.log(`     Approved: ${student.approved}`);
        console.log(`     Active: ${student.accountActive}`);
      });
    }
    
    console.log('\n3. Checking studentCredentials collection...');
    const credentials = await realtimeDb.ref('studentCredentials').limitToFirst(5).once('value');
    
    if (!credentials.exists()) {
      console.log('❌ No student credentials found');
    } else {
      console.log('✅ Found student credentials:');
      const creds = credentials.val();
      Object.entries(creds).forEach(([admissionNumber, credData]) => {
        console.log(`   - Admission: ${admissionNumber}`);
        console.log(`     Email: ${credData.email}`);
        console.log(`     Password stored: ${credData.password ? 'YES' : 'NO'}`);
        console.log(`     Student ID: ${credData.studentId}`);
      });
    }
    
    console.log('\n4. Checking email indexes...');
    const studentsByEmail = await realtimeDb.ref('studentsByEmail').limitToFirst(5).once('value');
    
    if (!studentsByEmail.exists()) {
      console.log('❌ No studentsByEmail index found');
    } else {
      console.log('✅ Found studentsByEmail indexes:');
      const indexes = studentsByEmail.val();
      Object.entries(indexes).forEach(([emailKey, studentId]) => {
        const originalEmail = emailKey.replace(/_/g, '.');
        console.log(`   - ${originalEmail} -> ${studentId}`);
      });
    }
    
    console.log('\n5. Testing authentication paths...');
    
    // Get one student to test authentication
    if (realtimeStudents.exists()) {
      const students = realtimeStudents.val();
      const firstStudent = Object.values(students)[0];
      
      console.log(`\nTesting authentication for: ${firstStudent.email}`);
      
      // Test main system authentication (realtimeAuth)
      console.log('Testing main system authentication...');
      if (firstStudent.password) {
        console.log(`✅ Password available for comparison: ${firstStudent.password}`);
      } else {
        console.log('❌ No password stored in student record');
      }
      
      // Check if credentials exist for Grade Vault
      const admissionCredentials = await realtimeDb.ref(`studentCredentials/${firstStudent.admissionNumber}`).once('value');
      if (admissionCredentials.exists()) {
        const credData = admissionCredentials.val();
        console.log(`✅ Grade Vault credentials found for admission ${firstStudent.admissionNumber}`);
        console.log(`   Password: ${credData.password}`);
      } else {
        console.log(`❌ No Grade Vault credentials for admission ${firstStudent.admissionNumber}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error diagnosing student storage:', error);
  }
}

diagnoseStudentStorage();
