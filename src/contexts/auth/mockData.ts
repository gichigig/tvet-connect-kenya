
import { User, PendingUnitRegistration, ExamResult, StudentCard, ActivityLog } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Admin',
    email: 'admin@tvet.edu',
    role: 'admin',
    approved: true,
    blocked: false
  },
  // ADMIN USER for billyblun17@gmail.com
  {
    id: '8',
    firstName: 'Billy',
    lastName: 'Blund',
    email: 'billyblun17@gmail.com',
    role: 'admin',
    approved: true,
    blocked: false
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'finance@tvet.edu',
    role: 'finance',
    approved: true,
    blocked: false
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'hod@tvet.edu',
    role: 'hod',
    approved: true,
    blocked: false,
    department: 'Computer Science'
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'registrar@tvet.edu',
    role: 'registrar',
    approved: true,
    blocked: false
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'lecturer@tvet.edu',
    role: 'lecturer',
    approved: true,
    blocked: false,
    department: 'Computer Science'
  },
  {
    id: '6',
    firstName: 'Alice',
    lastName: 'Student',
    email: 'student@tvet.edu',
    role: 'student',
    approved: true,
    blocked: false,
    course: 'Computer Science',
    level: 'diploma',
    year: 2,
    semester: 1,
    admissionNumber: 'CS2023001',
    intake: 'September 2023',
    phone: '+254700000001'
  },
  {
    id: '7',
    firstName: 'Grace',
    lastName: 'Finance',
    email: 'grace.finance@tvet.edu',
    role: 'finance',
    approved: true,
    blocked: false
  }
];

export const mockPendingUnitRegistrations: PendingUnitRegistration[] = [
  {
    id: '1',
    studentId: '6',
    studentName: 'Alice Student',
    studentEmail: 'student@tvet.edu',
    unitId: 'cs201',
    unitCode: 'CS201',
    unitName: 'Data Structures',
    course: 'Computer Science',
    year: 2,
    semester: 1,
    status: 'pending',
    submittedDate: '2024-01-15'
  }
];

export const mockExamResults: ExamResult[] = [
  {
    id: '1',
    studentId: '6',
    studentName: 'Alice Student',
    unitCode: 'CS201',
    unitName: 'Data Structures',
    examType: 'Final Exam',
    score: 80,
    maxScore: 100,
    grade: 'A',
    semester: 1,
    year: 2,
    examDate: '2024-01-20',
    lecturerName: 'David Brown',
    status: 'pass'
  }
];

export const mockStudentCards: StudentCard[] = [
  {
    id: '1',
    studentId: '6',
    studentName: 'Alice Student',
    admissionNumber: 'CS2023001',
    course: 'Computer Science',
    year: 2,
    semester: 1,
    academicYear: '2024/2025',
    isActive: true,
    activatedBy: '2',
    activatedDate: '2024-01-10',
    status: 'active',
    createdDate: '2024-01-10'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Sarah Johnson',
    userRole: 'finance',
    action: 'Activate Student Card',
    details: 'Activated student card for Alice Student',
    targetStudentId: '6',
    targetStudentName: 'Alice Student',
    timestamp: '2024-01-10T10:30:00Z',
    department: 'finance'
  }
];
