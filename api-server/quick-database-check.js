import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newy-35816-default-rtdb.firebaseio.com/"
  });
}

const rtdb = admin.database();

async function quickCheck() {
  console.log('🔍 Quick database check...');
  
  try {
    // Check students collection
    const studentsRef = rtdb.ref('students');
    const studentsSnapshot = await studentsRef.limitToLast(5).once('value');
    const students = studentsSnapshot.val() || {};
    
    console.log(`📊 Found ${Object.keys(students).length} recent students`);
    
    // Check email index
    const emailIndexRef = rtdb.ref('studentsByEmail');
    const emailSnapshot = await emailIndexRef.limitToLast(5).once('value');
    const emailIndex = emailSnapshot.val() || {};
    
    console.log(`📧 Found ${Object.keys(emailIndex).length} email index entries`);
    
    // Show details
    console.log('\n📋 Recent students:');
    for (const [id, student] of Object.entries(students)) {
      console.log(`- ${student.firstName} ${student.lastName} (${student.email})`);
      console.log(`  Admission: ${student.admissionNumber}`);
      console.log(`  Created: ${student.createdAt}`);
      console.log(`  Approved: ${student.approved ? '✅' : '❌'}`);
      console.log(`  Active: ${student.accountActive ? '✅' : '❌'}`);
      console.log('');
    }
    
    console.log('📧 Recent email indexes:');
    for (const [emailKey, studentId] of Object.entries(emailIndex)) {
      console.log(`- ${emailKey} -> ${studentId}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

quickCheck();
