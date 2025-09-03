/**
 * Firebase Data Export Script
 * Exports data from Firebase Realtime Database and Firestore to JSON files
 * Run this script to backup your Firebase data before migration
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config();

// Firebase config (you'll need to replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realtimeDb = getDatabase(app);
const firestoreDb = getFirestore(app);
const auth = getAuth(app);

// Create export directory
const exportDir = 'firebase-export';
await fs.mkdir(exportDir, { recursive: true });

console.log('🚀 Starting Firebase data export...');

/**
 * Export Firebase Realtime Database data
 */
async function exportRealtimeDatabase() {
  console.log('📊 Exporting Realtime Database data...');
  
  try {
    // Export attendance records
    console.log('  - Exporting attendance records...');
    const attendanceRef = ref(realtimeDb, 'attendance');
    const attendanceSnap = await get(attendanceRef);
    
    if (attendanceSnap.exists()) {
      const attendanceData = attendanceSnap.val();
      await fs.writeFile(
        path.join(exportDir, 'attendance-export.json'), 
        JSON.stringify(attendanceData, null, 2)
      );
      console.log(`    ✅ Exported ${Object.keys(attendanceData).length} attendance records`);
    } else {
      console.log('    ℹ️  No attendance records found');
    }

    // Export users (admins and students)
    console.log('  - Exporting user data...');
    const usersData = { admins: {}, students: {}, lecturers: {} };
    
    // Get admins
    const adminsRef = ref(realtimeDb, 'admins');
    const adminsSnap = await get(adminsRef);
    if (adminsSnap.exists()) {
      usersData.admins = adminsSnap.val();
    }
    
    // Get students
    const studentsRef = ref(realtimeDb, 'students');
    const studentsSnap = await get(studentsRef);
    if (studentsSnap.exists()) {
      usersData.students = studentsSnap.val();
    }
    
    // Get lecturers (if stored separately)
    const lecturersRef = ref(realtimeDb, 'lecturers');
    const lecturersSnap = await get(lecturersRef);
    if (lecturersSnap.exists()) {
      usersData.lecturers = lecturersSnap.val();
    }
    
    await fs.writeFile(
      path.join(exportDir, 'users-export.json'),
      JSON.stringify(usersData, null, 2)
    );
    
    const totalUsers = 
      Object.keys(usersData.admins).length + 
      Object.keys(usersData.students).length + 
      Object.keys(usersData.lecturers).length;
    console.log(`    ✅ Exported ${totalUsers} users`);

    // Export other realtime database collections
    const collections = ['units', 'departments', 'courses', 'enrollments'];
    
    for (const collectionName of collections) {
      console.log(`  - Exporting ${collectionName}...`);
      const collectionRef = ref(realtimeDb, collectionName);
      const collectionSnap = await get(collectionRef);
      
      if (collectionSnap.exists()) {
        const data = collectionSnap.val();
        await fs.writeFile(
          path.join(exportDir, `${collectionName}-export.json`),
          JSON.stringify(data, null, 2)
        );
        console.log(`    ✅ Exported ${Object.keys(data).length} ${collectionName}`);
      } else {
        console.log(`    ℹ️  No ${collectionName} found`);
      }
    }

  } catch (error) {
    console.error('❌ Error exporting Realtime Database:', error);
  }
}

/**
 * Export Firestore data
 */
async function exportFirestore() {
  console.log('🔥 Exporting Firestore data...');
  
  const collections = [
    'notifications',
    'documents', 
    'assignments',
    'submissions',
    'grades',
    'fee_structures',
    'payments'
  ];

  for (const collectionName of collections) {
    try {
      console.log(`  - Exporting ${collectionName} collection...`);
      
      const collectionRef = collection(firestoreDb, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      if (!querySnapshot.empty) {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        await fs.writeFile(
          path.join(exportDir, `${collectionName}-firestore-export.json`),
          JSON.stringify(data, null, 2)
        );
        console.log(`    ✅ Exported ${data.length} ${collectionName} documents`);
      } else {
        console.log(`    ℹ️  No ${collectionName} documents found`);
      }
      
    } catch (error) {
      console.error(`❌ Error exporting ${collectionName}:`, error);
    }
  }
}

/**
 * Export Firebase Auth users (requires Admin SDK)
 */
async function exportAuthUsers() {
  console.log('🔐 Exporting Firebase Auth users...');
  
  try {
    // Note: This requires Firebase Admin SDK and service account
    // For now, we'll skip this and rely on database user data
    console.log('    ℹ️  Skipping Auth users (use Admin SDK for complete auth export)');
    
    // If you have Admin SDK setup, you can use:
    // const listUsersResult = await admin.auth().listUsers();
    // const users = listUsersResult.users.map(user => ({
    //   uid: user.uid,
    //   email: user.email,
    //   displayName: user.displayName,
    //   photoURL: user.photoURL,
    //   emailVerified: user.emailVerified,
    //   disabled: user.disabled,
    //   metadata: user.metadata,
    //   customClaims: user.customClaims
    // }));
    
  } catch (error) {
    console.error('❌ Error exporting Auth users:', error);
  }
}

/**
 * Generate migration report
 */
async function generateMigrationReport() {
  console.log('📋 Generating migration report...');
  
  const report = {
    exportDate: new Date().toISOString(),
    exportedFiles: [],
    summary: {},
    notes: []
  };
  
  try {
    // Read all exported files and generate summary
    const files = await fs.readdir(exportDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(exportDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        report.exportedFiles.push(file);
        
        if (Array.isArray(data)) {
          report.summary[file] = `${data.length} records`;
        } else if (typeof data === 'object' && data !== null) {
          report.summary[file] = `${Object.keys(data).length} records`;
        }
      }
    }
    
    // Add migration notes
    report.notes = [
      'All Firebase Realtime Database collections have been exported',
      'All Firestore collections have been exported',
      'Firebase Auth users need to be exported separately using Admin SDK',
      'File attachments in Storage need to be migrated separately',
      'Review data structure before importing to Supabase'
    ];
    
    await fs.writeFile(
      path.join(exportDir, 'migration-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Migration report generated');
    
  } catch (error) {
    console.error('❌ Error generating migration report:', error);
  }
}

/**
 * Main export function
 */
async function exportFirebaseData() {
  try {
    console.log('🔥 Firebase to Supabase Data Export Tool');
    console.log('==========================================');
    
    await exportRealtimeDatabase();
    await exportFirestore();
    await exportAuthUsers();
    await generateMigrationReport();
    
    console.log('\n✅ Export completed successfully!');
    console.log(`📁 All data exported to: ${exportDir}/`);
    console.log('\nNext steps:');
    console.log('1. Review the exported data files');
    console.log('2. Run the Supabase import script');
    console.log('3. Validate data integrity');
    console.log('4. Update application code to use Supabase');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run the export
exportFirebaseData();
