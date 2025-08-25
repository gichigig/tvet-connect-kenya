import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
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
const firestore = admin.firestore();

async function checkStudents() {
  console.log('🔍 Checking all student data in database...');
  console.log('===========================================');
  
  try {
    // Check Realtime Database students
    console.log('\n📊 Realtime Database - students collection:');
    const rtdbStudentsRef = rtdb.ref('students');
    const rtdbSnapshot = await rtdbStudentsRef.once('value');
    
    if (rtdbSnapshot.exists()) {
      const students = rtdbSnapshot.val();
      console.log(`   Found ${Object.keys(students).length} students`);
      
      Object.entries(students).forEach(([key, student]) => {
        console.log(`   - ${student.firstName} ${student.lastName}`);
        console.log(`     Email: ${student.email}`);
        console.log(`     Admission: ${student.admissionNumber}`);
        console.log(`     Has password: ${!!student.password}`);
        console.log('');
      });
    } else {
      console.log('   No students found in Realtime Database');
    }
    
    // Check student credentials
    console.log('\n🔑 Realtime Database - studentCredentials:');
    const credentialsRef = rtdb.ref('studentCredentials');
    const credSnapshot = await credentialsRef.once('value');
    
    if (credSnapshot.exists()) {
      const credentials = credSnapshot.val();
      console.log(`   Found credentials for ${Object.keys(credentials).length} students`);
      
      Object.entries(credentials).forEach(([admissionNumber, cred]) => {
        console.log(`   - Admission ${admissionNumber}: has password`);
      });
    } else {
      console.log('   No student credentials found');
    }
    
    // Check Firestore students
    console.log('\n🏪 Firestore - students collection:');
    const firestoreStudents = await firestore.collection('students').get();
    
    if (!firestoreStudents.empty) {
      console.log(`   Found ${firestoreStudents.size} students`);
      
      firestoreStudents.forEach(doc => {
        const student = doc.data();
        console.log(`   - ${student.firstName} ${student.lastName}`);
        console.log(`     Email: ${student.email}`);
        console.log(`     Admission: ${student.admissionNumber}`);
        console.log('');
      });
    } else {
      console.log('   No students found in Firestore');
    }
    
  } catch (error) {
    console.error('Error checking students:', error);
  }
  
  console.log('🏁 Check complete');
  process.exit(0);
}

checkStudents();
