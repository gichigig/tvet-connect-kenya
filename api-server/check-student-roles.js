// Check what role field students have in the database
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

dotenv.config({ path: join(__dirname, '.env') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const rtdb = admin.database();

async function checkStudentRoles() {
  console.log('🔍 Checking student role fields...');
  
  try {
    const studentsRef = rtdb.ref('students');
    const snapshot = await studentsRef.once('value');
    
    if (snapshot.exists()) {
      const students = snapshot.val();
      console.log(`Found ${Object.keys(students).length} students:`);
      
      Object.entries(students).forEach(([key, student]) => {
        console.log(`\n📋 Student: ${student.firstName} ${student.lastName}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Role: "${student.role}" (${typeof student.role})`);
        console.log(`   Has admissionNumber: ${!!student.admissionNumber}`);
        console.log(`   admissionNumber: ${student.admissionNumber}`);
        
        // Check if role is missing or wrong
        if (!student.role) {
          console.log('   ⚠️  NO ROLE FIELD!');
        } else if (student.role !== 'student') {
          console.log(`   ⚠️  ROLE IS NOT 'student': "${student.role}"`);
        } else {
          console.log('   ✅ Role is correct');
        }
      });
    } else {
      console.log('No students found in database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkStudentRoles();
