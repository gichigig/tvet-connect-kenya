export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  level: 'certificate' | 'diploma' | 'higher_diploma' | 'degree';
  duration: number; // in years or months
  durationType: 'months' | 'years';
  mode: 'full_time' | 'part_time' | 'evening' | 'distance_learning';
  totalCredits: number;
  units: string[]; // Array of unit IDs
  lecturerIds: string[]; // Array of assigned lecturer IDs
  hodId?: string; // HOD who oversees this course
  feeStructureId?: string; // Associated fee structure
  studentsEnrolled: number;
  maxCapacity: number;
  isActive: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'inactive';
  createdAt: string;
  createdBy: string; // Registrar ID
  approvedAt?: string;
  approvedBy?: string; // HOD ID
  semester: number;
  academicYear: string;
  entryRequirements: string[];
  learningOutcomes: string[];
  // Optional fields for extended course information
  applicationDeadline?: string;
  startDate?: string;
}

export interface CourseUnit {
  id: string;
  courseId: string;
  unitId: string;
  semester: number;
  year: number;
  isCore: boolean; // Core or elective unit
  prerequisites: string[]; // Array of unit IDs that must be completed first
}

export interface FeeStructure {
  id: string;
  courseId: string;
  courseName: string;
  academicYear: string;
  totalFees: number;
  breakdown: {
    tuitionFees: number;
    examFees: number;
    labFees: number;
    libraryFees: number;
    registrationFees: number;
    otherFees: number;
  };
  paymentSchedule: {
    semester: number;
    amount: number;
    dueDate: string;
  }[];
  isActive: boolean;
  createdAt: string;
  createdBy: string; // Finance officer ID
}
