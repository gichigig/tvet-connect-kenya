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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (userData: any, password: string) => Promise<void>;
  getAllUsers: () => Promise<SupabaseUser[]>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Additional properties for compatibility
  users: SupabaseUser[];
  approveUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SupabaseUser[]>([]);

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
      if (session?.user) {
        // Get user profile
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
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new Error(error.message);
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
        emailRedirectTo: `${window.location.origin}/`
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
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          course: userData.course,
          department: userData.department,
          phone: userData.phone,
          approved: false,
          blocked: false
        });

      if (profileError) {
        throw new Error(profileError.message);
      }
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

  const signIn = async (email: string, password: string) => {
    await login(email, password);
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