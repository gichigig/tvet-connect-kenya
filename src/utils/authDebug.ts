import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/integrations/firebase/config';

export function logAuthStatus() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  
  console.log('=== Auth Debug Info ===');
  console.log('Current user:', user?.uid);
  console.log('User email:', user?.email);
  console.log('Is authenticated:', !!user);
  console.log('Token valid:', user ? 'checking...' : 'no user');
  
  if (user) {
    user.getIdToken().then(token => {
      console.log('Token available:', !!token);
      console.log('Token length:', token.length);
    }).catch(error => {
      console.error('Token error:', error);
    });
  }
  
  console.log('========================');
}

export function debugFirestoreAccess() {
  console.log('=== Firestore Access Debug ===');
  console.log('Firebase config loaded:', !!firebaseApp);
  logAuthStatus();
}
