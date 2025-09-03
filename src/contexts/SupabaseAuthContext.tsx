import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseAuthService, SupabaseUser, AuthState } from '@/services/SupabaseAuthService';

export interface AuthContextType {
  // Current user and state
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;

  // Authentication methods
  signUp: (signupData: any) => Promise<{ user: SupabaseUser | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ user: SupabaseUser | null; error: string | null }>;
  login: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<SupabaseUser>) => Promise<{ user: SupabaseUser | null; error: string | null }>;

  // User management (admin functions)
  getAllUsers: () => Promise<SupabaseUser[]>;
  approveUser: (userId: string) => Promise<{ error: string | null }>;
  deleteUser: (userId: string) => Promise<{ error: string | null }>;
  
  // Helper methods for backward compatibility
  getPendingUsers: () => SupabaseUser[];
  getApprovedUsers: () => SupabaseUser[];
  getPendingUnitRegistrations: () => any[]; // Placeholder - will need to implement based on your data structure
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });
  const [allUsers, setAllUsers] = useState<SupabaseUser[]>([]);

  const authService = SupabaseAuthService.getInstance();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((newAuthState) => {
      setAuthState(newAuthState);
      
      // Load all users if user is admin/registrar
      if (newAuthState.user && ['admin', 'registrar', 'hod'].includes(newAuthState.user.role)) {
        loadAllUsers();
      }
    });

    return unsubscribe;
  }, [authService]);

  const loadAllUsers = async () => {
    try {
      const users = await authService.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Authentication methods
  const signUp = async (signupData: any) => {
    const result = await authService.signUp(signupData);
    if (result.user && authState.user && ['admin', 'registrar'].includes(authState.user.role)) {
      await loadAllUsers(); // Refresh user list
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    return authService.signIn({ email, password });
  };

  const login = async (identifier: string, password: string) => {
    try {
      // Determine if identifier is email or username
      const isEmail = identifier.includes('@');
      let email = identifier;
      
      // If it's a username, try to find the corresponding email
      if (!isEmail) {
        // Query the profiles table to find user by username
        const { data: profile } = await authService.supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single();
        
        if (profile) {
          email = profile.email;
        } else {
          throw new Error('User not found');
        }
      }

      const result = await authService.signIn({ email, password });
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signOut = async () => {
    const result = await authService.signOut();
    if (!result.error) {
      setAllUsers([]);
    }
    return result;
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  const updateProfile = async (updates: Partial<SupabaseUser>) => {
    return authService.updateUserProfile(updates);
  };

  const getAllUsers = async (): Promise<SupabaseUser[]> => {
    const users = await authService.getAllUsers();
    setAllUsers(users);
    return users;
  };

  const approveUser = async (userId: string) => {
    const result = await authService.approveUser(userId);
    if (!result.error) {
      await loadAllUsers(); // Refresh user list
    }
    return result;
  };

  const deleteUser = async (userId: string) => {
    const result = await authService.deleteUser(userId);
    if (!result.error) {
      await loadAllUsers(); // Refresh user list
    }
    return result;
  };

  // Helper methods for backward compatibility
  const getPendingUsers = (): SupabaseUser[] => {
    return allUsers.filter(user => !user.approved);
  };

  const getApprovedUsers = (): SupabaseUser[] => {
    return allUsers.filter(user => user.approved);
  };

  const getPendingUnitRegistrations = (): any[] => {
    // TODO: Implement based on your unit registration data structure
    // This is a placeholder for backward compatibility
    return [];
  };

  const refreshUsers = async (): Promise<void> => {
    await loadAllUsers();
  };

  const contextValue: AuthContextType = {
    // Current user and state
    user: authState.user,
    loading: authState.loading,
    error: authState.error,

    // Authentication methods
    signUp,
    signIn,
    login,
    signOut,
    resetPassword,
    updateProfile,

    // User management
    getAllUsers,
    approveUser,
    deleteUser,

    // Helper methods
    getPendingUsers,
    getApprovedUsers,
    getPendingUnitRegistrations,
    refreshUsers
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
