// Auth types definitions

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  departmentId?: string;
  financialStatus?: 'paid' | 'pending' | 'overdue';
  isActive?: boolean;
}

export interface StudentFee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  type: string;
  studentName?: string;
  academicYear?: string;
  semester?: string;
  feeType?: string;
  unitCode?: string;
  unitName?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  paidAmount?: number;
  paidDate?: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  status: string;
}