import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newy-35816-default-rtdb.firebaseio.com/"
  });
}

const rtdb = admin.database();

async function quickStudentCheck() {
  console.log('🔍 Quick check of YOUR students...\n');
  
  try {
    // Get students
    const studentsSnapshot = await rtdb.ref('students').limitToLast(10).once('value');
    const students = studentsSnapshot.val() || {};
    
    // Get email indexes
    const emailIndexSnapshot = await rtdb.ref('studentsByEmail').limitToLast(10).once('value');
    const emailIndex = emailIndexSnapshot.val() || {};
    
    console.log(`📊 Recent students: ${Object.keys(students).length}`);
    console.log(`📧 Email indexes: ${Object.keys(emailIndex).length}\n`);
    
    const realStudents = Object.entries(students).filter(([id, student]) => {
      const email = student.email?.toLowerCase() || '';
      return !email.includes('test') && !email.includes('example') && !email.includes('debug');
    });
    
    console.log(`👤 Your students: ${realStudents.length}\n`);
    
    for (const [id, student] of realStudents) {
      console.log(`Student: ${student.firstName} ${student.lastName}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Admission: ${student.admissionNumber}`);
      console.log(`  Created: ${student.createdAt || 'Unknown'}`);
      
      // Check email index
      const emailKey = student.email.replace(/[.#$[\]]/g, '_');
      const hasIndex = emailIndex[emailKey] === id;
      console.log(`  Email Index: ${hasIndex ? '✅' : '❌'}`);
      
      // Check credentials
      const credSnapshot = await rtdb.ref(`studentCredentials/${student.admissionNumber}`).once('value');
      console.log(`  Credentials: ${credSnapshot.exists() ? '✅' : '❌'}`);
      console.log('');
    }
    
    if (realStudents.length === 0) {
      console.log('ℹ️  No non-test students found. Showing all students:');
      for (const [id, student] of Object.entries(students)) {
        console.log(`- ${student.firstName} ${student.lastName} (${student.email})`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

quickStudentCheck();
