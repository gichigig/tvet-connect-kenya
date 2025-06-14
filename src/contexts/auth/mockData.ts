
import { User, PendingUnitRegistration, ExamResult } from './types';

export const mockUsers: User[] = [
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

export const mockPendingUnitRegistrations: PendingUnitRegistration[] = [];

export const mockExamResults: ExamResult[] = [];
