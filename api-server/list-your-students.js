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

async function listUserStudents() {
  console.log('📋 Listing YOUR students (excluding test students)...\n');
  
  try {
    const studentsRef = rtdb.ref('students');
    const studentsSnapshot = await studentsRef.once('value');
    const students = studentsSnapshot.val() || {};
    
    // Filter out test students
    const userStudents = Object.entries(students).filter(([id, student]) => {
      const email = student.email?.toLowerCase() || '';
      const firstName = student.firstName?.toLowerCase() || '';
      const lastName = student.lastName?.toLowerCase() || '';
      
      return !(email.includes('test') || 
               email.includes('example') || 
               firstName.includes('test') || 
               lastName.includes('test') ||
               firstName.includes('debug') ||
               email.includes('debug'));
    });
    
    if (userStudents.length === 0) {
      console.log('❌ No registrar-created students found');
      console.log('\n📋 All students in database:');
      Object.entries(students).forEach(([id, student], index) => {
        console.log(`${index + 1}. ${student.firstName} ${student.lastName} (${student.email})`);
        console.log(`   Admission: ${student.admissionNumber}`);
        console.log(`   Created: ${student.createdAt}`);
        console.log('');
      });
    } else {
      console.log(`👤 Found ${userStudents.length} registrar-created students:\n`);
      
      userStudents.forEach(([id, student], index) => {
        console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   🎓 Admission: ${student.admissionNumber}`);
        console.log(`   🏫 Department: ${student.department}`);
        console.log(`   📅 Created: ${student.createdAt}`);
        console.log(`   ✅ Approved: ${student.approved ? 'Yes' : 'No'}`);
        console.log(`   🔓 Active: ${student.accountActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing students:', error);
  } finally {
    process.exit(0);
  }
}

listUserStudents();
