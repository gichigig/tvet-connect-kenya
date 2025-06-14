
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  PendingUnitRegistration, 
  ExamResult, 
  AuthContextType,
  CreatedContent
} from './auth/types';
import { 
  mockUsers, 
  mockPendingUnitRegistrations, 
  mockExamResults 
} from './auth/mockData';
import { 
  createNewUser, 
  findUserByEmail, 
  updateUserInList, 
  removeUserFromList, 
  getPendingUsers 
} from './auth/authUtils';
import { sendResultsNotification as sendNotifications } from './auth/notificationUtils';
import { Unit } from '@/types/unitManagement';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const navigate = useNavigate();
  
  const [pendingUnitRegistrations, setPendingUnitRegistrations] = useState<PendingUnitRegistration[]>(mockPendingUnitRegistrations);
  const [examResults, setExamResults] = useState<ExamResult[]>(mockExamResults);
  const [createdUnits, setCreatedUnits] = useState<Unit[]>([]);
  const [createdContent, setCreatedContent] = useState<CreatedContent[]>([]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchUsers = async () => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    };

    fetchUsers();
  }, []);

  const login = async (email: string, password: string, role?: string) => {
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

  const signup = async (userData: any) => {
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

  const logout = async () => {
    try {
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  const updateUserApproval = (userId: string, approved: boolean) => {
    setUsers(prevUsers => updateUserInList(prevUsers, userId, { approved }));
  };

  const approveUser = (userId: string) => {
    updateUserApproval(userId, true);
  };

  const approveStudent = (userId: string) => {
    updateUserApproval(userId, true);
  };

  const rejectUser = (userId: string) => {
    setUsers(prevUsers => removeUserFromList(prevUsers, userId));
  };

  const blockUser = (userId: string) => {
    setUsers(prevUsers => updateUserInList(prevUsers, userId, { blocked: true }));
  };

  const unblockUser = (userId: string) => {
    setUsers(prevUsers => updateUserInList(prevUsers, userId, { blocked: false }));
  };

  const getAllUsers = () => {
    return users;
  };

  const addPendingUnitRegistration = (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => {
    const newRegistration: PendingUnitRegistration = {
      ...registration,
      id: Date.now().toString(),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setPendingUnitRegistrations(prev => [...prev, newRegistration]);
  };

  const updateUnitRegistrationStatus = (registrationId: string, status: 'approved' | 'rejected') => {
    setPendingUnitRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId ? { ...reg, status } : reg
      )
    );
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const addExamResult = (result: Omit<ExamResult, 'id'>) => {
    const newResult: ExamResult = {
      ...result,
      id: Date.now().toString()
    };
    setExamResults(prev => [...prev, newResult]);
  };

  const sendResultsNotification = async (resultIds: string[], sendToGuardians: boolean) => {
    return sendNotifications(resultIds, sendToGuardians, examResults, users);
  };

  const addCreatedUnit = (unit: Unit) => {
    setCreatedUnits(prev => [...prev, unit]);
  };

  const updateCreatedUnit = (unitId: string, updates: Partial<Unit>) => {
    setCreatedUnits(prev => prev.map(unit => 
      unit.id === unitId ? { ...unit, ...updates } : unit
    ));
  };

  const deleteCreatedUnit = (unitId: string) => {
    setCreatedUnits(prev => prev.filter(unit => unit.id !== unitId));
  };

  const getAvailableUnits = (course?: string, year?: number) => {
    if (!course || !year) return [];
    return createdUnits.filter(unit => 
      unit.course === course && unit.year === year && unit.status === 'active'
    );
  };

  const addCreatedContent = (content: CreatedContent) => {
    setCreatedContent(prev => [...prev, content]);
  };

  const updateCreatedContent = (contentId: string, updates: Partial<CreatedContent>) => {
    setCreatedContent(prev => prev.map(content => 
      content.id === contentId ? { ...content, ...updates } : content
    ));
  };

  const deleteCreatedContent = (contentId: string) => {
    setCreatedContent(prev => prev.filter(content => content.id !== contentId));
  };

  const value = {
    user,
    login,
    signup,
    logout,
    users,
    isAuthenticated,
    isAdmin,
    updateUserApproval,
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getPendingUsers: () => getPendingUsers(users),
    getAllUsers,
    pendingUnitRegistrations,
    addPendingUnitRegistration,
    updateUnitRegistrationStatus,
    getPendingUnitRegistrations,
    examResults,
    addExamResult,
    sendResultsNotification,
    createdUnits,
    addCreatedUnit,
    updateCreatedUnit,
    deleteCreatedUnit,
    getAvailableUnits,
    createdContent,
    addCreatedContent,
    updateCreatedContent,
    deleteCreatedContent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export types for convenience
export type { User, PendingUnitRegistration, ExamResult, Guardian } from './auth/types';
