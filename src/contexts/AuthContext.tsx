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
  supplyRequests: SupplyRequest[];
  studentFees: StudentFee[];
  updateFeeStatus: (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => void;
  login: (email: string, password: string, role?: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
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
  addStudentFee: (fee: any) => void;
  clearanceForms: ClearanceForm[];
  approveUser: (userId: string) => void;
  approveStudent: (userId: string) => void;
  rejectUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  feeStructures: any[];
  addFeeStructure: (feeStructure: any) => void;
  updateFeeStructure: (id: string, updates: any) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateProfilePicture?: (file: File) => Promise<void>;
  createdContent: any[];
  addCreatedContent: (content: any) => void;
  profilePicture?: string;
  updateUserApproval: (userId: string, approved: boolean) => void;
  changePassword?: (userId: string, newPassword: string) => Promise<void>;
  getPendingUnitRegistrations?: () => PendingUnitRegistration[];
  updateUnitRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => void;
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
  // Additional properties to fix errors
  examResults: any[];
  addExamResult: (result: any) => void;
  sendResultsNotification: (resultIds: string[], sendToGuardians: boolean) => Promise<void>;
  paymentRecords: any[];
  addPaymentRecord: (payment: any) => void;
  generateInvoice: (studentId: string, academicYear: string, semester: number) => void;
  updateStudentFinancialStatus: (studentId: string, status: any, totalOwed?: number) => void;
  studentCards: StudentCard[];
  activateStudentCard: (studentId: string, activatedBy: string) => void;
  deactivateStudentCard: (studentId: string, deactivatedBy: string) => void;
  addClearanceForm: (clearance: any) => void;
  updateClearanceStatus: (clearanceId: string, status: any, clearedBy?: string, remarks?: string) => void;
  updateSupplyRequestStatus: (requestId: string, status: any, verificationNotes?: string) => void;
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

  const [profilePicture, setProfilePicture] = useState<string | undefined>(user?.profilePicture);

  const updateProfilePicture = async (file: File) => {
    try {
      // Create a temporary URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setProfilePicture(imageUrl);
      
      // Update user object if needed
      if (user) {
        setUser(prev => prev ? { ...prev, profilePicture: imageUrl } : null);
      }
      
      return Promise.resolve();
    } catch (error) {
      throw new Error('Failed to upload profile picture');
    }
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const login = async (email: string, password: string, role?: string) => {
    return loginHelper(email, password, role, users, setUser);
  };
  
  const signup = async (userData: any) => {
    return signupHelper(userData, setUsers, setUser);
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
    signup,
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
    profilePicture,
    pendingUnitRegistrations,
    supplyRequests: [],
    studentFees: [],
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
    updateUnitRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => {
      // TODO: Implement updateUnitRegistrationStatus logic
    },
    examResults: [],
    addExamResult: (result: any) => {
      // TODO: Implement addExamResult logic
    },
    sendResultsNotification: async (resultIds: string[], sendToGuardians: boolean) => {
      // TODO: Implement sendResultsNotification logic
    },
    paymentRecords: [],
    addPaymentRecord: (payment: any) => {
      // TODO: Implement addPaymentRecord logic
    },
    generateInvoice: (studentId: string, academicYear: string, semester: number) => {
      // TODO: Implement generateInvoice logic
    },
    updateStudentFinancialStatus: (studentId: string, status: any, totalOwed?: number) => {
      // TODO: Implement updateStudentFinancialStatus logic
    },
    studentCards: [],
    activateStudentCard: (studentId: string, activatedBy: string) => {
      // TODO: Implement activateStudentCard logic
    },
    deactivateStudentCard: (studentId: string, deactivatedBy: string) => {
      // TODO: Implement deactivateStudentCard logic
    },
    addCreatedContent: (content: any) => {
      // TODO: Implement addCreatedContent logic
    },
    addClearanceForm: (clearance: any) => {
      // TODO: Implement addClearanceForm logic
    },
    updateClearanceStatus: (clearanceId: string, status: any, clearedBy?: string, remarks?: string) => {
      // TODO: Implement updateClearanceStatus logic
    },
    updateSupplyRequestStatus: (requestId: string, status: any, verificationNotes?: string) => {
      // TODO: Implement updateSupplyRequestStatus logic
    },
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
