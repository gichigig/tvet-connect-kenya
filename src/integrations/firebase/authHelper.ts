import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { firebaseApp } from "./config";

/**
 * Create a Firebase Auth account for an existing user in the database
 * This is useful when users exist in the database but not in Firebase Auth
 * Also immediately sends a password reset email
 */
export async function createAuthAccountForUser(email: string, tempPassword?: string): Promise<{ success: boolean; message: string }> {
  try {
    const auth = getAuth(firebaseApp);
    
    // Use a secure temporary password if not provided
    const password = tempPassword || generateTemporaryPassword();
    
    // Create the user account
    await createUserWithEmailAndPassword(auth, email, password);
    
    // Immediately send password reset email so they can set their own password
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
      // Add iOS and Android package names if you have mobile apps
      // iOS: { bundleId: 'com.yourapp.ios' },
      // android: { packageName: 'com.yourapp.android' }
    });
    
    // Sign out the temporary session immediately
    await auth.signOut();
    
    return {
      success: true,
      message: `Authentication account created for ${email} and password reset email sent automatically.`
    };
  } catch (error: any) {
    console.error('Error creating auth account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      // Account already exists, just try to send reset email
      try {
        const auth = getAuth(firebaseApp);
        await sendPasswordResetEmail(auth, email, {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false,
          // Ensure consistent configuration
        });
        return {
          success: true,
          message: `Account already exists. Password reset email sent to ${email}.`
        };
      } catch (resetError) {
        return {
          success: false,
          message: 'Account exists but failed to send reset email.'
        };
      }
    }
    
    if (error.code === 'auth/weak-password') {
      return {
        success: false,
        message: 'Failed to create account due to password requirements.'
      };
    }
    
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        message: 'Invalid email address format.'
      };
    }
    
    return {
      success: false,
      message: `Failed to create authentication account: ${error.message}`
    };
  }
}

/**
 * Generate a secure temporary password that meets Firebase requirements
 */
function generateTemporaryPassword(): string {
  // Firebase requires at least 6 characters, we'll use 20 for security
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < 20; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if a user exists in Firebase Auth
 */
export async function checkAuthUserExists(email: string): Promise<boolean> {
  try {
    const auth = getAuth(firebaseApp);
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error('Error checking auth user:', error);
    return false;
  }
}
