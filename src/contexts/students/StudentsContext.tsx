// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export interface Student {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  approved?: boolean;
  blocked?: boolean;
  departmentId?: string;
  institutionId?: string;
  admissionNumber?: string;
  course?: string;
  year?: number;
  semester?: number;
}

interface StudentsContextType {
  students: Student[];
  loading: boolean;
  getStudent: (id: string) => Student | undefined;
  getStudentsByDepartment: (departmentId: string) => Student[];
  getStudentsByCourse: (course: string) => Student[];
  refreshStudents: () => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllUsers } = useAuth();

  const refreshStudents = async () => {
    try {
      setLoading(true);
      console.log('🔍 StudentsContext: Fetching all users...');
      const allUsers = await getAllUsers();
      console.log('👥 StudentsContext: All users fetched:', allUsers.length);
      const studentUsers = allUsers.filter(user => user.role === 'student');
      console.log('🎓 StudentsContext: Students filtered:', studentUsers.length);
      setStudents(studentUsers as Student[]);
    } catch (error) {
      console.error('❌ StudentsContext: Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStudents();
  }, []);

  const getStudent = (id: string): Student | undefined => {
    return students.find(student => student.id === id);
  };

  const getStudentsByDepartment = (departmentId: string): Student[] => {
    return students.filter(student => student.departmentId === departmentId);
  };

  const getStudentsByCourse = (course: string): Student[] => {
    return students.filter(student => student.course === course);
  };

  const value: StudentsContextType = {
    students,
    loading,
    getStudent,
    getStudentsByDepartment,
    getStudentsByCourse,
    refreshStudents
  };

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};
