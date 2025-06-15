
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
import { supabase } from "@/integrations/supabase/client";

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

// Define Supabase table names
const USERS_TABLE = 'users';
const UNIT_REG_TABLE = 'pending_unit_registrations';
const EXAM_RESULTS_TABLE = 'exam_results';

const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUnitRegistrations, setPendingUnitRegistrations] = useState<PendingUnitRegistration[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);

  // Fetch from Supabase on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from(USERS_TABLE).select('*');
      if (!error && data) setUsers(data as User[]);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPending = async () => {
      const { data, error } = await supabase.from(UNIT_REG_TABLE).select('*');
      if (!error && data) setPendingUnitRegistrations(data as PendingUnitRegistration[]);
    };
    fetchPending();
  }, []);

  useEffect(() => {
    const fetchExamResults = async () => {
      const { data, error } = await supabase.from(EXAM_RESULTS_TABLE).select('*');
      if (!error && data) setExamResults(data as ExamResult[]);
    };
    fetchExamResults();
  }, []);

  const updateUserApproval = async (userId: string, approved: boolean) => {
    await supabase.from(USERS_TABLE).update({ approved }).eq('id', userId);
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, approved } : u));
  };

  const approveUser = async (userId: string) => updateUserApproval(userId, true);

  const approveStudent = async (userId: string) => updateUserApproval(userId, true);

  const rejectUser = async (userId: string) => {
    await supabase.from(USERS_TABLE).delete().eq('id', userId);
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  const blockUser = async (userId: string) => {
    await supabase.from(USERS_TABLE).update({ blocked: true }).eq('id', userId);
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, blocked: true } : u));
  };

  const unblockUser = async (userId: string) => {
    await supabase.from(USERS_TABLE).update({ blocked: false }).eq('id', userId);
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, blocked: false } : u));
  };

  const getAllUsers = () => users;

  const addPendingUnitRegistration = async (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => {
    const newRegistration = {
      ...registration,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    const { data } = await supabase.from(UNIT_REG_TABLE).insert([newRegistration]).select();
    if (data && data.length > 0) {
      setPendingUnitRegistrations(prev => [...prev, data[0] as PendingUnitRegistration]);
    }
  };

  const updateUnitRegistrationStatus = async (registrationId: string, status: 'approved' | 'rejected') => {
    await supabase.from(UNIT_REG_TABLE).update({ status }).eq('id', registrationId);
    setPendingUnitRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId ? { ...reg, status } : reg
      )
    );
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const addExamResult = async (result: Omit<ExamResult, 'id'>) => {
    const { data } = await supabase.from(EXAM_RESULTS_TABLE).insert([result]).select();
    if (data && data.length > 0) {
      setExamResults(prev => [...prev, data[0] as ExamResult]);
    }
  };

  const sendResultsNotification = async (resultIds: string[], sendToGuardians: boolean) => {
    return sendNotifications(resultIds, sendToGuardians, examResults, users);
  };

  const updateStudentFinancialStatus = async (studentId: string, status: User['financialStatus'], totalOwed?: number) => {
    await supabase.from(USERS_TABLE).update({ financialStatus: status, totalFeesOwed: totalOwed }).eq('id', studentId);
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
