import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import serviceAccount from './serviceAccountKey.js';

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://tvet-connect-kenya-default-rtdb.firebaseio.com/"
});

const migrateStudentIndexes = async () => {
  try {
    console.log('Starting student index migration...');
    const realtimeDb = getDatabase();
    
    // Get all students from the students collection
    const studentsRef = realtimeDb.ref('students');
    const studentsSnapshot = await studentsRef.once('value');
    
    if (!studentsSnapshot.exists()) {
      console.log('No students found in students collection.');
      return;
    }
    
    const students = studentsSnapshot.val();
    let migratedCount = 0;
    
    for (const [studentId, studentData] of Object.entries(students)) {
      if (studentData.email) {
        const emailKey = studentData.email.replace(/[.#$[\]]/g, '_');
        
        // Create studentsByEmail index
        const studentEmailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
        await studentEmailIndexRef.set(studentId);
        console.log(`Created studentsByEmail index for: ${studentData.email}`);
        
        // Remove from usersByEmail if it exists
        const userEmailIndexRef = realtimeDb.ref(`usersByEmail/${emailKey}`);
        const userEmailSnapshot = await userEmailIndexRef.once('value');
        if (userEmailSnapshot.exists()) {
          await userEmailIndexRef.remove();
          console.log(`Removed usersByEmail index for: ${studentData.email}`);
        }
        
        migratedCount++;
      }
      
      // Create studentsByAdmission index if admission number exists
      if (studentData.admissionNumber) {
        const studentAdmissionRef = realtimeDb.ref(`studentsByAdmission/${studentData.admissionNumber}`);
        await studentAdmissionRef.set(studentId);
        console.log(`Created studentsByAdmission index for: ${studentData.admissionNumber}`);
        
        // Remove from usersByAdmission if it exists
        const userAdmissionRef = realtimeDb.ref(`usersByAdmission/${studentData.admissionNumber}`);
        const userAdmissionSnapshot = await userAdmissionRef.once('value');
        if (userAdmissionSnapshot.exists()) {
          await userAdmissionRef.remove();
          console.log(`Removed usersByAdmission index for: ${studentData.admissionNumber}`);
        }
      }
    }
    
    console.log(`Migration completed! Migrated ${migratedCount} student indexes.`);
    
    // Also check for any students wrongly stored in users collection
    const usersRef = realtimeDb.ref('users');
    const usersSnapshot = await usersRef.once('value');
    
    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      let movedStudents = 0;
      
      for (const [userId, userData] of Object.entries(users)) {
        if (userData.role === 'student') {
          console.log(`Found student in users collection: ${userData.email}`);
          
          // Move to students collection
          const newStudentRef = studentsRef.push();
          await newStudentRef.set(userData);
          
          // Create proper indexes
          if (userData.email) {
            const emailKey = userData.email.replace(/[.#$[\]]/g, '_');
            const studentEmailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
            await studentEmailIndexRef.set(newStudentRef.key);
          }
          
          if (userData.admissionNumber) {
            const studentAdmissionRef = realtimeDb.ref(`studentsByAdmission/${userData.admissionNumber}`);
            await studentAdmissionRef.set(newStudentRef.key);
          }
          
          // Remove from users collection
          const userRef = realtimeDb.ref(`users/${userId}`);
          await userRef.remove();
          
          // Remove old indexes
          if (userData.email) {
            const emailKey = userData.email.replace(/[.#$[\]]/g, '_');
            const userEmailIndexRef = realtimeDb.ref(`usersByEmail/${emailKey}`);
            await userEmailIndexRef.remove();
          }
          
          if (userData.admissionNumber) {
            const userAdmissionRef = realtimeDb.ref(`usersByAdmission/${userData.admissionNumber}`);
            await userAdmissionRef.remove();
          }
          
          movedStudents++;
          console.log(`Moved student ${userData.email} from users to students collection`);
        }
      }
      
      console.log(`Moved ${movedStudents} students from users to students collection.`);
    }
    
    console.log('Student index migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateStudentIndexes();
