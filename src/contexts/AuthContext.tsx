import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
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
  ]);
  const navigate = useNavigate();
  
  const [pendingUnitRegistrations, setPendingUnitRegistrations] = useState<PendingUnitRegistration[]>([
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
  ]);

  const [examResults, setExamResults] = useState<ExamResult[]>([
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
  ]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Initialize with mock data - no Firebase needed
    const fetchUsers = async () => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    };

    fetchUsers();
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    try {
      // Mock login - find user by email
      const foundUser = users.find(u => u.email === email);
      if (foundUser && foundUser.approved) {
        setUser(foundUser);
        navigate('/');
      } else {
        throw new Error('Invalid credentials or account not approved.');
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const { email, password, firstName, lastName, role, course, level, year, semester, admissionNumber } = userData;
      
      const newUser: User = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        role,
        approved: role === 'admin',
        course,
        level,
        year,
        semester,
        admissionNumber
      };

      setUsers(prevUsers => [...prevUsers, newUser]);
      setUser(newUser);
      navigate('/');
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  const updateUserApproval = (userId: string, approved: boolean) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, approved } : user
      )
    );
  };

  const approveUser = (userId: string) => {
    updateUserApproval(userId, true);
  };

  const approveStudent = (userId: string) => {
    updateUserApproval(userId, true);
  };

  const rejectUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const blockUser = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, blocked: true } : user
      )
    );
  };

  const unblockUser = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, blocked: false } : user
      )
    );
  };

  const getPendingUsers = () => {
    return users.filter(user => !user.approved);
  };

  const getAllUsers = () => {
    return users;
  };

  const addPendingUnitRegistration = (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => {
    const newRegistration: PendingUnitRegistration = {
      ...registration,
      id: Date.now().toString(),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setPendingUnitRegistrations(prev => [...prev, newRegistration]);
  };

  const updateUnitRegistrationStatus = (registrationId: string, status: 'approved' | 'rejected') => {
    setPendingUnitRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId ? { ...reg, status } : reg
      )
    );
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const addExamResult = (result: Omit<ExamResult, 'id'>) => {
    const newResult: ExamResult = {
      ...result,
      id: Date.now().toString()
    };
    setExamResults(prev => [...prev, newResult]);
  };

  const sendResultsNotification = async (resultIds: string[], sendToGuardians: boolean) => {
    try {
      const selectedResults = examResults.filter(result => resultIds.includes(result.id));
      
      for (const result of selectedResults) {
        const student = users.find(u => u.id === result.studentId);
        if (!student) continue;

        // Send to student
        console.log(`Sending result notification to student: ${student.email}`);
        console.log(`SMS to: ${student.phone}`);
        console.log(`Result: ${result.unitName} - ${result.grade} (${result.status})`);

        // Send to guardians if requested
        if (sendToGuardians && student.guardians) {
          for (const guardian of student.guardians) {
            console.log(`Sending result notification to guardian: ${guardian.email}`);
            console.log(`SMS to guardian: ${guardian.phone}`);
            console.log(`Student: ${student.firstName} ${student.lastName} - ${result.unitName} - ${result.grade} (${result.status})`);
          }
        }
      }

      // In a real implementation, this would call actual email/SMS services
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to send notifications:", error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    users,
    isAuthenticated,
    isAdmin,
    updateUserApproval,
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getPendingUsers,
    getAllUsers,
    pendingUnitRegistrations,
    addPendingUnitRegistration,
    updateUnitRegistrationStatus,
    getPendingUnitRegistrations,
    examResults,
    addExamResult,
    sendResultsNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
