import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin';

export interface SupabaseUser {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  approved?: boolean;
  blocked?: boolean;
  departmentId?: string;
  institutionId?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<SupabaseUser>;
  logout: () => Promise<void>;
  createUser: (userData: any, password: string) => Promise<void>;
  createUserWithBypass: (userData: any) => Promise<void>;
  getAllUsers: () => Promise<SupabaseUser[]>;
  getPendingUsers: () => SupabaseUser[];
  getPendingUnitRegistrations: () => any[];
  updateUnitRegistrationStatus: (registrationId: string, status: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: SupabaseUser[];
  approveUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const mapUser = (profile: any): SupabaseUser => ({
    id: profile.user_id || profile.id,
    email: profile.email,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    role: profile.role,
    approved: profile.approved,
    blocked: profile.blocked,
    departmentId: profile.department_id,
    institutionId: profile.institution_id
  });

  const getAllUsers = async (): Promise<SupabaseUser[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const login = async (identifier: string, password: string) => {
    setIsLoggingIn(true);
    
    try {
      let email = identifier;
      
      if (!identifier.includes('@')) {
        const { data: profile, error: lookupError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single();
          
        if (lookupError || !profile) {
          throw new Error('Invalid username or password');
        }
        
        email = profile.email;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found');
      }

      const mappedUser = mapUser(profile);
      setUser(mappedUser);
      return mappedUser;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const createUser = async (userData: any, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
            role: userData.role
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: userData.username,
            role: userData.role,
            approved: true
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const createUserWithBypass = async (userData: any) => {
    try {
      const { data, error } = await supabase.rpc('create_user_with_bypass', {
        p_email: userData.email,
        p_username: userData.username,
        p_first_name: userData.firstName,
        p_last_name: userData.lastName,
        p_role: userData.role,
        p_course: userData.course,
        p_department: userData.department,
        p_phone: userData.phone,
        p_approved: true
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user with bypass:', error);
      throw error;
    }
  };

  const getPendingUsers = () => {
    return users.filter(user => !user.approved);
  };

  const getPendingUnitRegistrations = () => {
    return [];
  };

  const updateUnitRegistrationStatus = async (registrationId: string, status: string) => {
    // Implementation for unit registration status update
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const signIn = async (identifier: string, password: string) => {
    await login(identifier, password);
  };

  const updateProfilePicture = async (file: File) => {
    // Implementation for profile picture update
  };

  // Initialize auth state
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          setUser(mapUser(profile));
        }
      }
      
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          setUser(mapUser(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load users periodically
  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    };

    loadUsers();
    const interval = setInterval(loadUsers, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: AuthContextType = {
    user,
    loading: loading || isLoggingIn,
    login,
    logout,
    createUser,
    createUserWithBypass,
    getAllUsers,
    getPendingUsers,
    getPendingUnitRegistrations,
    updateUnitRegistrationStatus,
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
