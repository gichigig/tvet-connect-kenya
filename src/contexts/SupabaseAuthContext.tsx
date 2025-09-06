import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  approved?: boolean;
  blocked?: boolean;
}

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<SupabaseUser>; // Support username or email
  logout: () => Promise<void>;
  createUser: (userData: any, password: string) => Promise<void>;
  createUserWithBypass: (userData: any) => Promise<void>; // New bypass method
  getAllUsers: () => Promise<SupabaseUser[]>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Additional properties for compatibility
  users: SupabaseUser[];
  approveUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>; // Support username or email
  updateProfilePicture: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profile) {
            setUser({
              id: profile.user_id,
              email: profile.email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              role: profile.role,
              approved: profile.approved,
              blocked: profile.blocked
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change event:', event);
      console.log('🔄 Session user:', session?.user?.id);
      console.log('🔄 Is currently logging in:', isLoggingIn);
      
      // Skip profile fetching if we're in the middle of login process
      if (isLoggingIn) {
        console.log('⏭️ Auth listener: Skipping profile fetch - login in progress');
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('📋 Auth listener: User signed in, fetching profile...');
        
        try {
          console.log('📋 Auth listener: Fetching profile for user:', session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('❌ Auth listener: Profile error:', profileError);
            setLoading(false);
            return;
          }
          
          if (profile) {
            console.log('✅ Auth listener: Profile loaded:', profile);
            const userData = {
              id: profile.user_id,
              email: profile.email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              role: profile.role,
              approved: profile.approved,
              blocked: profile.blocked,
              departmentId: profile.department_id,
              institutionId: profile.institution_id,
            };
            console.log('👤 Auth listener: Setting user data:', userData);
            setUser(userData);
          } else {
            console.log('❌ Auth listener: No profile found');
          }
        } catch (error) {
          console.error('🚨 Auth listener: Unexpected error:', error);
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('👤 Auth listener: User signed out or no session, clearing user');
        setUser(null);
      }
      
      console.log('🏁 Auth listener: Setting loading to false');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (identifier: string, password: string) => {
    console.log('🔐 Starting login process for:', identifier);
    setIsLoggingIn(true);
    
    try {
      // First, try to find user by username or email
      let email = identifier;
      
      // Check if identifier is not an email (doesn't contain @)
      if (!identifier.includes('@')) {
        // Look up email by username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single();
          
        if (profileError || !profile) {
          throw new Error('User not found');
        }
        
        email = profile.email;
        console.log('🔍 Found email for username:', email);
      }
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error(authError.message || 'Invalid credentials');
      }

      if (!authData?.user) {
        console.error('❌ No user data returned');
        throw new Error('No user data returned');
      }

      console.log('✅ Authentication successful, user ID:', authData.user.id);

      // Get user profile
      console.log('📋 Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        throw new Error(`Error loading user profile: ${profileError.message}`);
      }

      if (!profile) {
        console.error('❌ No profile found');
        throw new Error('User profile not found');
      }

      console.log('✅ Profile loaded:', profile);

      // Check if user is blocked
      if (profile.blocked) {
        console.error('❌ User is blocked');
        throw new Error('This account has been blocked. Please contact support.');
      }

      // Check if user is approved
      if (!profile.approved) {
        console.error('❌ User not approved');
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      }

      const userData = {
        id: profile.user_id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        approved: profile.approved,
        blocked: profile.blocked,
        departmentId: profile.department_id,
        institutionId: profile.institution_id,
      };

      console.log('👤 Setting user data from login function:', userData);
      setUser(userData);
      setLoading(false);
      console.log('✅ Login complete, user state updated');

      return userData;
    } catch (error) {
      console.error('🚨 Login error:', error);
      setLoading(false);
      // Clear any existing session on error
      await supabase.auth.signOut();
      setUser(null);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setUser(null);
  };

  const createUser = async (userData: any, password: string) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
          role: userData.role
        }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: userData.email,
          username: userData.username,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          course: userData.course,
          department: userData.department,
          phone: userData.phone,
          approved: true, // Auto-approve
          blocked: false
        });

      if (profileError) {
        throw new Error(profileError.message);
      }
    }
  };

  const createUserWithBypass = async (userData: any) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
            role: userData.role
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Use the bypass function to create profile with admin privileges
        const { data, error: functionError } = await supabase.rpc('create_user_with_bypass', {
          p_email: userData.email,
          p_username: userData.username,
          p_first_name: userData.firstName,
          p_last_name: userData.lastName,
          p_role: userData.role,
          p_course: userData.course || null,
          p_department: userData.department || null,
          p_phone: userData.phone || null,
          p_approved: true
        });

        if (functionError) {
          // If profile creation fails, clean up the auth user
          await supabase.auth.signOut();
          throw new Error(functionError.message);
        }

        // Refresh users list
        await getAllUsers();
      }
    } catch (error) {
      console.error('Error creating user with bypass:', error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<SupabaseUser[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw new Error(error.message);
    }

    const usersList = data?.map(profile => ({
      id: profile.user_id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      approved: profile.approved,
      blocked: profile.blocked
    })) || [];

    setUsers(usersList);
    return usersList;
  };

  const approveUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Refresh users list
    await getAllUsers();
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Refresh users list
    await getAllUsers();
  };

  const signIn = async (identifier: string, password: string) => {
    const result = await login(identifier, password);
    if (!result) {
      throw new Error('Login failed');
    }
  };

  const updateProfilePicture = async (file: File) => {
    // Mock implementation - just log for now
    console.log('Profile picture update requested:', file.name);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    createUser,
    createUserWithBypass,
    getAllUsers,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'registrar',
    users,
    approveUser,
    deleteUser,
    signIn,
    updateProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};