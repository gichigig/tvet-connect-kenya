import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseAuthService, SupabaseUser, AuthState } from '@/services/SupabaseAuthService';

export interface AuthContextType {
  // Current user and state
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Authentication methods
  signUp: (signupData: any) => Promise<{ user: SupabaseUser | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ user: SupabaseUser | null; error: string | null }>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<SupabaseUser>) => Promise<{ user: SupabaseUser | null; error: string | null }>;
  updateProfilePicture: (file: File) => Promise<{ error: string | null }>;
  changePassword: (newPassword: string) => Promise<{ error: string | null }>;

  // User management (admin functions)
  getAllUsers: () => Promise<SupabaseUser[]>;
  users: SupabaseUser[];
  setUsers: React.Dispatch<React.SetStateAction<SupabaseUser[]>>;
  approveUser: (userId: string) => Promise<{ error: string | null }>;
  rejectUser: (userId: string) => Promise<{ error: string | null }>;
  deleteUser: (userId: string) => Promise<{ error: string | null }>;
  blockUser: (userId: string) => Promise<{ error: string | null }>;
  unblockUser: (userId: string) => Promise<{ error: string | null }>;
  createUser: (userData: any, password: string) => Promise<{ user: SupabaseUser | null; error: string | null }>;
  
  // Helper methods for backward compatibility
  getPendingUsers: () => SupabaseUser[];
  getApprovedUsers: () => SupabaseUser[];
  getPendingUnitRegistrations: () => any[];
  refreshUsers: () => Promise<void>;

  // Additional properties that components expect
  pendingUnitRegistrations: any[];
  studentFees: any[];
  clearanceForms: any[];
  supplyRequests: any[];
  createdContent: any[];
  paymentRecords: any[];
  
  // Finance functions
  addFeeStructure: (data: any) => Promise<void>;
  generateInvoice: (data: any) => Promise<void>;
  updateFeeStatus: (id: string, status: string) => Promise<void>;
  addPaymentRecord: (data: any) => Promise<void>;
  updateStudentFinancialStatus: (userId: string, status: string) => Promise<void>;
  addClearanceForm: (data: any) => Promise<void>;
  updateClearanceStatus: (id: string, status: string) => Promise<void>;
  getStudentCard: (userId: string) => Promise<any>;
  getActivityLogs: () => Promise<any[]>;
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

  // Admin user creation functionality
  const createUser = async (userData: any, password: string) => {
    try {
      const signupData = {
        email: userData.email,
        password: password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        username: userData.username,
        course: userData.course,
        department: userData.department,
        level: userData.level,
        year: userData.year,
        semester: userData.semester,
        academicYear: userData.academicYear
      };

      const result = await authService.signUp(signupData);
      if (!result.error && authState.user && ['admin', 'registrar'].includes(authState.user.role)) {
        await loadAllUsers(); // Refresh user list
      }
      return result;
    } catch (error: any) {
      return { user: null, error: error.message || 'Failed to create user' };
    }
  };

  // Additional user management methods
  const logout = async () => {
    await signOut();
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await authService.supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (!error) {
        await loadAllUsers();
      }
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to reject user' };
    }
  };

  const blockUser = async (userId: string) => {
    try {
      const { error } = await authService.supabase
        .from('profiles')
        .update({ blocked: true })
        .eq('user_id', userId);
      
      if (!error) {
        await loadAllUsers();
      }
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to block user' };
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      const { error } = await authService.supabase
        .from('profiles')
        .update({ blocked: false })
        .eq('user_id', userId);
      
      if (!error) {
        await loadAllUsers();
      }
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to unblock user' };
    }
  };

  const updateProfilePicture = async (file: File) => {
    // TODO: Implement file upload to Supabase storage
    return { error: 'Profile picture upload not implemented yet' };
  };

  const changePassword = async (newPassword: string) => {
    try {
      const { error } = await authService.supabase.auth.updateUser({
        password: newPassword
      });
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to change password' };
    }
  };

  // Placeholder implementations for missing finance/admin functions
  const addFeeStructure = async (data: any) => {
    console.log('addFeeStructure not implemented', data);
  };

  const generateInvoice = async (data: any) => {
    console.log('generateInvoice not implemented', data);
  };

  const updateFeeStatus = async (id: string, status: string) => {
    console.log('updateFeeStatus not implemented', id, status);
  };

  const addPaymentRecord = async (data: any) => {
    console.log('addPaymentRecord not implemented', data);
  };

  const updateStudentFinancialStatus = async (userId: string, status: string) => {
    console.log('updateStudentFinancialStatus not implemented', userId, status);
  };

  const addClearanceForm = async (data: any) => {
    console.log('addClearanceForm not implemented', data);
  };

  const updateClearanceStatus = async (id: string, status: string) => {
    console.log('updateClearanceStatus not implemented', id, status);
  };

  const getStudentCard = async (userId: string) => {
    console.log('getStudentCard not implemented', userId);
    return null;
  };

  const getActivityLogs = async () => {
    console.log('getActivityLogs not implemented');
    return [];
  };

  const contextValue: AuthContextType = {
    // Current user and state
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.role === 'admin' || authState.user?.role === 'registrar',

    // Authentication methods
    signUp,
    signIn,
    login,
    logout,
    signOut,
    resetPassword,
    updateProfile,
    updateProfilePicture,
    changePassword,

    // User management
    getAllUsers,
    users: allUsers,
    setUsers: setAllUsers,
    approveUser,
    rejectUser,
    deleteUser,
    blockUser,
    unblockUser,
    createUser,

    // Helper methods
    getPendingUsers,
    getApprovedUsers,
    getPendingUnitRegistrations,
    refreshUsers,

    // Additional properties that components expect
    pendingUnitRegistrations: [],
    studentFees: [],
    clearanceForms: [],
    supplyRequests: [],
    createdContent: [],
    paymentRecords: [],

    // Finance functions
    addFeeStructure,
    generateInvoice,
    updateFeeStatus,
    addPaymentRecord,
    updateStudentFinancialStatus,
    addClearanceForm,
    updateClearanceStatus,
    getStudentCard,
    getActivityLogs
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
