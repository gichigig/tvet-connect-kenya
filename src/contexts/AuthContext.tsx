import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'lecturer' | 'hod' | 'registrar' | 'finance' | 'admin';
  approved: boolean;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: { firstName: string; lastName: string; email: string; password: string; role: string; department?: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  getAllUsers: () => User[];
  getPendingUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin credentials
const ADMIN_EMAIL = 'billyblund17@gmail.com';
const ADMIN_PASSWORD = 'billybill';

// Mock users database
const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: ADMIN_EMAIL,
    firstName: 'Billy',
    lastName: 'Blund',
    role: 'admin',
    approved: true
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load users from localStorage
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check for admin credentials first
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = users.find(u => u.email === ADMIN_EMAIL) || mockUsers[0];
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return true;
    }
    
    // Find user in our mock database
    const foundUser = users.find(u => u.email === email);
    
    if (!foundUser) {
      throw new Error('User not found');
    }
    
    if (!foundUser.approved && foundUser.role !== 'admin') {
      throw new Error('Account pending approval');
    }
    
    setUser(foundUser);
    localStorage.setItem('user', JSON.stringify(foundUser));
    return true;
  };

  const signup = async (userData: { firstName: string; lastName: string; email: string; password: string; role: string; department?: string }): Promise<boolean> => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role as User['role'],
      approved: userData.role === 'student', // Students are auto-approved
      department: userData.department
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // If it's a student, log them in immediately
    if (userData.role === 'student') {
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const approveUser = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, approved: true } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const rejectUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const getAllUsers = () => users;
  
  const getPendingUsers = () => users.filter(u => !u.approved && u.role !== 'admin');

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    approveUser,
    rejectUser,
    getAllUsers,
    getPendingUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
