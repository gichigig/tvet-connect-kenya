import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, PendingUnitRegistration, ExamResult, StudentCard, ActivityLog } from '../auth/types';
import { 
  createNewUser, 
  findUserByEmail, 
  updateUserInList, 
  removeUserFromList, 
  getPendingUsers 
} from '../auth/authUtils';
import { sendResultsNotification as sendNotifications } from '../auth/notificationUtils';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { fetchAllUsersFromFirebase } from '@/integrations/firebase/fetchAllUsers';

interface UsersContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  pendingUnitRegistrations: PendingUnitRegistration[];
  setPendingUnitRegistrations: React.Dispatch<React.SetStateAction<PendingUnitRegistration[]>>;
  examResults: ExamResult[];
  setExamResults: React.Dispatch<React.SetStateAction<ExamResult[]>>;
  studentCards: StudentCard[];
  setStudentCards: React.Dispatch<React.SetStateAction<StudentCard[]>>;
  activityLogs: ActivityLog[];
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
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
  activateStudentCard: (studentId: string, activatedBy: string) => void;
  deactivateStudentCard: (studentId: string, deactivatedBy: string) => void;
  logActivity: (userId: string, userName: string, userRole: string, action: string, details: string, department: ActivityLog['department'], targetStudentId?: string, targetStudentName?: string) => void;
  getStudentCard: (studentId: string) => StudentCard | undefined;
  getActivityLogs: (department?: string) => ActivityLog[];
}

const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);

  // On mount, fetch admins from Firebase and merge into users state
  useEffect(() => {
    fetchAllUsersFromFirebase().then(fetchedUsers => {
      setUsers(fetchedUsers.map((u: any) => ({
        ...u,
        id: u.uid || u.id || (Date.now().toString() + Math.random()),
        role: u.role || 'admin', // fallback to admin if missing, but prefer actual role
        approved: u.approved !== undefined ? u.approved : true,
        blocked: u.blocked !== undefined ? u.blocked : false
      })));
    });
  }, []);
  const [pendingUnitRegistrations, setPendingUnitRegistrations] = useState<PendingUnitRegistration[]>([]);

  // Real-time Firestore sync for pending unit registrations
  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, 'pendingUnitRegistrations'), (snapshot) => {
      setPendingUnitRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as PendingUnitRegistration) })));
    });
    return () => unsubscribe();
  }, []);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [studentCards, setStudentCards] = useState<StudentCard[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const updateUserApproval = (userId: string, approved: boolean) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { 
      ...u, 
      approved,
      courseName: u.courseName || u.course // Ensure courseName is set for ApprovedStudents component
    } : u));
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

  const activateStudentCard = (studentId: string, activatedBy: string) => {
    const student = users.find(u => u.id === studentId);
    if (!student || student.role !== 'student') return;

    const existingCard = studentCards.find(c => c.studentId === studentId);
    
    if (existingCard) {
      setStudentCards(prev => prev.map(card => 
        card.studentId === studentId 
          ? { 
              ...card, 
              isActive: true, 
              status: 'active',
              activatedBy,
              activatedDate: new Date().toISOString().split('T')[0]
            }
          : card
      ));
    } else {
      const newCard: StudentCard = {
        id: Date.now().toString(),
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber || '',
        course: student.course || '',
        year: student.year || 1,
        semester: Number(student.semester) || 1,
        academicYear: '2024/2025',
        isActive: true,
        activatedBy,
        activatedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0]
      };
      setStudentCards(prev => [...prev, newCard]);
    }

    logActivity(
      activatedBy,
      'Finance Staff',
      'finance',
      'Activate Student Card',
      `Activated student card for ${student.firstName} ${student.lastName}`,
      'finance',
      studentId,
      `${student.firstName} ${student.lastName}`
    );
  };

  const deactivateStudentCard = (studentId: string, deactivatedBy: string) => {
    const student = users.find(u => u.id === studentId);
    
    setStudentCards(prev => prev.map(card => 
      card.studentId === studentId 
        ? { 
            ...card, 
            isActive: false, 
            status: 'inactive',
            deactivatedBy,
            deactivatedDate: new Date().toISOString().split('T')[0]
          }
        : card
    ));

    if (student) {
      logActivity(
        deactivatedBy,
        'Finance Staff',
        'finance',
        'Deactivate Student Card',
        `Deactivated student card for ${student.firstName} ${student.lastName}`,
        'finance',
        studentId,
        `${student.firstName} ${student.lastName}`
      );
    }
  };

  const logActivity = (
    userId: string, 
    userName: string, 
    userRole: string, 
    action: string, 
    details: string, 
    department: ActivityLog['department'],
    targetStudentId?: string,
    targetStudentName?: string
  ) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId,
      userName,
      userRole,
      action,
      details,
      targetStudentId,
      targetStudentName,
      timestamp: new Date().toISOString(),
      department
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const getStudentCard = (studentId: string) => {
    return studentCards.find(card => card.studentId === studentId);
  };

  const getActivityLogs = (department?: string) => {
    if (department) {
      return activityLogs.filter(log => log.department === department);
    }
    return activityLogs;
  };

  const value = {
    users,
    setUsers,
    pendingUnitRegistrations,
    setPendingUnitRegistrations,
    examResults,
    setExamResults,
    studentCards,
    setStudentCards,
    activityLogs,
    setActivityLogs,
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
    updateStudentFinancialStatus,
    activateStudentCard,
    deactivateStudentCard,
    logActivity,
    getStudentCard,
    getActivityLogs
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
