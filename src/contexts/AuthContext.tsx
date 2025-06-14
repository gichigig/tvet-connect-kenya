
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'lecturer' | 'hod' | 'registrar' | 'finance' | 'admin';
  approved: boolean;
  blocked?: boolean;
  department?: string;
  admissionNumber?: string;
  course?: string;
  level?: 'diploma' | 'certificate';
  intake?: 'january' | 'may' | 'september';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: { firstName: string; lastName: string; email: string; password: string; role: string; department?: string; course?: string; level?: 'diploma' | 'certificate'; intake?: 'january' | 'may' | 'september' }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  getAllUsers: () => User[];
  getPendingUsers: () => User[];
  approveStudent: (userId: string) => void;
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
const ADMIN_PASSWORD = 'admin123';

// Mock users database
const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: ADMIN_EMAIL,
    firstName: 'Billy',
    lastName: 'Blund',
    role: 'admin',
    approved: true,
    blocked: false
  }
];

// Function to generate admission number
const generateAdmissionNumber = (course: string, level: 'diploma' | 'certificate', intake: 'january' | 'may' | 'september'): string => {
  const levelCode = level === 'diploma' ? 'D' : 'C';
  const courseInitials = course.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  const intakeCode = intake === 'january' ? '01' : intake === 'may' ? '02' : '03';
  const studentNumber = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
  const year = new Date().getFullYear();
  
  return `${levelCode}${courseInitials}-${intakeCode}-${studentNumber}/${year}`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure admin user has correct role
      if (parsedUser.email === ADMIN_EMAIL) {
        const adminUser = { ...parsedUser, role: 'admin', approved: true, blocked: false };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
      } else {
        setUser(parsedUser);
      }
    }
    
    // Load users from localStorage
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      // Ensure admin user exists and has correct role
      const adminExists = parsedUsers.find((u: User) => u.email === ADMIN_EMAIL);
      if (!adminExists) {
        const updatedUsers = [...parsedUsers, mockUsers[0]];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } else if (adminExists.role !== 'admin') {
        const updatedUsers = parsedUsers.map((u: User) => 
          u.email === ADMIN_EMAIL ? { ...u, role: 'admin', approved: true, blocked: false } : u
        );
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } else {
        setUsers(parsedUsers);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt - email:", email, "password:", password);
    
    // Check for admin credentials first
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log("Admin login detected");
      const adminUser = {
        id: 'admin-1',
        email: ADMIN_EMAIL,
        firstName: 'Billy',
        lastName: 'Blund',
        role: 'admin' as const,
        approved: true,
        blocked: false
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      console.log("Admin user set:", adminUser);
      return true;
    }
    
    // Find user in our mock database
    const foundUser = users.find(u => u.email === email);
    
    if (!foundUser) {
      throw new Error('User not found');
    }
    
    if (foundUser.blocked) {
      throw new Error('Account has been blocked. Please contact support.');
    }
    
    if (!foundUser.approved && foundUser.role !== 'admin') {
      throw new Error('Account pending approval');
    }
    
    setUser(foundUser);
    localStorage.setItem('user', JSON.stringify(foundUser));
    return true;
  };

  const signup = async (userData: { firstName: string; lastName: string; email: string; password: string; role: string; department?: string; course?: string; level?: 'diploma' | 'certificate'; intake?: 'january' | 'may' | 'september' }): Promise<boolean> => {
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
      approved: false, // All users including students now need approval
      blocked: false,
      department: userData.department,
      course: userData.course,
      level: userData.level,
      intake: userData.intake
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
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

  const approveStudent = (userId: string) => {
    const userToApprove = users.find(u => u.id === userId);
    if (userToApprove && userToApprove.role === 'student') {
      const admissionNumber = generateAdmissionNumber(
        userToApprove.course || 'General Studies',
        userToApprove.level || 'diploma',
        userToApprove.intake || 'january'
      );
      
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, approved: true, admissionNumber } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } else {
      // For non-students, use regular approval
      approveUser(userId);
    }
  };

  const rejectUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const blockUser = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, blocked: true } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // If the current user is being blocked, log them out
    if (user?.id === userId) {
      logout();
    }
  };

  const unblockUser = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, blocked: false } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const getAllUsers = () => users;
  
  const getPendingUsers = () => users.filter(u => !u.approved && u.role !== 'admin');

  console.log("AuthContext - user:", user);
  console.log("AuthContext - isAdmin:", user?.role === 'admin');

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    approveUser,
    rejectUser,
    blockUser,
    unblockUser,
    getAllUsers,
    getPendingUsers,
    approveStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
