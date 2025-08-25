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

async function migrateStudentsFromUsersByEmail() {
  try {
    console.log('Starting migration of students from usersByEmail to studentsByEmail...');
    
    // Get all usersByEmail entries
    const usersByEmailRef = realtimeDb.ref('usersByEmail');
    const usersByEmailSnapshot = await usersByEmailRef.once('value');
    
    if (!usersByEmailSnapshot.exists()) {
      console.log('No usersByEmail entries found.');
      return;
    }
    
    const usersByEmailData = usersByEmailSnapshot.val();
    let migratedCount = 0;
    let errors = [];
    
    for (const [emailKey, userId] of Object.entries(usersByEmailData)) {
      try {
        console.log(`Processing user ID: ${userId} for email key: ${emailKey}`);
        
        // First check if this user is in the users collection
        const userRef = realtimeDb.ref(`users/${userId}`);
        const userSnapshot = await userRef.once('value');
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          
          // Check if this is a student
          if (userData.role === 'student') {
            console.log(`Found student: ${userData.email} (${userData.firstName} ${userData.lastName})`);
            
            // Check if already exists in studentsByEmail
            const studentsByEmailRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
            const existingStudentEmailSnapshot = await studentsByEmailRef.once('value');
            
            if (!existingStudentEmailSnapshot.exists()) {
              // Move student to students collection
              const studentsRef = realtimeDb.ref('students');
              const newStudentRef = studentsRef.push();
              
              // Create student record
              const studentData = {
                ...userData,
                id: newStudentRef.key,
                createdAt: userData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              await newStudentRef.set(studentData);
              
              // Create studentsByEmail index
              await studentsByEmailRef.set(newStudentRef.key);
              
              // Create studentsByAdmission index if admission number exists
              if (userData.admissionNumber) {
                const studentsByAdmissionRef = realtimeDb.ref(`studentsByAdmission/${userData.admissionNumber}`);
                await studentsByAdmissionRef.set(newStudentRef.key);
              }
              
              // Move password to studentCredentials if it exists
              if (userData.password && userData.admissionNumber) {
                const credentialsRef = realtimeDb.ref(`studentCredentials/${userData.admissionNumber}`);
                await credentialsRef.set({
                  password: userData.password,
                  createdAt: userData.createdAt || new Date().toISOString()
                });
              }
              
              // Remove from users collection
              await userRef.remove();
              
              // Remove from usersByEmail
              const usersByEmailToRemoveRef = realtimeDb.ref(`usersByEmail/${emailKey}`);
              await usersByEmailToRemoveRef.remove();
              
              // Remove from usersByAdmission if exists
              if (userData.admissionNumber) {
                const usersByAdmissionRef = realtimeDb.ref(`usersByAdmission/${userData.admissionNumber}`);
                await usersByAdmissionRef.remove();
              }
              
              migratedCount++;
              console.log(`✓ Migrated student: ${userData.email} to students collection`);
            } else {
              console.log(`Student ${userData.email} already exists in studentsByEmail, skipping...`);
            }
          } else {
            console.log(`User ${userData.email} is not a student (role: ${userData.role}), keeping in users collection`);
          }
        } else {
          console.log(`User ID ${userId} not found in users collection, cleaning up usersByEmail entry...`);
          // Clean up orphaned usersByEmail entry
          const usersByEmailToRemoveRef = realtimeDb.ref(`usersByEmail/${emailKey}`);
          await usersByEmailToRemoveRef.remove();
        }
        
      } catch (error) {
        console.error(`Error processing user ID ${userId}:`, error);
        errors.push({
          userId,
          emailKey,
          error: error.message
        });
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Students migrated: ${migratedCount}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(error => {
        console.log(`- User ID ${error.userId}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateStudentsFromUsersByEmail();
