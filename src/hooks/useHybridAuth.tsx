/**
 * Hybrid Authentication Hook
 * Manages transition from Firebase to Supabase authentication
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { hybridAuth } from '@/services/HybridAuthService';
import { useToast } from '@/hooks/use-toast';

interface HybridAuthContextType {
  user: any | null;
  loading: boolean;
  authProvider: 'firebase' | 'supabase' | null;
  isUserMigrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forceMigration: () => Promise<boolean>;
  getAuthToken: () => Promise<string | null>;
  refreshUser: () => void;
}

const HybridAuthContext = createContext<HybridAuthContextType | undefined>(undefined);

export const useHybridAuth = (): HybridAuthContextType => {
  const context = useContext(HybridAuthContext);
  if (context === undefined) {
    throw new Error('useHybridAuth must be used within a HybridAuthProvider');
  }
  return context;
};

interface HybridAuthProviderProps {
  children: ReactNode;
}

export const HybridAuthProvider = ({ children }: HybridAuthProviderProps) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authProvider, setAuthProvider] = useState<'firebase' | 'supabase' | null>(null);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = hybridAuth.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthProvider(hybridAuth.getAuthProvider());
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const currentUser = await hybridAuth.signIn(email, password);
      setUser(currentUser);
      setAuthProvider(hybridAuth.getAuthProvider());
      
      // Show migration status
      if (hybridAuth.getAuthProvider() === 'firebase') {
        const migrated = hybridAuth.isUserMigrated();
        if (migrated) {
          toast({
            title: 'Migration Complete',
            description: 'Your account has been successfully migrated to our new system!',
            duration: 5000,
          });
        } else {
          toast({
            title: 'Account Migration',
            description: 'Your account is being migrated to our improved system. This happens automatically.',
            duration: 7000,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to sign in. Please check your credentials.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await hybridAuth.signOut();
      setUser(null);
      setAuthProvider(null);
    } catch (error: any) {
      toast({
        title: 'Sign Out Error',
        description: error.message || 'Failed to sign out.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const forceMigration = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await hybridAuth.forceMigration();
      
      if (success) {
        setAuthProvider('supabase');
        const currentUser = hybridAuth.getCurrentUser();
        setUser(currentUser);
      }
      
      return success;
    } catch (error: any) {
      toast({
        title: 'Migration Failed',
        description: error.message || 'Failed to complete migration.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    if (authProvider === 'firebase') {
      return await hybridAuth.getFirebaseToken();
    } else if (authProvider === 'supabase') {
      const session = await hybridAuth.getSupabaseSession();
      return session?.access_token || null;
    }
    return null;
  };

  const refreshUser = () => {
    setUser(hybridAuth.getCurrentUser());
    setAuthProvider(hybridAuth.getAuthProvider());
  };

  const isUserMigrated = hybridAuth.isUserMigrated();

  const value: HybridAuthContextType = {
    user,
    loading,
    authProvider,
    isUserMigrated,
    signIn,
    signOut,
    forceMigration,
    getAuthToken,
    refreshUser,
  };

  return (
    <HybridAuthContext.Provider value={value}>
      {children}
    </HybridAuthContext.Provider>
  );
};
