
import { User, PendingUnitRegistration, ExamResult } from './types';

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
    admissionNumber: 'CS2023001',
    course: 'Computer Science',
    year: 2,
    semester: 1,
    units: [
      { code: 'CS201', name: 'Data Structures', credits: 3 },
      { code: 'CS202', name: 'Database Systems', credits: 3 },
      { code: 'CS203', name: 'Web Development', credits: 4 }
    ],
    submittedDate: '2024-01-15',
    status: 'pending'
  }
];

export const mockExamResults: ExamResult[] = [
  {
    id: '1',
    studentId: '6',
    studentName: 'Alice Student',
    admissionNumber: 'CS2023001',
    course: 'Computer Science',
    year: 2,
    semester: 1,
    unitCode: 'CS201',
    unitName: 'Data Structures',
    catScore: 15,
    examScore: 65,
    totalScore: 80,
    grade: 'A',
    academicYear: '2023/2024',
    examDate: '2024-01-20'
  }
];
