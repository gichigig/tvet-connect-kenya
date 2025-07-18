import React, { createContext, useState, useContext } from 'react';
import { User, SupplyRequest, StudentFee, ClearanceForm, PendingUnitRegistration, ActivityLog, StudentCard, FeeStructure } from './auth/types';
import { getPendingUsers } from './auth/authUtils';
import { useAuthHelpers } from './auth/AuthHelpers';
import { UsersProvider, useUsers } from './users/UsersContext';
import { UnitsProvider, useUnits } from './units/UnitsContext';
import { FinanceProvider, useFinance } from './finance/FinanceContext';
import { Unit } from '@/types/unitManagement';

export interface AuthContextType {
  user: User | null;
  supplyRequests: SupplyRequest[]; // <-- Add this line
  studentFees: StudentFee[];
  updateFeeStatus: (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => void;
  login: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
  getPendingUsers: () => User[];
  getAllUsers: () => User[];
  getActivityLogs: () => ActivityLog[];
  createdUnits: Unit[];
  addCreatedUnit: (unit: Unit) => void;
  updateCreatedUnit: (unitId: string, updates: Partial<Unit>) => void;
  deleteCreatedUnit: (unitId: string) => void;
  addStudentFee: (fee: any) => void; // Replace 'any' with actual type
  clearanceForms: ClearanceForm  []; // Placeholder for clearance forms, replace with actual type
  approveUser: (userId: string) => void;
  approveStudent: (userId: string) => void;
  rejectUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  feeStructures:any[];
  addFeeStructure: (feeStructure: any) => void;
  updateFeeStructure: (id: string, updates: any) => void; // Replace 'any' with actual type
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateProfilePicture?: (file: File) => Promise<void>;
  createdContent: any[]; // Placeholder for created content, replace 'any' with actual type when available
  profilePicture?: string;
  updateUserApproval: (userId: string, approved: boolean) => void;
  changePassword?: (userId: string, newPassword: string) => Promise<void>;
  getPendingUnitRegistrations?: () => PendingUnitRegistration[]; // <-- Add this line if needed
  pendingUnitRegistrations: PendingUnitRegistration[];
  getStudentCard: (studentId: string) => StudentCard | undefined;
  getAvailableUnits: (course: string, year: number, semester: number) => Unit[];
addPendingUnitRegistration: (registration: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    unitId: string;
    unitCode: string;
    unitName: string;
    course: string;
    year: number;
    semester: number;
}) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { login: loginHelper, signup: signupHelper, logout: logoutHelper } = useAuthHelpers();
  // Use the separated contexts
  const {
    users,
    setUsers,
    updateUserApproval,
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getAllUsers,
    pendingUnitRegistrations,
  } = useUsers();

  // Stub for updateProfilePicture (implement as needed)
  const updateProfilePicture = async (file: File) => {
    // TODO: Implement backend upload logic
    return Promise.resolve();
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const login = async (email: string, password: string, role?: string) => {
    return loginHelper(email, password, role, users, setUser);
  };
  const logout = async () => {
    return logoutHelper(setUser);
  };

  // Dummy studentCards array; replace with actual data source or context as needed
  const [studentCards] = useState<StudentCard[]>([]);

  // Dummy implementation for getStudentCard; replace with real logic as needed
  const getStudentCard = (studentId: string) => {
    // TODO: Implement actual logic to retrieve a student card
    return studentCards.find(card => card.studentId === studentId);
  };

  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  const getAvailableUnits = (course: string, year: number, semester: number) => {
    // TODO: Implement actual logic to fetch available units
    return availableUnits.filter(unit => 
      unit.course === course && 
      unit.year === year && 
      unit.semester === semester
    );
  };

  const addPendingUnitRegistration = (registration: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    unitId: string;
    unitCode: string;
    unitName: string;
    course: string;
    year: number;
    semester: number;
  }) => {
    // TODO: Implement actual logic to add pending registration
  };

  const [createdUnits, setCreatedUnits] = useState<Unit[]>([]);

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

  const value: AuthContextType = {
    user,
    login,
    logout,
    users,
    setUsers,
    updateUserApproval,
    addCreatedUnit,
    updateCreatedUnit,
    deleteCreatedUnit,
    updateFeeStatus: (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => {
      // TODO: Implement fee status update logic
    },
    getAvailableUnits,
    addPendingUnitRegistration,
    addStudentFee: (fee: any) => {
      // TODO: Implement addStudentFee logic
    },
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getPendingUsers: () => getPendingUsers(users),
    getAllUsers,
    getActivityLogs: () => {
      // TODO: Implement getActivityLogs logic
      return [];
    },
    updateProfilePicture,
    pendingUnitRegistrations,
    supplyRequests: [], // Provide default empty array or fetch from context if available
    studentFees: [], // Provide default empty array or fetch from context if available
    clearanceForms: [],
    isAdmin: !!user && user.role === 'admin',
    isAuthenticated: !!user,
    feeStructures: [],
    addFeeStructure: (feeStructure: any) => {
      // TODO: Implement addFeeStructure logic
    },
    updateFeeStructure: (id: string, updates: any) => {
      // TODO: Implement updateFeeStructure logic
    },
    // Provide mock units and content for lecturers for dashboard demo
    createdUnits,
    createdContent: user?.role === 'lecturer' ? [
      {
        id: 'exam1',
        type: 'exam',
        title: 'Midterm Exam',
        lecturerId: user?.id,
        unitId: 'unit1',
        unitName: 'Introduction to Computer Science',
        unitCode: 'CS101',
        isVisible: true,
        createdAt: '2025-02-01',
        scheduledDate: '2025-07-20T10:00:00',
        duration: 90,
        venue: 'Room 101',
        status: 'approved',
        questions: [],
        totalMarks: 100,
      },
      {
        id: 'cat1',
        type: 'cat',
        title: 'CAT 1',
        lecturerId: user?.id,
        unitId: 'unit2',
        unitName: 'Data Structures',
        unitCode: 'CS201',
        isVisible: true,
        createdAt: '2025-02-10',
        scheduledDate: '2025-07-25T14:00:00',
        duration: 60,
        venue: 'Room 202',
        status: 'approved',
        questions: [],
        totalMarks: 50,
      },
    ] : [],
    getStudentCard,
    getPendingUnitRegistrations,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export interface AdditionalAuthContextProps {
  user: User | null;
  pendingUnitRegistrations: any[];
  getAvailableUnits: (course: string, year: number, semester: number) => any[];
  addPendingUnitRegistration: (registration: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    unitId: string;
    unitCode: string;
    unitName: string;
    course: string;
    year: number;
    semester: number;
  }) => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UsersProvider>
    <UnitsProvider>
      <FinanceProvider>
        <AuthProviderInner>{children}</AuthProviderInner>
      </FinanceProvider>
    </UnitsProvider>
  </UsersProvider>
);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export types for convenience
export type { User, PendingUnitRegistration, ExamResult, Guardian } from './auth/types';
