import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tvet-connect-kenya-default-rtdb.firebaseio.com/"
  });
}

const rtdb = admin.database();

async function compareStudentStorage() {
  console.log('🔍 Analyzing student storage patterns...\n');
  
  try {
    // Get all students from Realtime DB
    const studentsSnapshot = await rtdb.ref('students').once('value');
    const students = studentsSnapshot.val() || {};
    
    // Get email index
    const emailIndexSnapshot = await rtdb.ref('studentsByEmail').once('value');
    const emailIndex = emailIndexSnapshot.val() || {};
    
    // Get admission index
    const admissionIndexSnapshot = await rtdb.ref('studentsByAdmission').once('value');
    const admissionIndex = admissionIndexSnapshot.val() || {};
    
    // Get credentials
    const credentialsSnapshot = await rtdb.ref('studentCredentials').once('value');
    const credentials = credentialsSnapshot.val() || {};
    
    console.log('📊 DATABASE OVERVIEW:');
    console.log(`- Students in main collection: ${Object.keys(students).length}`);
    console.log(`- Email index entries: ${Object.keys(emailIndex).length}`);
    console.log(`- Admission index entries: ${Object.keys(admissionIndex).length}`);
    console.log(`- Credential entries: ${Object.keys(credentials).length}\n`);
    
    // Check for students without email index
    console.log('🔍 CHECKING FOR MISSING EMAIL INDEXES:');
    let studentsWithoutEmailIndex = 0;
    
    for (const [studentId, student] of Object.entries(students)) {
      if (student.email) {
        const emailKey = student.email.replace(/[.#$[\]]/g, '_');
        if (!emailIndex[emailKey]) {
          console.log(`❌ Student missing email index:`, {
            id: studentId,
            email: student.email,
            emailKey: emailKey,
            name: `${student.firstName} ${student.lastName}`,
            admissionNumber: student.admissionNumber
          });
          studentsWithoutEmailIndex++;
        }
      }
    }
    
    if (studentsWithoutEmailIndex === 0) {
      console.log('✅ All students have email indexes');
    } else {
      console.log(`❌ Found ${studentsWithoutEmailIndex} students without email indexes`);
    }
    
    // Check for email indexes without students
    console.log('\n🔍 CHECKING FOR ORPHANED EMAIL INDEXES:');
    let orphanedEmailIndexes = 0;
    
    for (const [emailKey, studentId] of Object.entries(emailIndex)) {
      if (!students[studentId]) {
        console.log(`❌ Orphaned email index:`, {
          emailKey: emailKey,
          pointsToStudentId: studentId,
          studentExists: false
        });
        orphanedEmailIndexes++;
      }
    }
    
    if (orphanedEmailIndexes === 0) {
      console.log('✅ No orphaned email indexes found');
    } else {
      console.log(`❌ Found ${orphanedEmailIndexes} orphaned email indexes`);
    }
    
    // Show recent students
    console.log('\n📋 RECENT STUDENTS (last 5):');
    const recentStudents = Object.entries(students)
      .sort(([,a], [,b]) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
    
    for (const [studentId, student] of recentStudents) {
      const emailKey = student.email ? student.email.replace(/[.#$[\]]/g, '_') : 'NO_EMAIL';
      const hasEmailIndex = emailIndex[emailKey] === studentId;
      const hasAdmissionIndex = student.admissionNumber ? admissionIndex[student.admissionNumber] === studentId : false;
      const hasCredentials = student.admissionNumber ? !!credentials[student.admissionNumber] : false;
      
      console.log(`Student: ${student.firstName} ${student.lastName}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Admission: ${student.admissionNumber}`);
      console.log(`  Created: ${student.createdAt}`);
      console.log(`  Email Index: ${hasEmailIndex ? '✅' : '❌'}`);
      console.log(`  Admission Index: ${hasAdmissionIndex ? '✅' : '❌'}`);
      console.log(`  Credentials: ${hasCredentials ? '✅' : '❌'}`);
      console.log(`  Approved: ${student.approved ? '✅' : '❌'}`);
      console.log(`  Account Active: ${student.accountActive ? '✅' : '❌'}`);
      console.log('');
    }
    
    // Test email lookup for recent students
    console.log('🧪 TESTING EMAIL LOOKUP FOR RECENT STUDENTS:');
    for (const [studentId, student] of recentStudents.slice(0, 3)) {
      if (student.email) {
        console.log(`\nTesting lookup for: ${student.email}`);
        const emailKey = student.email.replace(/[.#$[\]]/g, '_');
        const indexedStudentId = emailIndex[emailKey];
        
        if (indexedStudentId === studentId) {
          console.log('✅ Email lookup would succeed');
        } else if (indexedStudentId) {
          console.log('❌ Email lookup points to wrong student:', indexedStudentId);
        } else {
          console.log('❌ Email lookup would fail - no index found');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error analyzing student storage:', error);
  }
}

// Run the analysis
compareStudentStorage()
  .then(() => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
