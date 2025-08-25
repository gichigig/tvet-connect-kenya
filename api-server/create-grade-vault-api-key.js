import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newy-35816-default-rtdb.firebaseio.com/"
  });
}

async function createGradeVaultApiKey() {
  console.log('🔧 Creating Grade Vault API key in database...\n');
  
  try {
    const db = admin.firestore();
    const gradeVaultApiKey = 'tvet_2f51f9505be74254b1134d52aa57b62b';
    
    // Create the API key document
    await db.collection('apiKeys').doc(gradeVaultApiKey).set({
      keyId: gradeVaultApiKey,
      name: 'Grade Vault TVET API Key',
      description: 'API key for Grade Vault frontend application',
      active: true,
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      usageCount: 0
    });
    
    console.log('✅ Grade Vault API key created successfully!');
    console.log(`📋 Key: ${gradeVaultApiKey}`);
    console.log('✅ Grade Vault should now work without API key errors');
    
  } catch (error) {
    console.error('❌ Error creating API key:', error);
  }
  
  process.exit(0);
}

createGradeVaultApiKey();
