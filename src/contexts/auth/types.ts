
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'student' | 'lecturer' | 'registrar' | 'hod' | 'finance';
  approved: boolean;
  blocked?: boolean;
  password?: string;
  /** Department (see allDepartments in zetechCourses.ts) */
  department?: string;
  /** Course (see allCourses in zetechCourses.ts) */
  course?: string;
  year?: number;
  semester?: string;
  level?: string;
  intake?: string;
  phone?: string;
  admissionNumber?: string;
  guardians?: Guardian[];
  financialStatus?: 'cleared' | 'defaulter' | 'partial';
  totalFeesOwed?: number;
  profilePicture?: string;
  
  // Extended student properties
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  county?: string;
  subcounty?: string;
  ward?: string;
  postalAddress?: string;
  postalCode?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  guardianAddress?: string;
  courseId?: string;
  courseName?: string;
  academicYear?: string;
  previousEducation?: string;
  previousGrade?: string;
  createdAt?: string;
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

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  unitCode: string;
  unitName: string;
  semester: number;
  year: number;
  lecturerId: string;
  lecturerName: string;
  
  // Assessment scores
  cat1Score: number | null;
  cat1MaxScore: number;
  cat2Score: number | null;
  cat2MaxScore: number;
  assignmentScore: number | null;
  assignmentMaxScore: number;
  examScore: number | null;
  examMaxScore: number;
  
  // Calculated totals
  totalScore: number;
  totalMaxScore: number;
  percentage: number;
  grade: string;
  
  // Status tracking
  submittedBy: string; // lecturer who submitted
  submittedDate: string;
  hodApproval: 'pending' | 'approved' | 'rejected';
  hodApprovedBy?: string;
  hodApprovedDate?: string;
  hodComments?: string;
  
  status: 'pass' | 'fail' | 'incomplete';
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
  assignmentType?: string;
  dueDate?: string;
  questionFileName?: string;
  acceptedFormats?: string[];
  fileName?: string;
  topic?: string;
}

export interface SupplyRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  department: string;
  items: SupplyItem[];
  totalAmount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  verifiedBy?: string;
  verificationDate?: string;
  verificationNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  description?: string;
}

export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  feeType: 'tuition' | 'supplementary_exam' | 'special_exam' | 'unit_retake' | 'library' | 'lab' | 'caution' | 'exam' | 'activity' | 'medical' | 'graduation';
  amount: number;
  unitCode?: string;
  unitName?: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  createdDate: string;
  paidDate?: string;
  paidAmount?: number;
  academicYear: string;
  semester: number;
  invoiceNumber?: string;
  receiptNumber?: string;
  paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
  isRecurring?: boolean;
}

export interface FeeStructure {
  id: string;
  course: string;
  year: number;
  semester: number;
  academicYear: string;
  tuitionFee: number;
  examFee: number;
  libraryFee: number;
  labFee: number;
  cautionMoney: number;
  activityFee: number;
  medicalFee: number;
  totalFee: number;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  feeId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
  referenceNumber: string;
  receiptNumber: string;
  processedBy: string;
  notes?: string;
}

export interface ClearanceForm {
  id: string;
  studentId: string;
  studentName: string;
  academicYear: string;
  semester: number;
  requestDate: string;
  status: 'pending' | 'cleared' | 'blocked';
  totalFeesOwed: number;
  totalFeesPaid: number;
  outstandingBalance: number;
  clearedBy?: string;
  clearanceDate?: string;
  remarks?: string;
}

export interface StudentCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  course: string;
  year: number;
  semester: number;
  academicYear: string;
  isActive: boolean;
  activatedBy?: string;
  activatedDate?: string;
  deactivatedBy?: string;
  deactivatedDate?: string;
  status: 'active' | 'inactive';
  createdDate: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  targetStudentId?: string;
  targetStudentName?: string;
  timestamp: string;
  ipAddress?: string;
  department: 'finance' | 'admin' | 'registrar' | 'hod' | 'lecturer';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
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
  supplyRequests: SupplyRequest[];
  addSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>) => void;
  updateSupplyRequestStatus: (requestId: string, status: SupplyRequest['status'], verificationNotes?: string) => void;
  studentFees: StudentFee[];
  addStudentFee: (fee: Omit<StudentFee, 'id' | 'createdDate' | 'status'>) => void;
  updateFeeStatus: (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => void;
  feeStructures: FeeStructure[];
  addFeeStructure: (structure: Omit<FeeStructure, 'id' | 'createdDate'>) => void;
  updateFeeStructure: (structureId: string, updates: Partial<FeeStructure>) => void;
  paymentRecords: PaymentRecord[];
  addPaymentRecord: (payment: Omit<PaymentRecord, 'id'>) => void;
  clearanceForms: ClearanceForm[];
  addClearanceForm: (clearance: Omit<ClearanceForm, 'id'>) => void;
  updateClearanceStatus: (clearanceId: string, status: ClearanceForm['status'], clearedBy?: string, remarks?: string) => void;
  generateInvoice: (studentId: string, academicYear: string, semester: number) => void;
  updateStudentFinancialStatus: (studentId: string, status: User['financialStatus'], totalOwed?: number) => void;
  studentCards: StudentCard[];
  activateStudentCard: (studentId: string, activatedBy: string) => void;
  deactivateStudentCard: (studentId: string, deactivatedBy: string) => void;
  getStudentCard: (studentId: string) => StudentCard | undefined;
  getActivityLogs: (department?: string) => ActivityLog[];
}
