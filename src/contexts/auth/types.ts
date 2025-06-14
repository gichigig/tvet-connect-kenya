
export interface PendingUnitRegistration {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  unitCode: string;
  unitName: string;
  course: string;
  year: number;
  semester: number;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  approved: boolean;
  blocked?: boolean;
  course?: string;
  level?: string;
  year?: number;
  semester?: number;
  admissionNumber?: string;
  department?: string;
  intake?: string;
  guardians?: Guardian[];
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  unitCode: string;
  unitName: string;
  examType: 'cat' | 'exam';
  score: number;
  maxScore: number;
  grade: string;
  status: 'pass' | 'fail';
  examDate: string;
  semester: number;
  year: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserApproval: (userId: string, approved: boolean) => void;
  approveUser: (userId: string) => void;
  approveStudent: (userId: string) => void;
  rejectUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  getPendingUsers: () => User[];
  getAllUsers: () => User[];
  pendingUnitRegistrations: PendingUnitRegistration[];
  addPendingUnitRegistration: (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => void;
  updateUnitRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => void;
  getPendingUnitRegistrations: () => PendingUnitRegistration[];
  examResults: ExamResult[];
  addExamResult: (result: Omit<ExamResult, 'id'>) => void;
  sendResultsNotification: (resultIds: string[], sendToGuardians: boolean) => Promise<void>;
}
