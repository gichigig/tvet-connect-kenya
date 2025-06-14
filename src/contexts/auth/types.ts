
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'student' | 'lecturer' | 'registrar' | 'hod';
  approved: boolean;
  blocked?: boolean;
  department?: string;
  course?: string;
  year?: number;
  semester?: number;
  level?: string;
  intake?: string;
  phone?: string;
  admissionNumber?: string;
  guardians?: Guardian[];
}

export interface Guardian {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface PendingUnitRegistration {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  course: string;
  year: number;
  semester: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  unitCode: string;
  unitName: string;
  examType: string;
  score: number;
  maxScore: number;
  grade: string;
  semester: number;
  year: number;
  examDate: string;
  lecturerName: string;
  status: 'pass' | 'fail';
}

export interface CreatedContent {
  id: string;
  type: 'assignment' | 'notes' | 'exam' | 'cat' | 'online_class';
  title: string;
  description?: string;
  lecturerId: string;
  unitId: string;
  unitName: string;
  unitCode: string;
  isVisible: boolean;
  isAccessible?: boolean;
  createdAt: string;
  scheduledDate?: string;
  duration?: number;
  venue?: string;
  status?: string;
  questions?: any[];
  totalMarks?: number;
  link?: string;
  fileUrl?: string;
  allowedFormats?: string[];
  submissionInstructions?: string;
  submissionType?: 'file' | 'multiple_choice';
  requiresHODApproval?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
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
  createdUnits: import('@/types/unitManagement').Unit[];
  addCreatedUnit: (unit: import('@/types/unitManagement').Unit) => void;
  updateCreatedUnit: (unitId: string, updates: Partial<import('@/types/unitManagement').Unit>) => void;
  deleteCreatedUnit: (unitId: string) => void;
  getAvailableUnits: (course?: string, year?: number) => import('@/types/unitManagement').Unit[];
  createdContent: CreatedContent[];
  addCreatedContent: (content: CreatedContent) => void;
  updateCreatedContent: (contentId: string, updates: Partial<CreatedContent>) => void;
  deleteCreatedContent: (contentId: string) => void;
}
