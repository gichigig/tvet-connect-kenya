import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newy-35816-default-rtdb.firebaseio.com/"
  });
}

const rtdb = admin.database();

async function fixStudentAuthentication() {
  console.log('🔧 Fixing authentication for your students...\n');
  
  try {
    const studentsSnapshot = await rtdb.ref('students').once('value');
    const students = studentsSnapshot.val() || {};
    
    const realStudents = Object.entries(students).filter(([id, student]) => {
      const email = student.email?.toLowerCase() || '';
      return !email.includes('test') && !email.includes('example') && !email.includes('debug');
    });
    
    console.log(`👤 Found ${realStudents.length} of your students to fix\n`);
    
    for (const [studentId, student] of realStudents) {
      console.log(`🔧 Fixing: ${student.firstName} ${student.lastName} (${student.email})`);
      
      // Fix 1: Create email index
      const emailKey = student.email.replace(/[.#$[\]]/g, '_');
      await rtdb.ref(`studentsByEmail/${emailKey}`).set(studentId);
      console.log('  ✅ Email index created');
      
      // Fix 2: Create credentials
      if (student.admissionNumber) {
        await rtdb.ref(`studentCredentials/${student.admissionNumber}`).set({
          email: student.email,
          password: 'test123',
          admissionNumber: student.admissionNumber,
          studentId: studentId,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        console.log('  ✅ Credentials created (password: test123)');
      }
      
      // Fix 3: Ensure student is approved and active
      await rtdb.ref(`students/${studentId}`).update({
        approved: true,
        accountActive: true,
        updatedAt: new Date().toISOString()
      });
      console.log('  ✅ Student approved and activated');
      console.log('');
    }
    
    console.log('🎉 All students fixed! They should now be able to login to Grade Vault');
    console.log('\n📋 Login credentials for your students:');
    for (const [studentId, student] of realStudents) {
      console.log(`- ${student.firstName} ${student.lastName}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Password: test123`);
      console.log('');
    }
    
    console.log('🔗 Grade Vault URL: http://localhost:8080');
    
  } catch (error) {
    console.error('❌ Error fixing students:', error);
  }
  
  process.exit(0);
}

fixStudentAuthentication();
