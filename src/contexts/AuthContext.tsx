
import React, { createContext, useState, useContext } from 'react';
import { User, AuthContextType } from './auth/types';
import { getPendingUsers } from './auth/authUtils';
import { useAuthHelpers } from './auth/AuthHelpers';
import { UsersProvider, useUsers } from './users/UsersContext';
import { UnitsProvider, useUnits } from './units/UnitsContext';
import { FinanceProvider, useFinance } from './finance/FinanceContext';

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { login: loginHelper, signup: signupHelper, logout: logoutHelper } = useAuthHelpers();
  
  // Use the separated contexts
  const {
    users,
    setUsers,
    pendingUnitRegistrations,
    examResults,
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
  } = useUsers();

  const {
    createdUnits,
    createdContent,
    addCreatedUnit,
    updateCreatedUnit,
    deleteCreatedUnit,
    getAvailableUnits,
    addCreatedContent,
    updateCreatedContent,
    deleteCreatedContent
  } = useUnits();

  const {
    supplyRequests,
    studentFees,
    feeStructures,
    paymentRecords,
    clearanceForms,
    addSupplyRequest,
    updateSupplyRequestStatus,
    addStudentFee,
    updateFeeStatus,
    addFeeStructure,
    updateFeeStructure,
    addPaymentRecord,
    addClearanceForm,
    updateClearanceStatus,
    generateInvoice: generateInvoiceFromFinance
  } = useFinance();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string, role?: string) => {
    return loginHelper(email, password, role, users, setUser);
  };

  const signup = async (userData: any) => {
    return signupHelper(userData, setUsers, setUser);
  };

  const logout = async () => {
    return logoutHelper(setUser);
  };

  const generateInvoice = (studentId: string, academicYear: string, semester: number) => {
    return generateInvoiceFromFinance(studentId, academicYear, semester, users, updateStudentFinancialStatus);
  };

  // Handle fee status updates with financial status updates
  const updateFeeStatusWithFinancialUpdate = (feeId: string, status: any, paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => {
    updateFeeStatus(feeId, status, paidDate, paidAmount, paymentMethod, receiptNumber);

    // Update student financial status
    const fee = studentFees.find(f => f.id === feeId);
    if (fee && status === 'paid') {
      const studentTotalOwed = studentFees
        .filter(f => f.studentId === fee.studentId && f.status !== 'paid')
        .reduce((sum, f) => sum + f.amount, 0);
      
      updateStudentFinancialStatus(
        fee.studentId, 
        studentTotalOwed > 0 ? 'partial' : 'cleared',
        studentTotalOwed
      );
    }
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
    deleteCreatedContent,
    supplyRequests,
    addSupplyRequest,
    updateSupplyRequestStatus,
    studentFees,
    addStudentFee,
    updateFeeStatus: updateFeeStatusWithFinancialUpdate,
    feeStructures,
    addFeeStructure,
    updateFeeStructure,
    paymentRecords,
    addPaymentRecord,
    clearanceForms,
    addClearanceForm,
    updateClearanceStatus,
    generateInvoice,
    updateStudentFinancialStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UsersProvider>
      <UnitsProvider>
        <FinanceProvider>
          <AuthProviderInner>
            {children}
          </AuthProviderInner>
        </FinanceProvider>
      </UnitsProvider>
    </UsersProvider>
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
