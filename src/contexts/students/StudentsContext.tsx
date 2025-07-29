import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAllStudents,
  getStudentsByDepartment,
  getStudentsByCourse,
  updateStudent,
  deleteStudent,
  type Student
} from '../../integrations/firebase/users';

interface StudentsContextType {
  students: Student[];
  loading: boolean;
  error: string | null;
  getAllStudents: () => Student[];
  getStudentsByDepartment: (department: string) => Student[];
  getStudentsByCourse: (course: string) => Student[];
  updateStudent: (studentId: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  refreshStudents: () => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const studentsData = await getAllStudents();
      setStudents(studentsData);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const contextValue: StudentsContextType = {
    students,
    loading,
    error,
    getAllStudents: () => students,
    getStudentsByDepartment: (department: string) => 
      students.filter(student => student.department === department),
    getStudentsByCourse: (course: string) => 
      students.filter(student => student.course === course || student.courseName === course),
    updateStudent: async (studentId: string, updates: Partial<Student>) => {
      await updateStudent(studentId, updates);
      await loadStudents(); // Refresh the list
    },
    deleteStudent: async (studentId: string) => {
      await deleteStudent(studentId);
      await loadStudents(); // Refresh the list
    },
    refreshStudents: loadStudents,
  };

  return (
    <StudentsContext.Provider value={contextValue}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
}
