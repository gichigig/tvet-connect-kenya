
import { useNavigate } from 'react-router-dom';
import { User } from './types';
import { createNewUser, findUserByEmail } from './authUtils';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '@/integrations/firebase/config';

export const useAuthHelpers = () => {
  const navigate = useNavigate();

  const login = async (email: string, password: string, role: string | undefined, users: User[], setUser: (user: User | null) => void) => {
    try {
      // Try Firebase Auth for admin login
      if (role === 'admin' || email.endsWith('@admin.com')) {
        const auth = getAuth(firebaseApp);
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          // Find or create user profile in local state
          let foundUser = findUserByEmail(users, email);
          if (!foundUser) {
            foundUser = {
              id: userCredential.user.uid,
              email,
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
      const foundUser = findUserByEmail(users, email);
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
