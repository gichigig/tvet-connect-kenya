// Grade Vault System Types for TVET Connect Kenya

export interface GradeVaultResult {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNumber: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  lecturerId: string;
  lecturerName: string;
  semester: string;
  year: number;
  marks: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'I' | '*' | '#';
  assessmentType: 'exam' | 'cat' | 'assignment' | 'practical';
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  feedback?: string;
  canEdit: boolean;
  submittedAt: Date;
  updatedAt: Date;
}

export interface GradeVaultStudent {
  id: string;
  name: string;
  regNumber: string;
  course: string;
  year: number;
  semester: string;
  gpa: number;
  totalUnits: number;
  approvedUnits: number;
  pendingUnits: number;
}

export interface GradeVaultFilters {
  search: string;
  semester: string;
  year: number | null;
  status: 'all' | 'pending' | 'approved' | 'rejected';
  lecturer: string;
  unit: string;
  course: string;
}

export interface GradeVaultStats {
  totalResults: number;
  pendingApproval: number;
  approvedResults: number;
  rejectedResults: number;
  averageGPA: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    I: number;
    missing: number;
    retake: number;
  };
}

export interface GradeCalculation {
  marks: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'I' | '*' | '#';
  points: number;
  status: 'pass' | 'fail' | 'incomplete' | 'missing' | 'retake';
}

export interface HODPermission {
  lecturerId: string;
  lecturerName: string;
  canEdit: boolean;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface BulkAction {
  action: 'approve' | 'reject' | 'edit';
  resultIds: string[];
  reason?: string;
  newMarks?: { [resultId: string]: number };
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeFields: string[];
  filters?: Partial<GradeVaultFilters>;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// TVET Grading Scale Constants
export const TVET_GRADING_SCALE = {
  A: { min: 70, max: 100, points: 4.0, status: 'pass' },
  B: { min: 60, max: 69, points: 3.0, status: 'pass' },
  C: { min: 50, max: 59, points: 2.0, status: 'pass' },
  D: { min: 40, max: 49, points: 1.0, status: 'pass' },
  E: { min: 0, max: 39, points: 0.0, status: 'fail' },
  I: { min: 0, max: 0, points: 0.0, status: 'incomplete' }, // Incomplete
  '*': { min: 0, max: 0, points: 0.0, status: 'missing' },   // Missing/No score
  '#': { min: 0, max: 0, points: 0.0, status: 'retake' }     // Retake required
} as const;

export type TVETGrade = keyof typeof TVET_GRADING_SCALE;

// Context Types
export interface GradeVaultContextType {
  // State
  results: GradeVaultResult[];
  students: GradeVaultStudent[];
  stats: GradeVaultStats;
  loading: boolean;
  error: string | null;

  // Student Functions
  getStudentResults: (studentId: string) => Promise<GradeVaultResult[]>;
  searchStudentResults: (studentId: string, searchTerm: string) => Promise<GradeVaultResult[]>;
  calculateGPA: (results: GradeVaultResult[]) => number;
  exportStudentResults: (studentId: string, options?: ExportOptions) => Promise<void>;

  // HOD Functions
  getPendingResults: () => Promise<GradeVaultResult[]>;
  approveResult: (resultId: string) => Promise<void>;
  rejectResult: (resultId: string, reason: string) => Promise<void>;
  bulkApproveResults: (resultIds: string[]) => Promise<void>;
  bulkRejectResults: (resultIds: string[], reason: string) => Promise<void>;
  editResult: (resultId: string, newMarks: number) => Promise<void>;
  
  // Permission Management
  grantEditPermission: (lecturerId: string) => Promise<void>;
  revokeEditPermission: (lecturerId: string) => Promise<void>;
  checkEditPermission: (lecturerId: string) => Promise<boolean>;

  // Search and Filter
  searchResults: (filters: Partial<GradeVaultFilters>) => Promise<GradeVaultResult[]>;
  getStatistics: () => Promise<GradeVaultStats>;

  // Grade Calculation Utilities
  calculateGrade: (marks: number) => GradeCalculation;
  validateGradeEntry: (marks: number, assessmentType: string) => boolean;
}

export default GradeVaultResult;