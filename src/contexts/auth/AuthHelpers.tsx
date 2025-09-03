
import { useNavigate } from 'react-router-dom';
import { User } from './types';
import { createNewUser, findUserByEmail, findUserByEmailOrUsername } from './authUtils';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';
import { SimpleUserMigration } from '@/services/SimpleUserMigration';

export const useAuthHelpers = () => {
  const navigate = useNavigate();

  const login = async (identifier: string, password: string, role: string | undefined, users: User[], setUser: (user: User | null) => void) => {
    try {
      console.log('🔐 Login attempt with identifier:', identifier, 'role:', role);
      
      // Check if identifier is an email (contains @)
      const isEmailFormat = identifier.includes('@');
      
      if (isEmailFormat) {
        // Try hybrid authentication for email logins
        try {
          console.log('🔄 Attempting Firebase authentication with Supabase migration...');
          const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
          const firebaseUser = userCredential.user;
          
          if (firebaseUser) {
            console.log('✅ Firebase authentication successful');
            
            // Migrate user to Supabase
            const migrationResult = await SimpleUserMigration.createSupabaseUser(firebaseUser);
            
            if (migrationResult.success) {
              console.log('✅ User created/exists in Supabase');
            } else {
              console.log('⚠️ Supabase migration failed:', migrationResult.error);
            }
            
            // Create User object from Firebase result
            const user: User = {
              id: firebaseUser.uid || '',
              email: firebaseUser.email || identifier,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              role: role as any || 'student',
              approved: true, // Firebase users are already approved
            };
            
            setUser(user);
            navigate('/');
            return;
          }
        } catch (hybridError) {
          console.log('Firebase authentication failed, falling back to legacy methods:', hybridError.message);
        }
      }
      
      // First, try to authenticate using realtime database (supports both email and username)
      const { authenticateUser } = await import('@/integrations/firebase/realtimeAuth');
      const realtimeUser = await authenticateUser(identifier, password);
      
      if (realtimeUser) {
        // User found in realtime database with correct credentials
        const user: User = {
          id: realtimeUser.id || '',
          email: realtimeUser.email,
          username: realtimeUser.username,
          firstName: realtimeUser.firstName,
          lastName: realtimeUser.lastName,
          role: realtimeUser.role as any,
          approved: realtimeUser.approved,
          admissionNumber: realtimeUser.admissionNumber,
          department: realtimeUser.department,
          courseId: realtimeUser.courseId,
          phone: realtimeUser.phone,
        };
        
        // Also try to sign into Firebase Auth for upload functionality (using email)
        try {
          await signInWithEmailAndPassword(auth, realtimeUser.email, password);
          console.log('Successfully signed into Firebase Auth as well');
          
          // Try to create/migrate this user to Supabase as well
          try {
            const migrationResult = await SimpleUserMigration.createSupabaseUser({
              uid: realtimeUser.id,
              email: realtimeUser.email,
              displayName: `${realtimeUser.firstName} ${realtimeUser.lastName}`.trim()
            });
            
            if (migrationResult.success) {
              console.log('✅ Realtime database user also migrated to Supabase');
            } else {
              console.log('Could not migrate realtime user to Supabase:', migrationResult.error);
            }
          } catch (hybridError) {
            console.log('Could not migrate realtime user to Supabase:', hybridError.message);
          }
        } catch (firebaseError) {
          console.log('Could not sign into Firebase Auth, uploads may not work:', firebaseError);
          // Continue anyway - user can still use the app, just uploads won't work
        }
        
        setUser(user);
        navigate('/');
        return;
      }

      // Try Firebase Auth for admin login (only works with email)
      if ((role === 'admin' || identifier.endsWith('@admin.com')) && isEmailFormat) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
          
          // Try hybrid auth to also create in Supabase
          try {
            const migrationResult = await SimpleUserMigration.createSupabaseUser(userCredential.user);
            
            if (migrationResult.success) {
              console.log('✅ Admin user also created/migrated in Supabase');
            } else {
              console.log('Could not migrate admin to Supabase:', migrationResult.error);
            }
          } catch (hybridError) {
            console.log('Could not migrate admin to Supabase:', hybridError.message);
          }
          
          // Find or create user profile in local state
          let foundUser = findUserByEmail(users, identifier);
          if (!foundUser) {
            foundUser = {
              id: userCredential.user.uid,
              email: identifier,
              firstName: '',
              lastName: '',
              role: 'admin',
              approved: true
            };
          }
          setUser(foundUser);
          navigate('/');
          return;
        } catch (firebaseError: any) {
          // If Firebase Auth fails, fall back to local logic for legacy/hardcoded admins
        }
      }
      
      // Local fallback for non-admins or legacy admins
      const foundUser = findUserByEmailOrUsername(users, identifier);
      if (!foundUser) {
        throw new Error('Invalid credentials or account not approved.');
      }
      if (!foundUser.approved) {
        throw new Error('Account pending approval. Please contact admin.');
      }
      if (foundUser.blocked) {
        throw new Error('Account has been blocked. Please contact admin.');
      }
      if (foundUser.role === 'admin' && foundUser.password) {
        if (password !== foundUser.password) {
          throw new Error('Invalid credentials for admin.');
        }
      } else if (foundUser.email === 'ngangabildad@gmail.com') {
        if (password !== 'bildad') {
          throw new Error('Invalid credentials for admin.');
        }
      }
      // For demo purposes, we'll accept any password for other approved users
      setUser(foundUser);
      navigate('/');
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  };

  const signup = async (userData: any, setUsers: React.Dispatch<React.SetStateAction<User[]>>, setUser: (user: User | null) => void) => {
    try {
      const newUser = createNewUser(userData);
      setUsers(prevUsers => [...prevUsers, newUser]);
      setUser(newUser);
      navigate('/');
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      throw error;
    }
  };

  const logout = async (setUser: (user: User | null) => void) => {
    try {
      console.log("Logging out user...");
      // Clear user first
      setUser(null);
      
      // Use setTimeout to ensure state update completes before navigation
      setTimeout(() => {
        console.log("Navigating to login page...");
        navigate('/login', { replace: true });
      }, 100);
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  return { login, signup, logout };
};
