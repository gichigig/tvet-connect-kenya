// Grade Vault Context for managing grades
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Grade {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  unit_code: string;
  unit_name: string;
  assignment_type: 'cat1' | 'cat2' | 'assignment' | 'project' | 'exam' | 'supplementary' | 'special';
  assignment_title: string;
  marks_obtained: number;
  marks_total: number;
  percentage: number;
  grade_letter: string;
  remarks?: string;
  submitted_by: string;
  submitted_at: string;
  verified: boolean;
  semester: string;
  academic_year: string;
}

export interface GradeSubmission {
  student_id: string;
  student_name: string;
  student_number: string;
  unit_code: string;
  unit_name: string;
  assignment_type: Grade['assignment_type'];
  assignment_title: string;
  marks_obtained: number;
  marks_total: number;
  remarks?: string;
  semester: string;
  academic_year: string;
}

interface GradeVaultContextType {
  grades: Grade[];
  loading: boolean;
  submitGrades: (grades: GradeSubmission[], submittedBy: string) => Promise<void>;
  updateGrade: (gradeId: string, updates: Partial<Grade>) => Promise<void>;
  deleteGrade: (gradeId: string) => Promise<void>;
  getGradesByStudent: (studentId: string) => Grade[];
  getGradesByUnit: (unitCode: string) => Grade[];
  getGradesByAssignmentType: (type: Grade['assignment_type']) => Grade[];
  verifyGrade: (gradeId: string) => Promise<void>;
  refreshGrades: () => Promise<void>;
}

const GradeVaultContext = createContext<GradeVaultContextType | undefined>(undefined);

interface GradeVaultProviderProps {
  children: ReactNode;
}

export const GradeVaultProvider: React.FC<GradeVaultProviderProps> = ({ children }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateGradeLetter = (percentage: number): string => {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const loadGrades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrades();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('grades_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, loadGrades)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const submitGrades = async (gradeSubmissions: GradeSubmission[], submittedBy: string) => {
    const gradesToInsert = gradeSubmissions.map(submission => {
      const percentage = (submission.marks_obtained / submission.marks_total) * 100;
      return {
        ...submission,
        percentage,
        grade_letter: calculateGradeLetter(percentage),
        submitted_by: submittedBy,
        submitted_at: new Date().toISOString(),
        verified: false
      };
    });

    const { error } = await supabase
      .from('grades')
      .insert(gradesToInsert);

    if (error) throw error;
    await loadGrades();
  };

  const updateGrade = async (gradeId: string, updates: Partial<Grade>) => {
    // Recalculate percentage and grade letter if marks changed
    if (updates.marks_obtained !== undefined || updates.marks_total !== undefined) {
      const currentGrade = grades.find(g => g.id === gradeId);
      if (currentGrade) {
        const marksObtained = updates.marks_obtained ?? currentGrade.marks_obtained;
        const marksTotal = updates.marks_total ?? currentGrade.marks_total;
        const percentage = (marksObtained / marksTotal) * 100;
        updates.percentage = percentage;
        updates.grade_letter = calculateGradeLetter(percentage);
      }
    }

    const { error } = await supabase
      .from('grades')
      .update(updates)
      .eq('id', gradeId);

    if (error) throw error;
    await loadGrades();
  };

  const deleteGrade = async (gradeId: string) => {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', gradeId);

    if (error) throw error;
    await loadGrades();
  };

  const verifyGrade = async (gradeId: string) => {
    await updateGrade(gradeId, { verified: true });
  };

  const getGradesByStudent = (studentId: string): Grade[] => {
    return grades.filter(grade => grade.student_id === studentId);
  };

  const getGradesByUnit = (unitCode: string): Grade[] => {
    return grades.filter(grade => grade.unit_code === unitCode);
  };

  const getGradesByAssignmentType = (type: Grade['assignment_type']): Grade[] => {
    return grades.filter(grade => grade.assignment_type === type);
  };

  const refreshGrades = async () => {
    await loadGrades();
  };

  const value: GradeVaultContextType = {
    grades,
    loading,
    submitGrades,
    updateGrade,
    deleteGrade,
    getGradesByStudent,
    getGradesByUnit,
    getGradesByAssignmentType,
    verifyGrade,
    refreshGrades
  };

  return (
    <GradeVaultContext.Provider value={value}>
      {children}
    </GradeVaultContext.Provider>
  );
};

export const useGradeVault = (): GradeVaultContextType => {
  const context = useContext(GradeVaultContext);
  if (!context) {
    throw new Error('useGradeVault must be used within a GradeVaultProvider');
  }
  return context;
};
