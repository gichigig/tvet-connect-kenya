import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin using environment variables (same as server.js)
const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

initializeApp({
  credential: cert(firebaseConfig),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = getFirestore();

async function checkApprovedUnits() {
  try {
    console.log('Checking all unit registrations...');
    
    // Get all unit registrations
    const allRegs = await db.collection('unit_registrations').get();
    console.log(`Total unit registrations: ${allRegs.size}`);
    
    // Get approved registrations
    const approvedRegs = await db.collection('unit_registrations')
      .where('status', '==', 'approved')
      .get();
    console.log(`Approved unit registrations: ${approvedRegs.size}`);
    
    // Show sample approved registrations
    if (approvedRegs.size > 0) {
      console.log('\nSample approved registrations:');
      approvedRegs.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`- Student: ${data.studentId}, Unit: ${data.unitId}, Status: ${data.status}`);
        console.log(`  Approved At: ${data.approvedAt}, Approved By: ${data.approvedBy}`);
      });
    }
    
    // Get pending registrations
    const pendingRegs = await db.collection('unit_registrations')
      .where('status', '==', 'pending')
      .get();
    console.log(`Pending unit registrations: ${pendingRegs.size}`);
    
    // Show sample pending registrations
    if (pendingRegs.size > 0) {
      console.log('\nSample pending registrations:');
      pendingRegs.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`- Student: ${data.studentId}, Unit: ${data.unitId}, Status: ${data.status}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking units:', error);
  }
}

checkApprovedUnits();
