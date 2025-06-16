
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, PendingUnitRegistration, ExamResult } from '../auth/types';
import { 
  createNewUser, 
  findUserByEmail, 
  updateUserInList, 
  removeUserFromList, 
  getPendingUsers 
} from '../auth/authUtils';
import { sendResultsNotification as sendNotifications } from '../auth/notificationUtils';
import { mockUsers, mockPendingUnitRegistrations, mockExamResults } from '../auth/mockData';

interface UsersContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  pendingUnitRegistrations: PendingUnitRegistration[];
  setPendingUnitRegistrations: React.Dispatch<React.SetStateAction<PendingUnitRegistration[]>>;
  examResults: ExamResult[];
  setExamResults: React.Dispatch<React.SetStateAction<ExamResult[]>>;
  updateUserApproval: (userId: string, approved: boolean) => void;
  approveUser: (userId: string) => void;
  approveStudent: (userId: string) => void;
  rejectUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  getAllUsers: () => User[];
  addPendingUnitRegistration: (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => void;
  updateUnitRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => void;
  getPendingUnitRegistrations: () => PendingUnitRegistration[];
  addExamResult: (result: Omit<ExamResult, 'id'>) => void;
  sendResultsNotification: (resultIds: string[], sendToGuardians: boolean) => Promise<void>;
  updateStudentFinancialStatus: (studentId: string, status: User['financialStatus'], totalOwed?: number) => void;
}

const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [pendingUnitRegistrations, setPendingUnitRegistrations] = useState<PendingUnitRegistration[]>(mockPendingUnitRegistrations);
  const [examResults, setExamResults] = useState<ExamResult[]>(mockExamResults);

  const updateUserApproval = (userId: string, approved: boolean) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, approved } : u));
  };

  const approveUser = (userId: string) => updateUserApproval(userId, true);

  const approveStudent = (userId: string) => updateUserApproval(userId, true);

  const rejectUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  const blockUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, blocked: true } : u));
  };

  const unblockUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, blocked: false } : u));
  };

  const getAllUsers = () => users;

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

  const updateStudentFinancialStatus = (studentId: string, status: User['financialStatus'], totalOwed?: number) => {
    setUsers(prev => prev.map(user => 
      user.id === studentId 
        ? { ...user, financialStatus: status, totalFeesOwed: totalOwed }
        : user
    ));
  };

  const value = {
    users,
    setUsers,
    pendingUnitRegistrations,
    setPendingUnitRegistrations,
    examResults,
    setExamResults,
    updateUserApproval,
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getAllUsers,
    addPendingUnitRegistration,
    updateUnitRegistrationStatus,
    getPendingUnitRegistrations,
    addExamResult,
    sendResultsNotification,
    updateStudentFinancialStatus
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
