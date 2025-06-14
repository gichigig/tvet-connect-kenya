import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  PendingUnitRegistration, 
  ExamResult, 
  AuthContextType,
  CreatedContent,
  SupplyRequest,
  StudentFee,
  FeeStructure,
  PaymentRecord,
  ClearanceForm
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
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [clearanceForms, setClearanceForms] = useState<ClearanceForm[]>([]);

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

  const addSupplyRequest = (request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>) => {
    const newRequest: SupplyRequest = {
      ...request,
      id: Date.now().toString(),
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setSupplyRequests(prev => [...prev, newRequest]);
  };

  const updateSupplyRequestStatus = (requestId: string, status: SupplyRequest['status'], verificationNotes?: string) => {
    setSupplyRequests(prev =>
      prev.map(request =>
        request.id === requestId 
          ? { 
              ...request, 
              status, 
              verifiedBy: user?.id,
              verificationDate: new Date().toISOString().split('T')[0],
              verificationNotes 
            }
          : request
      )
    );
  };

  const addStudentFee = (fee: Omit<StudentFee, 'id' | 'createdDate' | 'status'>) => {
    const newFee: StudentFee = {
      ...fee,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      invoiceNumber: `INV-${Date.now()}`
    };
    setStudentFees(prev => [...prev, newFee]);
  };

  const updateFeeStatus = (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => {
    setStudentFees(prev =>
      prev.map(fee =>
        fee.id === feeId 
          ? { 
              ...fee, 
              status, 
              paidDate,
              paidAmount,
              paymentMethod: paymentMethod as any,
              receiptNumber
            }
          : fee
      )
    );

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

  const addFeeStructure = (structure: Omit<FeeStructure, 'id' | 'createdDate'>) => {
    const newStructure: FeeStructure = {
      ...structure,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0]
    };
    setFeeStructures(prev => [...prev, newStructure]);
  };

  const updateFeeStructure = (structureId: string, updates: Partial<FeeStructure>) => {
    setFeeStructures(prev => prev.map(structure => 
      structure.id === structureId ? { ...structure, ...updates } : structure
    ));
  };

  const addPaymentRecord = (payment: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...payment,
      id: Date.now().toString()
    };
    setPaymentRecords(prev => [...prev, newPayment]);
  };

  const addClearanceForm = (clearance: Omit<ClearanceForm, 'id'>) => {
    const newClearance: ClearanceForm = {
      ...clearance,
      id: Date.now().toString()
    };
    setClearanceForms(prev => [...prev, newClearance]);
  };

  const updateClearanceStatus = (clearanceId: string, status: ClearanceForm['status'], clearedBy?: string, remarks?: string) => {
    setClearanceForms(prev =>
      prev.map(clearance =>
        clearance.id === clearanceId 
          ? { 
              ...clearance, 
              status, 
              clearedBy,
              clearanceDate: status === 'cleared' ? new Date().toISOString().split('T')[0] : undefined,
              remarks 
            }
          : clearance
      )
    );
  };

  const generateInvoice = (studentId: string, academicYear: string, semester: number) => {
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    const feeStructure = feeStructures.find(
      fs => fs.course === student.course && 
            fs.year === student.year && 
            fs.semester === semester &&
            fs.academicYear === academicYear &&
            fs.isActive
    );

    if (feeStructure) {
      // Create tuition fee
      addStudentFee({
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        feeType: 'tuition',
        amount: feeStructure.tuitionFee,
        description: 'Tuition Fee',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        academicYear,
        semester,
        isRecurring: true
      });

      // Create other fees
      const otherFees = [
        { type: 'exam' as const, amount: feeStructure.examFee, description: 'Examination Fee' },
        { type: 'library' as const, amount: feeStructure.libraryFee, description: 'Library Fee' },
        { type: 'lab' as const, amount: feeStructure.labFee, description: 'Laboratory Fee' },
        { type: 'activity' as const, amount: feeStructure.activityFee, description: 'Activity Fee' },
        { type: 'medical' as const, amount: feeStructure.medicalFee, description: 'Medical Fee' }
      ];

      otherFees.forEach(fee => {
        if (fee.amount > 0) {
          addStudentFee({
            studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            feeType: fee.type,
            amount: fee.amount,
            description: fee.description,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            academicYear,
            semester
          });
        }
      });
    }
  };

  const updateStudentFinancialStatus = (studentId: string, status: User['financialStatus'], totalOwed?: number) => {
    setUsers(prev => prev.map(user => 
      user.id === studentId 
        ? { ...user, financialStatus: status, totalFeesOwed: totalOwed }
        : user
    ));
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
    updateFeeStatus,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export types for convenience
export type { User, PendingUnitRegistration, ExamResult, Guardian } from './auth/types';
