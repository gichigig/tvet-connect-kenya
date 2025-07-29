import { getAuth, updateEmail, updatePassword, updateProfile, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { uploadProfilePicture } from "../aws/fileUpload";
import { uploadProfilePictureSecurely } from "../aws/secureUpload";
import { firebaseApp } from "./config";

export interface UserProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  address?: string;
  role?: string;
  admissionNumber?: string;
  course?: string;
  year?: number;
  semester?: number;
  department?: string;
  updatedAt?: Date;
}

export async function updateUserEmail(newEmail: string) {
  const auth = getAuth(firebaseApp);
  if (!auth.currentUser) throw new Error("User not authenticated. Please log in again.");
  
  try {
    // Refresh token before making the request
    await auth.currentUser.getIdToken(true);
    if (!newEmail?.trim()) throw new Error("Email cannot be empty");
    await updateEmail(auth.currentUser, newEmail.trim());
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Authentication expired. Please refresh the page and log in again.");
    }
    throw error;
  }
}

export async function updateUserPassword(newPassword: string) {
  const auth = getAuth(firebaseApp);
  if (!auth.currentUser) throw new Error("User not authenticated. Please log in again.");
  
  try {
    // Refresh token before making the request
    await auth.currentUser.getIdToken(true);
    if (!newPassword?.trim()) throw new Error("Password cannot be empty");
    if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
    await updatePassword(auth.currentUser, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Authentication expired. Please refresh the page and log in again.");
    }
    throw error;
  }
}

export async function updateUserPhoneNumber(userId: string, phone: string) {
  const auth = getAuth(firebaseApp);
  if (!auth.currentUser) throw new Error("User not authenticated. Please log in again.");
  
  try {
    // Refresh token before making the request
    await auth.currentUser.getIdToken(true);
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", userId);
    if (!phone?.trim()) throw new Error("Phone number cannot be empty");
    
    console.log('Updating phone for user:', userId, 'with auth user:', auth.currentUser.uid);
    await updateDoc(userRef, { phone: phone.trim() });
    console.log('Phone update successful');
  } catch (error: any) {
    console.error('Phone update error:', error);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Authentication expired. Please refresh the page and log in again.");
    } else if (error.code === 'permission-denied') {
      throw new Error("Permission denied. Please refresh the page and try again.");
    }
    throw error;
  }
}

/**
 * Update user profile picture
 * Uploads new picture to S3 and deletes the previous one automatically
 */
export async function updateUserProfilePicture(userId: string, file: File): Promise<string> {
  try {
    console.log('[AWS] Starting profile picture upload for user:', userId);
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", userId);
    
    // Get current profile to check for existing picture
    const userDoc = await getDoc(userRef);
    const currentData = userDoc.data();
    const previousImageUrl = currentData?.profilePicture;
    console.log('[AWS] Previous image URL:', previousImageUrl);

    // Upload new profile picture using secure upload (Firebase Auth + S3 Signed URLs)
    console.log('[Secure Upload] Uploading new profile picture to S3...');
    const newImageUrl = await uploadProfilePictureSecurely(file, userId);
    console.log('[Secure Upload] Upload successful! New image URL:', newImageUrl);

    // Update user document with new profile picture URL
    await setDoc(userRef, {
      profilePicture: newImageUrl,
      updatedAt: new Date()
    }, { merge: true });
    console.log('[AWS] Firestore updated with new profile picture URL via setDoc merge');

    // Verify the update by reading it back
    const verifyDoc = await getDoc(userRef);
    const verifyData = verifyDoc.data();
    console.log('[AWS] Verification - Profile picture in Firestore:', verifyData?.profilePicture);

    return newImageUrl;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
}

/**
 * Save all profile info to Firestore
 */
export async function saveUserProfileToFirestore(userId: string, data: Partial<UserProfile>) {
  const db = getFirestore(firebaseApp);
  const userRef = doc(db, "users", userId);
  
  const updateData = {
    ...data,
    updatedAt: new Date()
  };
  
  await setDoc(userRef, updateData, { merge: true });
}

/**
 * Save profile with new picture and all profile data
 * Combines picture upload and profile update in one operation
 */
export async function saveProfileWithPicture(
  userId: string, 
  profileData: Partial<UserProfile>, 
  pictureFile?: File
): Promise<{ profilePictureUrl?: string }> {
  try {
    console.log('saveProfileWithPicture called with:', { userId, profileData, hasPictureFile: !!pictureFile });
    
    // Check authentication first
    const auth = getAuth(firebaseApp);
    console.log('Current auth user:', auth.currentUser?.uid);
    
    if (!auth.currentUser) {
      throw new Error('User not authenticated. Please log in again.');
    }
    
    // Refresh token before making any requests
    try {
      await auth.currentUser.getIdToken(true);
      console.log('Token refreshed successfully for profile update');
    } catch (tokenError: any) {
      console.error('Token refresh failed:', tokenError);
      if (tokenError.code === 'auth/requires-recent-login') {
        throw new Error('Authentication expired. Please refresh the page and log in again.');
      }
      throw new Error('Authentication expired. Please refresh the page and log in again.');
    }
    
    // Ensure the user can only update their own profile (security check)
    if (auth.currentUser.uid !== userId) {
      console.log('Auth UID mismatch:', { authUid: auth.currentUser.uid, requestedUserId: userId });
      throw new Error('You can only update your own profile.');
    }
    
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", userId);
    let profilePictureUrl = profileData.profilePicture;

    // If a new picture file is provided, upload it first
    if (pictureFile) {
      console.log('Uploading picture file...');
      // Get current profile to check for existing picture
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.data();
      const previousImageUrl = currentData?.profilePicture;

      // Upload new picture and delete old one
      profilePictureUrl = await uploadProfilePicture(pictureFile, userId, previousImageUrl);
      console.log('Picture uploaded successfully:', profilePictureUrl);
    }

    // Update the complete profile including the new picture URL
    const updateData = {
      ...profileData,
      ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
      updatedAt: new Date()
    };

    console.log('Updating Firestore with data:', updateData);

    // Only update Firestore if there's actually data to update
    if (Object.keys(updateData).length > 1 || profilePictureUrl) { // > 1 because updatedAt is always included
      try {
        await setDoc(userRef, updateData, { merge: true });
        console.log('Firestore update successful');
      } catch (firestoreError: any) {
        console.error('Firestore update error:', firestoreError);
        if (firestoreError.code === 'permission-denied') {
          throw new Error('Permission denied. Please refresh the page and try again.');
        }
        throw firestoreError;
      }
    }

    return { profilePictureUrl };
  } catch (error: any) {
    console.error('Error saving profile with picture:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle specific error codes
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please refresh the page and try again.');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Authentication expired. Please refresh the page and log in again.');
    }
    
    throw error;
  }
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { uid: userId, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}
