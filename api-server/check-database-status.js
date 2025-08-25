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

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...\n');
    
    // Check students collection
    const studentsRef = realtimeDb.ref('students');
    const studentsSnapshot = await studentsRef.once('value');
    
    if (studentsSnapshot.exists()) {
      const students = studentsSnapshot.val();
      const studentCount = Object.keys(students).length;
      console.log(`✅ Students collection: ${studentCount} students found`);
      
      // Show first few students
      const studentsList = Object.entries(students).slice(0, 3);
      studentsList.forEach(([id, student]) => {
        console.log(`   - ${student.firstName} ${student.lastName} (${student.email})`);
      });
      if (studentCount > 3) {
        console.log(`   ... and ${studentCount - 3} more students`);
      }
    } else {
      console.log('❌ Students collection: No students found');
    }
    
    // Check studentsByEmail index
    const studentsByEmailRef = realtimeDb.ref('studentsByEmail');
    const studentsByEmailSnapshot = await studentsByEmailRef.once('value');
    
    if (studentsByEmailSnapshot.exists()) {
      const studentsByEmail = studentsByEmailSnapshot.val();
      const emailIndexCount = Object.keys(studentsByEmail).length;
      console.log(`✅ StudentsByEmail index: ${emailIndexCount} entries found`);
    } else {
      console.log('❌ StudentsByEmail index: No entries found');
    }
    
    // Check users collection for any remaining students
    const usersRef = realtimeDb.ref('users');
    const usersSnapshot = await usersRef.once('value');
    
    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      const remainingStudents = Object.entries(users).filter(([id, user]) => user.role === 'student');
      
      if (remainingStudents.length > 0) {
        console.log(`⚠️  Users collection: ${remainingStudents.length} students still in wrong location`);
        remainingStudents.forEach(([id, student]) => {
          console.log(`   - ${student.firstName} ${student.lastName} (${student.email})`);
        });
      } else {
        console.log('✅ Users collection: No students found (good!)');
      }
      
      const totalUsers = Object.keys(users).length;
      console.log(`📊 Total users in users collection: ${totalUsers}`);
    } else {
      console.log('📊 Users collection: Empty');
    }
    
    // Check usersByEmail for any remaining student entries
    const usersByEmailRef = realtimeDb.ref('usersByEmail');
    const usersByEmailSnapshot = await usersByEmailRef.once('value');
    
    if (usersByEmailSnapshot.exists()) {
      const usersByEmail = usersByEmailSnapshot.val();
      const emailIndexCount = Object.keys(usersByEmail).length;
      console.log(`📊 UsersByEmail index: ${emailIndexCount} entries`);
      
      // Check if any of these are students
      let studentEmailsInWrongPlace = 0;
      for (const [emailKey, userId] of Object.entries(usersByEmail)) {
        const userRef = realtimeDb.ref(`users/${userId}`);
        const userSnapshot = await userRef.once('value');
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          if (userData.role === 'student') {
            studentEmailsInWrongPlace++;
          }
        }
      }
      
      if (studentEmailsInWrongPlace > 0) {
        console.log(`⚠️  UsersByEmail index: ${studentEmailsInWrongPlace} student emails still in wrong location`);
      } else {
        console.log('✅ UsersByEmail index: No student emails found (good!)');
      }
    } else {
      console.log('📊 UsersByEmail index: Empty');
    }
    
    console.log('\n🎯 Summary:');
    console.log('- Students should be in "students" collection');
    console.log('- Student email indexes should be in "studentsByEmail"');
    console.log('- No students should be in "users" collection');
    console.log('- No student emails should be in "usersByEmail"');
    
  } catch (error) {
    console.error('❌ Error checking database status:', error);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkDatabaseStatus();
