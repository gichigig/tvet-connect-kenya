
import { User, PendingUnitRegistration, ExamResult } from './types';

export const mockUsers: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@student.edu",
    phone: "+254712345678",
    role: "student",
    approved: true,
    course: "Computer Science",
    level: "Diploma",
    year: 2,
    semester: 1,
    admissionNumber: "CS/2023/001",
    guardians: [
      {
        id: "g1",
        name: "Jane Doe",
        email: "jane.doe@email.com",
        phone: "+254722345678",
        relationship: "Mother"
      }
    ]
  },
  {
    id: "2",
    firstName: "Admin",
    lastName: "User",
    email: "admin@tvet.edu",
    role: "admin",
    approved: true,
    department: "Administration"
  },
  {
    id: "3",
    firstName: "Dr. Smith",
    lastName: "HOD",
    email: "hod@tvet.edu",
    role: "hod",
    approved: true,
    department: "Computer Science"
  }
];

export const mockPendingUnitRegistrations: PendingUnitRegistration[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "John Doe",
    studentEmail: "john.doe@student.edu",
    unitCode: "CS101",
    unitName: "Introduction to Computer Science",
    course: "Computer Science",
    year: 1,
    semester: 1,
    submittedDate: "2024-01-15",
    status: 'pending'
  }
];

export const mockExamResults: ExamResult[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "John Doe",
    unitCode: "CS101",
    unitName: "Introduction to Computer Science",
    examType: "exam",
    score: 85,
    maxScore: 100,
    grade: "A",
    status: "pass",
    examDate: "2024-01-20",
    semester: 1,
    year: 2024
  }
];
