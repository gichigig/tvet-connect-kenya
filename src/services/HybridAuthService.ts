/**
 * Hybrid Authentication Service
 * Manages both Firebase and Supabase authentication during migration
 */

import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { firebaseApp, auth as existingAuth } from '@/integrations/firebase/config';

// Use existing Firebase configuration
const firebaseAuth = existingAuth;

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class HybridAuthService {
  private static instance: HybridAuthService;
  private currentUser: any = null;
  private authProvider: 'firebase' | 'supabase' | null = null;

  static getInstance(): HybridAuthService {
    if (!HybridAuthService.instance) {
      HybridAuthService.instance = new HybridAuthService();
    }
    return HybridAuthService.instance;
  }

  /**
   * Primary login method - tries Firebase first, then creates/migrates to Supabase
   */
  async signIn(email: string, password: string) {
    try {
      console.log('🔄 Attempting Firebase authentication...');
      
      // Step 1: Try Firebase authentication
      const firebaseCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const firebaseUser = firebaseCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Firebase authentication failed');
      }

      console.log('✅ Firebase authentication successful');
      
      // Step 2: Get Firebase ID token for backend verification
      const firebaseToken = await firebaseUser.getIdToken();
      
      // Step 3: Check if user exists in Supabase, if not create account
      const supabaseUser = await this.createOrGetSupabaseUser(firebaseUser, firebaseToken);
      
      // Step 4: Set current user and provider
      this.currentUser = {
        firebase: firebaseUser,
        supabase: supabaseUser,
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName
      };
      this.authProvider = 'firebase';

      toast({
        title: 'Login Successful',
        description: 'You are now logged in with Firebase. Your account is being migrated to our new system.',
      });

      return this.currentUser;

    } catch (firebaseError) {
      console.log('❌ Firebase authentication failed, trying Supabase...', firebaseError.message);
      
      // If Firebase fails, try Supabase directly
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log('✅ Supabase authentication successful');
        
        this.currentUser = {
          supabase: data.user,
          email: data.user.email,
          uid: data.user.id
        };
        this.authProvider = 'supabase';

        toast({
          title: 'Login Successful',
          description: 'Welcome back! You\'re using our new authentication system.',
        });

        return this.currentUser;

      } catch (supabaseError) {
        console.error('❌ Both authentication methods failed');
        throw new Error('Login failed. Please check your credentials.');
      }
    }
  }

  /**
   * Create or retrieve Supabase user based on Firebase user
   */
  private async createOrGetSupabaseUser(firebaseUser: any, firebaseToken: string) {
    try {
      // Check if user already exists in Supabase by trying to sign them in
      console.log('🔄 Checking if user exists in Supabase...');
      
      // First, try to sign in with a temporary password to see if user exists
      const tempPassword = `temp_${firebaseUser.uid.slice(0, 8)}`;
      
      try {
        const { data: existingSignIn, error: signInError } = await supabase.auth.signInWithPassword({
          email: firebaseUser.email,
          password: tempPassword
        });
        
        if (existingSignIn?.user && !signInError) {
          console.log('✅ User already exists in Supabase');
          return existingSignIn.user;
        }
      } catch (existingUserError) {
        // User doesn't exist or password is wrong, continue with creation
      }

      // User doesn't exist in Supabase, create account using the API server
      console.log('🔄 Creating Supabase account for Firebase user via API...');
      
      try {
        const response = await fetch('http://localhost:3001/api/auth/migrate-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firebaseToken}`
          },
          body: JSON.stringify({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            firebaseToken
          })
        });

        if (response.ok) {
          const migrationResult = await response.json();
          
          if (migrationResult.supabaseUser) {
            console.log('✅ Supabase account created via API server');
            
            // Sign in to Supabase with the temporary password
            const { data: supabaseSession, error: signInError } = await supabase.auth.signInWithPassword({
              email: firebaseUser.email,
              password: migrationResult.temporaryPassword
            });

            if (signInError) {
              console.warn('⚠️ Supabase sign-in failed after creation via API');
              return null;
            }

            toast({
              title: 'Account Migrated',
              description: 'Your account has been successfully migrated to our new system!',
              duration: 5000,
            });

            return supabaseSession.user;
          }
        } else {
          console.log('❌ API server migration failed, trying direct creation...');
        }
      } catch (apiError) {
        console.log('❌ API server not available, trying direct creation...', apiError.message);
      }

      // Fallback: Try to create user directly in Supabase (requires service role key)
      console.log('🔄 Attempting direct Supabase user creation...');
      
      // Generate a secure temporary password
      const temporaryPassword = `temp_${firebaseUser.uid}_${Date.now()}`;
      
      // Try to sign up the user directly
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: firebaseUser.email,
        password: temporaryPassword,
        options: {
          data: {
            firebase_uid: firebaseUser.uid,
            display_name: firebaseUser.displayName,
            migrated_from_firebase: true,
            migration_date: new Date().toISOString()
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          console.log('✅ User already exists in Supabase (from signup attempt)');
          // Try to sign in
          const { data: existingUser } = await supabase.auth.signInWithPassword({
            email: firebaseUser.email,
            password: temporaryPassword
          });
          return existingUser?.user || null;
        } else {
          console.error('❌ Supabase signup failed:', signUpError.message);
          return null;
        }
      }

      if (signUpData?.user) {
        console.log('✅ Supabase user created directly');
        
        toast({
          title: 'Account Created',
          description: 'Your account has been created in our new system!',
          duration: 5000,
        });

        return signUpData.user;
      }

      return null;

    } catch (error) {
      console.error('❌ Failed to create/get Supabase user:', error);
      // Don't fail the entire login process if Supabase migration fails
      return null;
    }
  }

        if (signInError) {
          console.warn('⚠️ Supabase sign-in failed, but account was created');
          return null;
        }

        toast({
          title: 'Account Migrated',
          description: 'Your account has been successfully migrated to our new system!',
          duration: 5000,
        });

        return supabaseSession.user;
      }

      return null;

    } catch (error) {
      console.error('❌ Failed to create/get Supabase user:', error);
      // Don't fail the entire login process if Supabase migration fails
      return null;
    }
  }

  /**
   * Sign out from both systems
   */
  async signOut() {
    try {
      // Sign out from Firebase if authenticated
      if (this.authProvider === 'firebase' || this.currentUser?.firebase) {
        await firebaseSignOut(firebaseAuth);
        console.log('✅ Signed out from Firebase');
      }

      // Sign out from Supabase if authenticated
      if (this.authProvider === 'supabase' || this.currentUser?.supabase) {
        await supabase.auth.signOut();
        console.log('✅ Signed out from Supabase');
      }

      this.currentUser = null;
      this.authProvider = null;

      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.',
      });

    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get auth provider being used
   */
  getAuthProvider() {
    return this.authProvider;
  }

  /**
   * Check if user is migrated to Supabase
   */
  isUserMigrated() {
    return this.currentUser?.supabase !== null && this.currentUser?.supabase !== undefined;
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: any) => void) {
    // Listen to Firebase auth changes
    const firebaseUnsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser && this.authProvider === 'firebase') {
        this.currentUser = {
          ...this.currentUser,
          firebase: firebaseUser
        };
        callback(this.currentUser);
      } else if (!firebaseUser && this.authProvider === 'firebase') {
        this.currentUser = null;
        this.authProvider = null;
        callback(null);
      }
    });

    // Listen to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && this.authProvider === 'supabase') {
        this.currentUser = {
          ...this.currentUser,
          supabase: session.user
        };
        callback(this.currentUser);
      } else if (!session && this.authProvider === 'supabase') {
        this.currentUser = null;
        this.authProvider = null;
        callback(null);
      }
    });

    // Return cleanup function
    return () => {
      firebaseUnsubscribe();
      subscription.unsubscribe();
    };
  }

  /**
   * Force migration of current Firebase user to Supabase
   */
  async forceMigration() {
    if (!this.currentUser?.firebase) {
      throw new Error('No Firebase user to migrate');
    }

    try {
      const firebaseToken = await this.currentUser.firebase.getIdToken();
      const supabaseUser = await this.createOrGetSupabaseUser(this.currentUser.firebase, firebaseToken);
      
      if (supabaseUser) {
        this.currentUser.supabase = supabaseUser;
        this.authProvider = 'supabase';
        
        toast({
          title: 'Migration Complete',
          description: 'Your account has been fully migrated to our new system!',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Force migration failed:', error);
      throw error;
    }
  }

  /**
   * Get Firebase token for API calls
   */
  async getFirebaseToken() {
    if (this.currentUser?.firebase) {
      return await this.currentUser.firebase.getIdToken();
    }
    return null;
  }

  /**
   * Get Supabase session for API calls
   */
  async getSupabaseSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
}

// Export singleton instance
export const hybridAuth = HybridAuthService.getInstance();
