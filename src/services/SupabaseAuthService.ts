export interface SupabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  approved?: boolean;
  blocked?: boolean;
  phone?: string;
  profilePicture?: string;
  department?: string;
  course?: string;
  level?: string;
  admissionNumber?: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  loading: boolean;
  error?: string;
  session?: any;
}

export const SupabaseAuthService = {
  getInstance: () => ({
    getAuthState: () => ({ user: null, loading: false }),
    createUser: () => Promise.resolve(),
    login: () => Promise.resolve(),
    onAuthStateChange: (callback: any) => ({ unsubscribe: () => {} }),
    getAllUsers: () => Promise.resolve([]),
    signUp: () => Promise.resolve({ user: null, error: null }),
    signIn: () => Promise.resolve({ user: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    resetPassword: () => Promise.resolve({ error: null }),
    updateUserProfile: () => Promise.resolve({ error: null }),
    approveUser: () => Promise.resolve({ error: null }),
    deleteUser: () => Promise.resolve({ error: null }),
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      })
    }
  })
};