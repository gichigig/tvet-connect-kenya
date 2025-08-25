import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newy-35816-default-rtdb.firebaseio.com/"
  });
}

async function checkApiKeys() {
  console.log('🔑 Checking API key configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment API Keys:');
  console.log(`STATIC_API_KEY: ${process.env.STATIC_API_KEY || 'NOT SET'}`);
  console.log('');
  
  // Check Grade Vault API key
  const gradeVaultApiKey = 'tvet_2f51f9505be74254b1134d52aa57b62b';
  console.log(`🎓 Grade Vault API Key: ${gradeVaultApiKey}`);
  
  // Check if it matches static key
  if (process.env.STATIC_API_KEY === gradeVaultApiKey) {
    console.log('✅ Grade Vault API key matches STATIC_API_KEY');
  } else {
    console.log('❌ Grade Vault API key does NOT match STATIC_API_KEY');
    console.log('   This is why Grade Vault gets "Invalid API key" error');
  }
  console.log('');
  
  // Check database for dynamic API keys
  try {
    const db = admin.firestore();
    const apiKeysSnapshot = await db.collection('apiKeys').get();
    
    console.log('📋 Database API Keys:');
    if (apiKeysSnapshot.empty) {
      console.log('❌ No API keys found in database');
    } else {
      apiKeysSnapshot.forEach(doc => {
        const keyData = doc.data();
        console.log(`- ${keyData.keyId}: ${keyData.active ? '✅ Active' : '❌ Inactive'}`);
        if (keyData.keyId === gradeVaultApiKey) {
          console.log('  ✅ This is the Grade Vault key');
        }
      });
    }
  } catch (error) {
    console.log('❌ Error checking database API keys:', error.message);
  }
  
  console.log('\n🔧 SOLUTION:');
  console.log('To fix the "Invalid API key" error, you need to either:');
  console.log('1. Set STATIC_API_KEY in api-server/.env to match Grade Vault key');
  console.log('2. OR create the Grade Vault API key in the database');
}

checkApiKeys();
