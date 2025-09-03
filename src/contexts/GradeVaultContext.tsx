import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ExamResult } from '@/contexts/auth/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUsers } from '@/contexts/users/UsersContext';

// Grade vault specific interfaces
export interface GradeVaultResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  unitCode: string;
  unitName: string;
  assessmentType: 'cat1' | 'cat2' | 'assignment' | 'exam';
  assessmentTitle: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  semester: number;
  year: number;
  academicYear: string;
  
  // Lecturer information
  lecturerId: string;
  lecturerName: string;
  gradedAt: Date;
  submittedToHOD: boolean;
  
  // HOD approval workflow
  hodApprovalRequired: boolean;
  hodApproved: boolean;
  hodApprovedAt?: Date;
  hodApprovedBy?: string;
  hodComments?: string;
  
  // Result status
  status: 'draft' | 'submitted' | 'hod_review' | 'approved' | 'rejected' | 'published';
  visibleToStudent: boolean;
  canEdit: boolean;
  editingPermissionGrantedBy?: string;
  editingPermissionGrantedAt?: Date;
  
  // Additional metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeVaultStats {
  totalResults: number;
  pendingHODApproval: number;
  approvedResults: number;
  publishedResults: number;
  averageGrade: number;
  passRate: number;
}

export interface StudentSearchResult {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  results: GradeVaultResult[];
  totalSemesters: number;
  overallGPA: number;
  currentStatus: 'active' | 'graduated' | 'suspended';
}

interface GradeVaultContextType {
  // Results management
  results: GradeVaultResult[];
  addResult: (result: Omit<GradeVaultResult, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateResult: (resultId: string, updates: Partial<GradeVaultResult>) => Promise<void>;
  deleteResult: (resultId: string) => Promise<void>;
  
  // HOD approval workflow
  submitForHODApproval: (resultIds: string[]) => Promise<void>;
  approveResults: (resultIds: string[], hodComments?: string) => Promise<void>;
  rejectResults: (resultIds: string[], hodComments: string) => Promise<void>;
  publishResults: (resultIds: string[]) => Promise<void>;
  
  // Editing permissions
  grantEditingPermission: (resultIds: string[], lecturerId: string) => Promise<void>;
  revokeEditingPermission: (resultIds: string[]) => Promise<void>;
  
  // Search and filtering
  searchStudentResults: (query: string) => Promise<StudentSearchResult[]>;
  getResultsByStudent: (studentId: string) => GradeVaultResult[];
  getResultsBySemester: (year: number, semester: number) => GradeVaultResult[];
  getResultsByUnit: (unitCode: string) => GradeVaultResult[];
  getPendingHODApproval: () => GradeVaultResult[];
  
  // Statistics
  getGradeVaultStats: () => GradeVaultStats;
  
  // Grade calculation utilities
  calculateGrade: (percentage: number) => string;
  calculateGPA: (results: GradeVaultResult[]) => number;
  getGradePoints: (grade: string) => number;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const GradeVaultContext = createContext<GradeVaultContextType | null>(null);

export const useGradeVault = () => {
  const context = useContext(GradeVaultContext);
  if (!context) {
    throw new Error('useGradeVault must be used within a GradeVaultProvider');
  }
  return context;
};

export const GradeVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getAllUsers } = useAuth();
  const { examResults, addExamResult } = useUsers();
  const [results, setResults] = useState<GradeVaultResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grade calculation based on TVET requirements: 70-100=A, 60-69=B, 50-59=C, 40-49=D, 0-39=E(fail)
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    if (percentage >= 0) return 'E'; // E is fail
    return '*'; // Missing marks
  };

  // Get grade points for GPA calculation
  const getGradePoints = (grade: string): number => {
    switch (grade) {
      case 'A': return 4.0;
      case 'B': return 3.0;
      case 'C': return 2.0;
      case 'D': return 1.0;
      case 'E': return 0.0; // Fail
      case 'I': return 0.0; // Incomplete
      case '*': return 0.0; // Missing
      case '#': return 0.0; // Retake
      default: return 0.0;
    }
  };

  // Calculate GPA from results
  const calculateGPA = (results: GradeVaultResult[]): number => {
    if (results.length === 0) return 0.0;
    
    const totalPoints = results.reduce((sum, result) => {
      return sum + (getGradePoints(result.grade) * result.maxMarks);
    }, 0);
    
    const totalCredits = results.reduce((sum, result) => sum + result.maxMarks, 0);
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  };

  // Initialize results from existing exam results
  useEffect(() => {
    if (examResults && examResults.length > 0) {
      const gradeVaultResults: GradeVaultResult[] = examResults.map(examResult => ({
        id: examResult.id,
        studentId: examResult.studentId,
        studentName: examResult.studentName,
        admissionNumber: examResult.studentId, // Use student ID as fallback
        unitCode: examResult.unitCode,
        unitName: examResult.unitName,
        assessmentType: examResult.examType === 'exam' ? 'exam' : 
                       examResult.examType === 'cat1' ? 'cat1' :
                       examResult.examType === 'cat2' ? 'cat2' : 'assignment',
        assessmentTitle: `${examResult.examType.toUpperCase()} - ${examResult.unitName}`,
        marks: examResult.score,
        maxMarks: examResult.maxScore,
        percentage: (examResult.score / examResult.maxScore) * 100,
        grade: examResult.grade,
        semester: examResult.semester,
        year: examResult.year,
        academicYear: `${examResult.year}/${examResult.year + 1}`,
        lecturerId: user?.id || '',
        lecturerName: examResult.lecturerName,
        gradedAt: new Date(examResult.examDate),
        submittedToHOD: false,
        hodApprovalRequired: examResult.examType === 'exam', // Exams require HOD approval
        hodApproved: false,
        status: 'draft',
        visibleToStudent: false,
        canEdit: true,
        createdAt: new Date(examResult.examDate),
        updatedAt: new Date()
      }));
      
      setResults(gradeVaultResults);
    }
  }, [examResults, user]);

  // Add new result to grade vault
  const addResult = async (result: Omit<GradeVaultResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const newResult: GradeVaultResult = {
        ...result,
        id: `gv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        percentage: (result.marks / result.maxMarks) * 100,
        grade: calculateGrade((result.marks / result.maxMarks) * 100),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setResults(prev => [...prev, newResult]);

      // Also add to the legacy exam results for backward compatibility
      const examResult: Omit<ExamResult, 'id'> = {
        studentId: newResult.studentId,
        studentName: newResult.studentName,
        unitCode: newResult.unitCode,
        unitName: newResult.unitName,
        examType: newResult.assessmentType,
        score: newResult.marks,
        maxScore: newResult.maxMarks,
        grade: newResult.grade,
        semester: newResult.semester,
        year: newResult.year,
        examDate: newResult.gradedAt.toISOString(),
        lecturerName: newResult.lecturerName,
        status: newResult.grade === 'E' ? 'fail' : 'pass'
      };

      addExamResult(examResult);
      
      console.log('Result added to grade vault:', newResult);
    } catch (err) {
      setError('Failed to add result to grade vault');
      console.error('Error adding result:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update existing result
  const updateResult = async (resultId: string, updates: Partial<GradeVaultResult>): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.map(result => {
        if (result.id === resultId) {
          const updatedResult = { ...result, ...updates, updatedAt: new Date() };
          
          // Recalculate grade if marks or maxMarks changed
          if (updates.marks !== undefined || updates.maxMarks !== undefined) {
            updatedResult.percentage = (updatedResult.marks / updatedResult.maxMarks) * 100;
            updatedResult.grade = calculateGrade(updatedResult.percentage);
          }
          
          return updatedResult;
        }
        return result;
      }));
      
      console.log('Result updated in grade vault:', resultId, updates);
    } catch (err) {
      setError('Failed to update result');
      console.error('Error updating result:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete result
  const deleteResult = async (resultId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.filter(result => result.id !== resultId));
      console.log('Result deleted from grade vault:', resultId);
    } catch (err) {
      setError('Failed to delete result');
      console.error('Error deleting result:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit results for HOD approval
  const submitForHODApproval = async (resultIds: string[]): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.map(result => 
        resultIds.includes(result.id) 
          ? { 
              ...result, 
              status: 'hod_review',
              submittedToHOD: true,
              canEdit: false,
              updatedAt: new Date()
            }
          : result
      ));
      
      console.log('Results submitted for HOD approval:', resultIds);
    } catch (err) {
      setError('Failed to submit for HOD approval');
      console.error('Error submitting for HOD approval:', err);
    } finally {
      setLoading(false);
    }
  };

  // HOD approve results
  const approveResults = async (resultIds: string[], hodComments?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.map(result => 
        resultIds.includes(result.id) 
          ? { 
              ...result, 
              status: 'approved',
              hodApproved: true,
              hodApprovedAt: new Date(),
              hodApprovedBy: user?.firstName + ' ' + user?.lastName,
              hodComments,
              visibleToStudent: true,
              updatedAt: new Date()
            }
          : result
      ));
      
      console.log('Results approved by HOD:', resultIds);
    } catch (err) {
      setError('Failed to approve results');
      console.error('Error approving results:', err);
    } finally {
      setLoading(false);
    }
  };

  // HOD reject results
  const rejectResults = async (resultIds: string[], hodComments: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.map(result => 
        resultIds.includes(result.id) 
          ? { 
              ...result, 
              status: 'rejected',
              hodApproved: false,
              hodComments,
              canEdit: true, // Allow lecturer to edit after rejection
              visibleToStudent: false,
              updatedAt: new Date()
            }
          : result
      ));
      
      console.log('Results rejected by HOD:', resultIds);
    } catch (err) {
      setError('Failed to reject results');
      console.error('Error rejecting results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Publish results to students
  const publishResults = async (resultIds: string[]): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.map(result => 
        resultIds.includes(result.id) 
          ? { 
              ...result, 
              status: 'published',
              visibleToStudent: true,
              updatedAt: new Date()
            }
          : result
      ));
      
      console.log('Results published to students:', resultIds);
    } catch (err) {
      setError('Failed to publish results');
      console.error('Error publishing results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Grant editing permission to lecturer
  const grantEditingPermission = async (resultIds: string[], lecturerId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.map(result => 
        resultIds.includes(result.id) 
          ? { 
              ...result, 
              canEdit: true,
              editingPermissionGrantedBy: user?.firstName + ' ' + user?.lastName,
              editingPermissionGrantedAt: new Date(),
              updatedAt: new Date()
            }
          : result
      ));
      
      console.log('Editing permission granted for results:', resultIds);
    } catch (err) {
      setError('Failed to grant editing permission');
      console.error('Error granting editing permission:', err);
    } finally {
      setLoading(false);
    }
  };

  // Revoke editing permission
  const revokeEditingPermission = async (resultIds: string[]): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => prev.map(result => 
        resultIds.includes(result.id) 
          ? { 
              ...result, 
              canEdit: false,
              editingPermissionGrantedBy: undefined,
              editingPermissionGrantedAt: undefined,
              updatedAt: new Date()
            }
          : result
      ));
      
      console.log('Editing permission revoked for results:', resultIds);
    } catch (err) {
      setError('Failed to revoke editing permission');
      console.error('Error revoking editing permission:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search student results
  const searchStudentResults = async (query: string): Promise<StudentSearchResult[]> => {
    const allUsers = getAllUsers();
    const searchResults: StudentSearchResult[] = [];
    
    // Search by student name, admission number, or student ID
    const matchingStudents = allUsers.filter(user => 
      user.role === 'student' && (
        user.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        user.admissionNumber?.toLowerCase().includes(query.toLowerCase()) ||
        user.id.toLowerCase().includes(query.toLowerCase())
      )
    );

    matchingStudents.forEach(student => {
      const studentResults = results.filter(result => 
        result.studentId === student.id && result.visibleToStudent
      );
      
      if (studentResults.length > 0) {
        const semesters = new Set(studentResults.map(r => `${r.year}-${r.semester}`));
        const gpa = calculateGPA(studentResults);
        
        searchResults.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNumber: student.admissionNumber || student.id,
          results: studentResults,
          totalSemesters: semesters.size,
          overallGPA: gpa,
          currentStatus: 'active' // This could be determined by other factors
        });
      }
    });

    return searchResults;
  };

  // Get results by student
  const getResultsByStudent = (studentId: string): GradeVaultResult[] => {
    return results.filter(result => result.studentId === studentId);
  };

  // Get results by semester
  const getResultsBySemester = (year: number, semester: number): GradeVaultResult[] => {
    return results.filter(result => result.year === year && result.semester === semester);
  };

  // Get results by unit
  const getResultsByUnit = (unitCode: string): GradeVaultResult[] => {
    return results.filter(result => result.unitCode === unitCode);
  };

  // Get pending HOD approval results
  const getPendingHODApproval = (): GradeVaultResult[] => {
    return results.filter(result => result.status === 'hod_review');
  };

  // Get grade vault statistics
  const getGradeVaultStats = (): GradeVaultStats => {
    const totalResults = results.length;
    const pendingHODApproval = results.filter(r => r.status === 'hod_review').length;
    const approvedResults = results.filter(r => r.status === 'approved').length;
    const publishedResults = results.filter(r => r.status === 'published').length;
    
    const gradePoints = results.map(r => getGradePoints(r.grade));
    const averageGrade = gradePoints.length > 0 ? 
      gradePoints.reduce((sum, points) => sum + points, 0) / gradePoints.length : 0;
    
    const passResults = results.filter(r => ['A', 'B', 'C', 'D'].includes(r.grade));
    const passRate = totalResults > 0 ? (passResults.length / totalResults) * 100 : 0;

    return {
      totalResults,
      pendingHODApproval,
      approvedResults,
      publishedResults,
      averageGrade,
      passRate
    };
  };

  const contextValue: GradeVaultContextType = {
    results,
    addResult,
    updateResult,
    deleteResult,
    submitForHODApproval,
    approveResults,
    rejectResults,
    publishResults,
    grantEditingPermission,
    revokeEditingPermission,
    searchStudentResults,
    getResultsByStudent,
    getResultsBySemester,
    getResultsByUnit,
    getPendingHODApproval,
    getGradeVaultStats,
    calculateGrade,
    calculateGPA,
    getGradePoints,
    loading,
    error
  };

  return (
    <GradeVaultContext.Provider value={contextValue}>
      {children}
    </GradeVaultContext.Provider>
  );
};

export default GradeVaultProvider;