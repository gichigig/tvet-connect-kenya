import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, PendingUnitRegistration, ExamResult } from '../auth/types';
import { 
  createNewUser, 
  findUserByEmail, 
  updateUserInList, 
  removeUserFromList, 
  getPendingUsers 
} from '../auth/authUtils';
import { sendResultsNotification as sendNotifications } from '../auth/notificationUtils';
import { supabase } from "@/integrations/supabase/client";

// Types from Supabase
type SupaUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  approved: boolean;
  blocked: boolean;
  department?: string | null;
  course?: string | null;
  year?: number | null;
  semester?: number | null;
  level?: string | null;
  intake?: string | null;
  phone?: string | null;
  admission_number?: string | null;
  financial_status?: string | null;
  total_fees_owed?: number | null;
};

type SupaPendingUnitRegistration = {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  unit_id: string;
  unit_code: string;
  unit_name: string;
  course: string;
  year: number;
  semester: number;
  status: string;
  submitted_date: string;
};

type SupaExamResult = {
  id: string;
  student_id: string;
  student_name: string;
  unit_code: string;
  unit_name: string;
  exam_type: string;
  score: number;
  max_score: number;
  grade: string;
  semester: number;
  year: number;
  exam_date: string;
  lecturer_name: string;
  status: string;
};

interface UsersContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  pendingUnitRegistrations: PendingUnitRegistration[];
  setPendingUnitRegistrations: React.Dispatch<React.SetStateAction<PendingUnitRegistration[]>>;
  examResults: ExamResult[];
  setExamResults: React.Dispatch<React.SetStateAction<ExamResult[]>>;
  updateUserApproval: (userId: string, approved: boolean) => void;
  approveUser: (userId: string) => void;
  approveStudent: (userId: string) => void;
  rejectUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  getAllUsers: () => User[];
  addPendingUnitRegistration: (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => void;
  updateUnitRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => void;
  getPendingUnitRegistrations: () => PendingUnitRegistration[];
  addExamResult: (result: Omit<ExamResult, 'id'>) => void;
  sendResultsNotification: (resultIds: string[], sendToGuardians: boolean) => Promise<void>;
  updateStudentFinancialStatus: (studentId: string, status: User['financialStatus'], totalOwed?: number) => void;
}

const USERS_TABLE = 'users';
const UNIT_REG_TABLE = 'pending_unit_registrations';
const EXAM_RESULTS_TABLE = 'exam_results';

const ADMIN_EMAIL = 'billyblun17@gmail.com';

const mapSupaUserToUser = (supa: SupaUser): User => ({
  id: supa.id,
  email: supa.email,
  firstName: supa.first_name,
  lastName: supa.last_name,
  // Safely cast role
  role: (["admin", "student", "lecturer", "registrar", "hod", "finance"].includes(supa.role)
    ? supa.role
    : "student") as User["role"],
  approved: supa.approved,
  course: supa.course || undefined,
  department: supa.department || undefined,
  year: supa.year ?? undefined,
  semester: supa.semester ?? undefined,
  level: supa.level || undefined,
  intake: supa.intake || undefined,
  phone: supa.phone || undefined,
  admissionNumber: supa.admission_number || undefined,
  // Safely cast financialStatus
  financialStatus: (
    ["cleared", "defaulter", "partial"].includes(supa.financial_status || "")
      ? supa.financial_status
      : undefined
  ) as User["financialStatus"],
  totalFeesOwed: supa.total_fees_owed ?? undefined,
  blocked: supa.blocked ?? false,
});

const mapSupaPendingUnitRegToPendingUnitReg = (reg: SupaPendingUnitRegistration): PendingUnitRegistration => ({
  id: reg.id,
  studentId: reg.student_id,
  studentName: reg.student_name,
  studentEmail: reg.student_email,
  unitId: reg.unit_id,
  unitCode: reg.unit_code,
  unitName: reg.unit_name,
  course: reg.course,
  year: reg.year,
  semester: reg.semester,
  // Safely cast status
  status: (["pending", "approved", "rejected"].includes(reg.status)
    ? reg.status
    : "pending") as "pending" | "approved" | "rejected",
  submittedDate: reg.submitted_date,
});

const mapSupaExamResultToExamResult = (res: SupaExamResult): ExamResult => ({
  id: res.id,
  studentId: res.student_id,
  studentName: res.student_name,
  unitCode: res.unit_code,
  unitName: res.unit_name,
  examType: res.exam_type,
  score: res.score,
  maxScore: res.max_score,
  grade: res.grade,
  semester: res.semester,
  year: res.year,
  examDate: res.exam_date,
  lecturerName: res.lecturer_name,
  // Only allow "pass" or "fail"
  status: (["pass", "fail"].includes(res.status)
    ? res.status
    : "pass") as "pass" | "fail",
});

const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUnitRegistrations, setPendingUnitRegistrations] = useState<PendingUnitRegistration[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);

  // Fetch from Supabase on mount
  useEffect(() => {
    const fetchUsers = async () => {
      console.log('Fetching users from Supabase...');
      const { data, error } = await supabase.from(USERS_TABLE).select('*');
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      
      if (data) {
        console.log('Raw user data from Supabase:', data);
        let mapped = (data as SupaUser[]).map(mapSupaUserToUser);
        console.log('Mapped users:', mapped);

        // Check if admin exists
        const adminUser = mapped.find(user => user.email === ADMIN_EMAIL);
        console.log('Admin user found:', adminUser);

        setUsers(mapped);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPending = async () => {
      const { data, error } = await supabase.from(UNIT_REG_TABLE).select('*');
      if (!error && data) setPendingUnitRegistrations((data as SupaPendingUnitRegistration[]).map(mapSupaPendingUnitRegToPendingUnitReg));
    };
    fetchPending();
  }, []);

  useEffect(() => {
    const fetchExamResults = async () => {
      const { data, error } = await supabase.from(EXAM_RESULTS_TABLE).select('*');
      if (!error && data) setExamResults((data as SupaExamResult[]).map(mapSupaExamResultToExamResult));
    };
    fetchExamResults();
  }, []);

  const updateUserApproval = async (userId: string, approved: boolean) => {
    await supabase.from(USERS_TABLE).update({ approved }).eq('id', userId);
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, approved } : u));
  };

  const approveUser = async (userId: string) => updateUserApproval(userId, true);

  const approveStudent = async (userId: string) => updateUserApproval(userId, true);

  const rejectUser = async (userId: string) => {
    await supabase.from(USERS_TABLE).delete().eq('id', userId);
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  const blockUser = async (userId: string) => {
    await supabase.from(USERS_TABLE).update({ blocked: true }).eq('id', userId);
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, blocked: true } : u));
  };

  const unblockUser = async (userId: string) => {
    await supabase.from(USERS_TABLE).update({ blocked: false }).eq('id', userId);
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, blocked: false } : u));
  };

  const getAllUsers = () => users;

  const addPendingUnitRegistration = async (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => {
    // Convert camelCase keys to Supabase's snake_case.
    const newRegistration = {
      student_id: registration.studentId,
      student_name: registration.studentName,
      student_email: registration.studentEmail,
      unit_id: registration.unitId,
      unit_code: registration.unitCode,
      unit_name: registration.unitName,
      course: registration.course,
      year: registration.year,
      semester: registration.semester,
      submitted_date: new Date().toISOString().split('T')[0],
      status: "pending",
    };
    const { data } = await supabase.from(UNIT_REG_TABLE).insert([newRegistration]).select();
    if (data && data.length > 0) {
      setPendingUnitRegistrations(prev => [...prev, mapSupaPendingUnitRegToPendingUnitReg(data[0] as SupaPendingUnitRegistration)]);
    }
  };

  const updateUnitRegistrationStatus = async (registrationId: string, status: 'approved' | 'rejected') => {
    await supabase.from(UNIT_REG_TABLE).update({ status }).eq('id', registrationId);
    setPendingUnitRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId ? { ...reg, status } : reg
      )
    );
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const addExamResult = async (result: Omit<ExamResult, 'id'>) => {
    // Convert camelCase keys to Supabase's snake_case.
    const newResult = {
      student_id: result.studentId,
      student_name: result.studentName,
      unit_code: result.unitCode,
      unit_name: result.unitName,
      exam_type: result.examType,
      score: result.score,
      max_score: result.maxScore,
      grade: result.grade,
      semester: result.semester,
      year: result.year,
      exam_date: result.examDate,
      lecturer_name: result.lecturerName,
      status: result.status,
    };
    const { data } = await supabase.from(EXAM_RESULTS_TABLE).insert([newResult]).select();
    if (data && data.length > 0) {
      setExamResults(prev => [...prev, mapSupaExamResultToExamResult(data[0] as SupaExamResult)]);
    }
  };

  const sendResultsNotification = async (resultIds: string[], sendToGuardians: boolean) => {
    return sendNotifications(resultIds, sendToGuardians, examResults, users);
  };

  const updateStudentFinancialStatus = async (studentId: string, status: User['financialStatus'], totalOwed?: number) => {
    await supabase.from(USERS_TABLE).update({ financial_status: status, total_fees_owed: totalOwed }).eq('id', studentId);
    setUsers(prev => prev.map(user => 
      user.id === studentId 
        ? { ...user, financialStatus: status, totalFeesOwed: totalOwed }
        : user
    ));
  };

  const value = {
    users,
    setUsers,
    pendingUnitRegistrations,
    setPendingUnitRegistrations,
    examResults,
    setExamResults,
    updateUserApproval,
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getAllUsers,
    addPendingUnitRegistration,
    updateUnitRegistrationStatus,
    getPendingUnitRegistrations,
    addExamResult,
    sendResultsNotification,
    updateStudentFinancialStatus
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
