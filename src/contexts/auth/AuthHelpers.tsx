
import { useNavigate } from 'react-router-dom';
import { User } from './types';
import { createNewUser, findUserByEmail } from './authUtils';

export const useAuthHelpers = () => {
  const navigate = useNavigate();

  const login = async (email: string, password: string, role: string | undefined, users: User[], setUser: (user: User | null) => void) => {
    try {
      const foundUser = findUserByEmail(users, email);
      if (foundUser && foundUser.approved) {
        setUser(foundUser);
        navigate('/');
      } else {
        throw new Error('Invalid credentials or account not approved.');
      }
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
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  return { login, signup, logout };
};
