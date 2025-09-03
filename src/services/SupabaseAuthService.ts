export interface SupabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  approved?: boolean;
  blocked?: boolean;
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
    login: () => Promise.resolve()
  })
};