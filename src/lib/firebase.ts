import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with better error handling
export const initializeFirestore = () => {
  try {
    const db = getFirestore(firebaseApp);
    
    // Handle network state changes
    const handleOnline = () => {
      console.log('Network connected, enabling Firestore');
      enableNetwork(db).catch(error => {
        console.warn('Failed to enable Firestore network:', error);
      });
    };

    const handleOffline = () => {
      console.log('Network disconnected, disabling Firestore');
      disableNetwork(db).catch(error => {
        console.warn('Failed to disable Firestore network:', error);
      });
    };

    // Listen for network state changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return db;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    return null;
  }
};

// Check if Firebase services are available
export const checkFirebaseConnectivity = async () => {
  try {
    const db = getFirestore(firebaseApp);
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.warn('Firebase connectivity check failed:', error);
    return false;
  }
};
