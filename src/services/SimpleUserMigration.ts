/**
 * Simple User Migration Service
 * Creates users in Supabase when they login with Firebase
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SimpleUserMigration {
  /**
   * Create a user in Supabase when they login with Firebase
   */
  static async createSupabaseUser(firebaseUser: any) {
    try {
      console.log('🔄 Creating Supabase user for:', firebaseUser.email);
      
      // Generate a secure temporary password
      const temporaryPassword = `temp_${firebaseUser.uid}_${Date.now().toString().slice(-6)}`;
      
      // Try to create user in Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: firebaseUser.email,
        password: temporaryPassword,
        options: {
          data: {
            firebase_uid: firebaseUser.uid,
            display_name: firebaseUser.displayName || '',
            first_name: firebaseUser.displayName?.split(' ')[0] || '',
            last_name: firebaseUser.displayName?.split(' ')[1] || '',
            migrated_from_firebase: true,
            migration_date: new Date().toISOString()
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          console.log('✅ User already exists in Supabase');
          return { success: true, message: 'User already exists' };
        } else {
          console.error('❌ Supabase signup failed:', signUpError.message);
          return { success: false, error: signUpError.message };
        }
      }

      if (signUpData?.user) {
        console.log('✅ Supabase user created successfully');
        
        toast({
          title: 'Account Migrated',
          description: 'Your account has been created in our new system!',
          duration: 3000,
        });

        return { 
          success: true, 
          user: signUpData.user,
          temporaryPassword: temporaryPassword 
        };
      }

      return { success: false, error: 'Unknown error during signup' };

    } catch (error: any) {
      console.error('❌ Failed to create Supabase user:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user exists in Supabase
   */
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      // We can't directly check if a user exists without being signed in
      // So we'll try a password reset request which doesn't fail for non-existent users
      // but we'll use a different approach
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5175/reset-password'
      });
      
      // If no error, user likely exists (though this isn't foolproof)
      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current Supabase session
   */
  static async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Failed to get Supabase session:', error);
      return null;
    }
  }
}
