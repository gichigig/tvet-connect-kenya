import { supabase } from './client';
import type { AuthError, AuthResponse, User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  course?: string;
  level?: string;
  admissionNumber?: string;
  department?: string;
  approved?: boolean;
  blocked?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  role: string;
  course?: string;
  level?: string;
  admissionNumber?: string;
  department?: string;
}

export class AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email!,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      profilePicture: profile.profile_picture,
      course: profile.course,
      level: profile.level,
      admissionNumber: profile.admission_number,
      department: profile.department,
      approved: profile.approved,
      blocked: profile.blocked
    };
  }

  async login({ email, password }: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      return { user: null, error: new Error('Profile not found') as AuthError };
    }

    if (!profile.approved) {
      return { user: null, error: new Error('Account pending approval') as AuthError };
    }

    if (profile.blocked) {
      return { user: null, error: new Error('Account has been blocked') as AuthError };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        profilePicture: profile.profile_picture,
        course: profile.course,
        level: profile.level,
        admissionNumber: profile.admission_number,
        department: profile.department,
        approved: profile.approved,
        blocked: profile.blocked
      },
      error: null
    };
  }

  async signup(credentials: SignupCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          role: credentials.role,
          course: credentials.course,
          level: credentials.level,
          admission_number: credentials.admissionNumber,
          department: credentials.department,
          approved: false, // New users need approval
          blocked: false
        }
      }
    });

    if (error) return { user: null, error };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          role: credentials.role,
          course: credentials.course,
          level: credentials.level,
          admission_number: credentials.admissionNumber,
          department: credentials.department,
          approved: false,
          blocked: false
        }
      ])
      .select()
      .single();

    if (profileError) {
      // Clean up auth if profile creation fails
      await supabase.auth.signOut();
      throw error;
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        course: profile.course,
        level: profile.level,
        admissionNumber: profile.admission_number,
        department: profile.department,
        approved: profile.approved,
        blocked: profile.blocked
      },
      error: null
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: Error | null }> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        role: updates.role,
        course: updates.course,
        level: updates.level,
        admission_number: updates.admissionNumber,
        department: updates.department,
        profile_picture: updates.profilePicture,
        approved: updates.approved,
        blocked: updates.blocked
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      return { user: null, error: profileError };
    }

    // Only update email if it's changed
    if (updates.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: updates.email });
      if (emailError) {
        return { user: null, error: emailError };
      }
    }

    return {
      user: {
        id: userId,
        email: updates.email || profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        profilePicture: profile.profile_picture,
        course: profile.course,
        level: profile.level,
        admissionNumber: profile.admission_number,
        department: profile.department,
        approved: profile.approved,
        blocked: profile.blocked
      },
      error: null
    };
  }

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  async verifyOtp(email: string, token: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    return { error };
  }
}
