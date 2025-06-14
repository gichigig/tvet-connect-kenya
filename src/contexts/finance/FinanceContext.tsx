
import React, { createContext, useState, useContext } from 'react';
import { 
  SupplyRequest, 
  StudentFee, 
  FeeStructure, 
  PaymentRecord, 
  ClearanceForm,
  User
} from '../auth/types';

interface FinanceContextType {
  supplyRequests: SupplyRequest[];
  setSupplyRequests: React.Dispatch<React.SetStateAction<SupplyRequest[]>>;
  studentFees: StudentFee[];
  setStudentFees: React.Dispatch<React.SetStateAction<StudentFee[]>>;
  feeStructures: FeeStructure[];
  setFeeStructures: React.Dispatch<React.SetStateAction<FeeStructure[]>>;
  paymentRecords: PaymentRecord[];
  setPaymentRecords: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  clearanceForms: ClearanceForm[];
  setClearanceForms: React.Dispatch<React.SetStateAction<ClearanceForm[]>>;
  addSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>) => void;
  updateSupplyRequestStatus: (requestId: string, status: SupplyRequest['status'], verificationNotes?: string) => void;
  addStudentFee: (fee: Omit<StudentFee, 'id' | 'createdDate' | 'status'>) => void;
  updateFeeStatus: (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => void;
  addFeeStructure: (structure: Omit<FeeStructure, 'id' | 'createdDate'>) => void;
  updateFeeStructure: (structureId: string, updates: Partial<FeeStructure>) => void;
  addPaymentRecord: (payment: Omit<PaymentRecord, 'id'>) => void;
  addClearanceForm: (clearance: Omit<ClearanceForm, 'id'>) => void;
  updateClearanceStatus: (clearanceId: string, status: ClearanceForm['status'], clearedBy?: string, remarks?: string) => void;
  generateInvoice: (studentId: string, academicYear: string, semester: number, users: User[], updateStudentFinancialStatus: (studentId: string, status: User['financialStatus'], totalOwed?: number) => void) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [clearanceForms, setClearanceForms] = useState<ClearanceForm[]>([]);

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
              verifiedBy: 'current-user-id', // This would be the current user ID
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

  const generateInvoice = (studentId: string, academicYear: string, semester: number, users: User[], updateStudentFinancialStatus: (studentId: string, status: User['financialStatus'], totalOwed?: number) => void) => {
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

  const value = {
    supplyRequests,
    setSupplyRequests,
    studentFees,
    setStudentFees,
    feeStructures,
    setFeeStructures,
    paymentRecords,
    setPaymentRecords,
    clearanceForms,
    setClearanceForms,
    addSupplyRequest,
    updateSupplyRequestStatus,
    addStudentFee,
    updateFeeStatus,
    addFeeStructure,
    updateFeeStructure,
    addPaymentRecord,
    addClearanceForm,
    updateClearanceStatus,
    generateInvoice
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
