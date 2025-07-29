import { db } from '@/integrations/firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Check authentication
    const auth = getAuth();
    const currentUser = auth.currentUser;
    console.log('👤 Current user:', currentUser?.uid || 'Not authenticated');
    console.log('📧 User email:', currentUser?.email || 'No email');
    
    // Test reading from a collection
    console.log('📖 Testing Firestore read...');
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ Firestore read successful:', snapshot.size, 'documents');
    
    // Test writing to a collection
    console.log('✍️ Testing Firestore write...');
    const testDoc = await addDoc(testCollection, {
      message: 'Test connection',
      timestamp: new Date().toISOString(),
      user: currentUser?.uid || 'anonymous'
    });
    console.log('✅ Firestore write successful:', testDoc.id);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}
