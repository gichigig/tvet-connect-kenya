
import { useNavigate } from 'react-router-dom';
import { User } from './types';
import { createNewUser, findUserByEmail } from './authUtils';

export const useAuthHelpers = () => {
  const navigate = useNavigate();

  const login = async (email: string, password: string, role: string | undefined, users: User[], setUser: (user: User | null) => void) => {
    try {
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
      
      // For demo purposes, we'll accept any password for approved users
      // In a real app, you would validate the password hash here
      console.log(`Login attempt for ${email} with role ${foundUser.role}`);
      
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
      setUser(null);
      // Use replace to prevent going back to authenticated pages
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  return { login, signup, logout };
};
