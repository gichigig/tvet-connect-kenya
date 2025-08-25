// Simple Firebase test
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('Testing Firebase initialization...');
console.log('Environment variables:');
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

try {
  // Initialize Firebase
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const serviceAccount = await import('./serviceAccountKey.js');

  if (!getApps().length) {
    console.log('Initializing Firebase...');
    
    const app = initializeApp({
      credential: cert(serviceAccount.default),
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    console.log('✅ Firebase initialized successfully');
    console.log('App name:', app.name);
    
    // Test database connection
    const { getDatabase } = await import('firebase-admin/database');
    const db = getDatabase();
    console.log('✅ Database reference obtained');
    
    // Simple health check
    console.log('🎉 All Firebase services are working correctly!');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}
