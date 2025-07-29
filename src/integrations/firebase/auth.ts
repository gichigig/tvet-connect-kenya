import { getAuth } from 'firebase/auth';
import { firebaseApp } from './config';

/**
 * Check if user is properly authenticated
 */
export function checkAuthStatus() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  
  console.log('Auth status check:', {
    isAuthenticated: !!user,
    uid: user?.uid,
    email: user?.email,
    emailVerified: user?.emailVerified
  });
  
  return {
    isAuthenticated: !!user,
    user: user,
    uid: user?.uid,
    email: user?.email
  };
}

/**
 * Force refresh the authentication token
 */
export async function refreshAuthToken() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  
  if (user) {
    try {
      await user.getIdToken(true); // Force refresh
      console.log('Auth token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing auth token:', error);
      return false;
    }
  }
  
  return false;
}

/**
 * Get current user ID safely
 */
export function getCurrentUserId(): string | null {
  const auth = getAuth(firebaseApp);
  return auth.currentUser?.uid || null;
}

/**
 * Wait for authentication to be ready
 */
export function waitForAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    const auth = getAuth(firebaseApp);
    
    if (auth.currentUser) {
      resolve(true);
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, 5000);
  });
}
