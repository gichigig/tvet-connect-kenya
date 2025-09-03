import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { SemesterPlanAPI } from '@/integrations/api/semesterPlanAPI';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { fileStorageService } from '@/services/FileStorageService';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface WeekPlan {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  weekMessage?: string;
  materials: WeeklyMaterial[];
  assignments: WeeklyAssignment[];
  exams: WeeklyExam[];
  attendanceSessions?: AttendanceSession[];
  onlineClasses?: OnlineClass[];
}

interface WeeklyMaterial {
  id: string;
  title: string;
  description: string;
  type: 'notes' | 'material';
  dayOfWeek: string;
  releaseTime: string;
  fileUrl?: string;
  fileName?: string;
  isUploaded: boolean;
  isVisible: boolean;
  documents?: WeeklyDocument[]; // Add documents array
}

interface WeeklyDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: Date;
  isVisible: boolean;
  uploadedBy?: string;
  file?: File; // For temporary file storage during development
}

interface WeeklyAssignment {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'essay';
  studentType?: 'document' | 'essay';
  assignDate: Date;
  dueDate: Date;
  maxMarks: number;
  instructions: string;
  fileUrl?: string;
  fileName?: string;
  isUploaded: boolean;
  requiresAICheck: boolean;
  documents?: WeeklyDocument[]; // Add documents array
}

interface ExamQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'essay' | 'short_answer' | 'true_false';
  options?: string[]; // For multiple choice questions
  correctAnswer?: string | number; // For multiple choice or true/false
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel: 'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating';
}

interface WeeklyExam {
  id: string;
  title: string;
  description: string;
  type: 'exam' | 'cat';
  examDate: Date;
  examTime: string;
  duration: number;
  venue?: string;
  maxMarks: number;
  instructions: string;
  isLocked: boolean;
  questions: ExamQuestion[];
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string; // HOD ID
  approvedAt?: Date;
  rejectionReason?: string;
  hodComments?: string;
}

interface AttendanceSession {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue?: string;
  isActive: boolean;
  createdAt: Date;
  unitId: string;
  weekNumber: number;
  type: 'attendance';
  locationRestriction?: {
    enabled: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number; // in meters
    locationName?: string;
  };
}

interface OnlineClass {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  platform: 'zoom' | 'teams' | 'meet' | 'bbb' | 'other';
  meetingLink: string;
  meetingId?: string;
  passcode?: string;
  instructions?: string;
  isActive: boolean;
  createdAt: Date;
  unitId: string;
  weekNumber: number;
  type: 'online-class';
}

interface SemesterPlanContextType {
  // Semester plan data per unit (cached)
  semesterPlans: Record<string, {
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  }>;
  
  // Actions
  setSemesterPlan: (unitId: string, plan: {
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  }) => Promise<void>;
  
  getSemesterPlan: (unitId: string) => Promise<{
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  }>;
  
  clearSemesterPlan: (unitId: string) => Promise<void>;
  
  // Document management
  addDocumentToMaterial: (unitId: string, weekNumber: number, materialId: string, document: Omit<WeeklyDocument, 'id' | 'uploadDate'>) => Promise<void>;
  addDocumentToAssignment: (unitId: string, weekNumber: number, assignmentId: string, document: Omit<WeeklyDocument, 'id' | 'uploadDate'>) => Promise<void>;
  removeDocument: (unitId: string, weekNumber: number, itemId: string, documentId: string, itemType: 'material' | 'assignment') => Promise<void>;
  
  // Exam question management
  addExamQuestion: (unitId: string, weekNumber: number, examId: string, question: Omit<ExamQuestion, 'id'>) => Promise<void>;
  updateExamQuestion: (unitId: string, weekNumber: number, examId: string, questionId: string, updates: Partial<ExamQuestion>) => Promise<void>;
  removeExamQuestion: (unitId: string, weekNumber: number, examId: string, questionId: string) => Promise<void>;
  
  // Exam approval management
  submitExamForApproval: (unitId: string, weekNumber: number, examId: string) => Promise<void>;
  approveExam: (unitId: string, weekNumber: number, examId: string, hodComments?: string) => Promise<void>;
  rejectExam: (unitId: string, weekNumber: number, examId: string, rejectionReason: string, hodComments?: string) => Promise<void>;
  
  // Student view functions
  getStudentSemesterPlan: (unitId: string, studentId: string) => Promise<{
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  }>;
  
  // Cross-tab integration functions
  addMaterialToSemesterPlan: (unitId: string, weekNumber: number, material: WeeklyMaterial) => Promise<void>;
  addAssignmentToSemesterPlan: (unitId: string, weekNumber: number, assignment: WeeklyAssignment) => Promise<void>;
  addExamToSemesterPlan: (unitId: string, weekNumber: number, exam: WeeklyExam) => Promise<void>;
  
  // Helper functions
  hasSemesterPlan: (unitId: string) => boolean;
  getSemesterProgress: (unitId: string) => number; // Returns 0-100% based on current week vs total weeks
  
  // Attendance activation functions
  activateAttendance: (unitId: string, weekNumber: number, sessionData: {
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    venue?: string;
    description?: string;
    locationRestriction?: {
      enabled: boolean;
      latitude?: number;
      longitude?: number;
      radius?: number;
      locationName?: string;
    };
  }) => Promise<void>;
  
  // Online class management functions
  addOnlineClass: (unitId: string, weekNumber: number, classData: {
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
    platform: 'zoom' | 'teams' | 'meet' | 'bbb' | 'other';
    meetingLink: string;
    meetingId?: string;
    passcode?: string;
    instructions?: string;
  }) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const SemesterPlanContext = createContext<SemesterPlanContextType | undefined>(undefined);

export const useSemesterPlan = () => {
  const context = useContext(SemesterPlanContext);
  if (context === undefined) {
    throw new Error('useSemesterPlan must be used within a SemesterPlanProvider');
  }
  return context;
};

interface SemesterPlanProviderProps {
  children: ReactNode;
}

export const SemesterPlanProvider: React.FC<SemesterPlanProviderProps> = ({ children }) => {
  const { user, createdUnits } = useAuth();
  
  // Use a ref to maintain persistent cache that doesn't get reset
  const persistentCache = useRef<Record<string, {
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  }>>({});
  
  // Track current user ID to detect user changes
  const currentUserId = useRef<string | null>(null);
  
  const [semesterPlans, setSemesterPlansLocal] = useState<Record<string, {
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  }>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationKey, setInitializationKey] = useState<string>('');

  // Detect user changes and clear cache when user logs out or changes
  useEffect(() => {
    const newUserId = user?.id || null;
    const previousUserId = currentUserId.current;
    
    // If user changed (including logout), clear cache and reset state
    if (previousUserId !== newUserId) {
      console.log('SemesterPlanProvider: User changed', { 
        from: previousUserId, 
        to: newUserId,
        action: newUserId ? 'login/user-change' : 'logout',
        cachedPlansCleared: Object.keys(persistentCache.current).length
      });
      
      // Clear all caches and reset state
      persistentCache.current = {};
      setSemesterPlansLocal({});
      setIsInitialized(false);
      setInitializationKey('');
      
      // Update current user reference
      currentUserId.current = newUserId;
      
      console.log('SemesterPlanProvider: Cache cleared, ready for fresh initialization');
    }
  }, [user?.id]);

  // Sync state with persistent cache
  useEffect(() => {
    setSemesterPlansLocal(persistentCache.current);
  }, []);

  // Create a stable key for initialization to prevent re-initialization
  useEffect(() => {
    if (user && createdUnits) {
      const newKey = `${user.id}-${createdUnits.length}`;
      if (newKey !== initializationKey) {
        setInitializationKey(newKey);
        // Don't reset initialization - keep existing plans
      }
    }
  }, [user, createdUnits, initializationKey]);

  // Initialize semester plans for lecturer's units when context mounts
  useEffect(() => {
    const initializeSemesterPlans = async () => {
      console.log('SemesterPlanProvider: initializeSemesterPlans called', { user: user?.id, createdUnits: createdUnits?.length, isInitialized, initializationKey });
      
      if (!user || !createdUnits || isInitialized || !initializationKey) return;
      
      // Get units assigned to current lecturer
      const lecturerUnits = createdUnits.filter(unit => unit.lecturerId === user.id);
      console.log('SemesterPlanProvider: Found lecturer units:', lecturerUnits.map(u => ({ id: u.id, code: u.code })));
      
      if (lecturerUnits.length === 0) {
        setIsInitialized(true);
        return;
      }

      setIsLoading(true);
      
      try {
        const planPromises = lecturerUnits.map(async (unit) => {
          try {
            console.log(`SemesterPlanProvider: Loading plan for unit ${unit.id} (${unit.code})`);
            const apiData = await SemesterPlanAPI.getSemesterPlan(unit.id);
            // Only add to cache if the plan has actual data (not the default empty plan)
            if (apiData.weekPlans && apiData.weekPlans.length > 0) {
              console.log(`SemesterPlanProvider: Found plan for unit ${unit.id} with ${apiData.weekPlans.length} weeks`);
              const localData = convertApiDataToLocal(apiData);
              return { unitId: unit.id, plan: localData };
            } else {
              console.log(`SemesterPlanProvider: No plan data found for unit ${unit.id}`);
            }
          } catch (error) {
            console.warn(`Failed to load semester plan for unit ${unit.id}:`, error);
          }
          return null;
        });

        const planResults = await Promise.all(planPromises);
        
        // Update local cache with all loaded plans
        const newPlans: Record<string, any> = {};
        planResults.forEach(result => {
          if (result) {
            newPlans[result.unitId] = result.plan;
          }
        });

        console.log('SemesterPlanProvider: Loaded plans for units:', Object.keys(newPlans));
        
        // Update both persistent cache and state
        persistentCache.current = { ...persistentCache.current, ...newPlans };
        
        if (Object.keys(newPlans).length > 0) {
          setSemesterPlansLocal(prev => {
            console.log('SemesterPlanProvider: Setting semester plans', { prev: Object.keys(prev), new: Object.keys(newPlans) });
            return {
              ...prev,
              ...newPlans
            };
          });
        }
      } catch (error) {
        console.error('Failed to initialize semester plans:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeSemesterPlans();
  }, [user, createdUnits, isInitialized, initializationKey]);

  // Convert API date strings to Date objects
  const convertApiDataToLocal = (apiData: any) => {
    return {
      semesterStart: apiData.semesterStart ? new Date(apiData.semesterStart) : undefined,
      semesterWeeks: apiData.semesterWeeks,
      weekPlans: apiData.weekPlans?.map((week: any) => ({
        ...week,
        startDate: new Date(week.startDate),
        endDate: new Date(week.endDate),
        assignments: week.assignments?.map((assignment: any) => ({
          ...assignment,
          assignDate: new Date(assignment.assignDate),
          dueDate: new Date(assignment.dueDate)
        })) || [],
        exams: week.exams?.map((exam: any) => ({
          ...exam,
          examDate: new Date(exam.examDate)
        })) || []
      })) || []
    };
  };

  // Convert local data to API format
  const convertLocalDataToApi = (localData: any) => {
    return {
      semesterStart: localData.semesterStart?.toISOString(),
      semesterWeeks: localData.semesterWeeks,
      weekPlans: localData.weekPlans?.map((week: any) => ({
        ...week,
        startDate: week.startDate.toISOString(),
        endDate: week.endDate.toISOString(),
        assignments: week.assignments?.map((assignment: any) => ({
          ...assignment,
          assignDate: assignment.assignDate.toISOString(),
          dueDate: assignment.dueDate.toISOString()
        })) || [],
        exams: week.exams?.map((exam: any) => ({
          ...exam,
          examDate: exam.examDate.toISOString()
        })) || []
      })) || []
    };
  };

  const setSemesterPlan = async (unitId: string, plan: {
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  }) => {
    try {
      setIsLoading(true);
      
      // Convert to API format and save to backend
      const apiData = convertLocalDataToApi(plan);
      await SemesterPlanAPI.saveSemesterPlan(unitId, apiData);
      
      // Update persistent cache
      persistentCache.current = {
        ...persistentCache.current,
        [unitId]: plan
      };
      
      // Update local state
      setSemesterPlansLocal(prev => ({
        ...prev,
        [unitId]: plan
      }));
      
      console.log('setSemesterPlan: Saved plan for unit', unitId, 'Total cached plans:', Object.keys(persistentCache.current).length);
    } catch (error) {
      console.error('Failed to save semester plan:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSemesterPlan = async (unitId: string) => {
    try {
      console.log(`getSemesterPlan called for unit ${unitId}`);
      console.log('Current persistent cache:', Object.keys(persistentCache.current));
      console.log('Current state cache:', Object.keys(semesterPlans));
      
      // Check persistent cache first
      if (persistentCache.current[unitId] && persistentCache.current[unitId].weekPlans.length > 0) {
        console.log(`getSemesterPlan: Found persistent cached plan for unit ${unitId} with ${persistentCache.current[unitId].weekPlans.length} weeks`);
        
        // Sync to state if not already there
        if (!semesterPlans[unitId]) {
          setSemesterPlansLocal(prev => ({
            ...prev,
            [unitId]: persistentCache.current[unitId]
          }));
        }
        
        return persistentCache.current[unitId];
      }
      
      // Check state cache 
      if (semesterPlans[unitId] && semesterPlans[unitId].weekPlans.length > 0) {
        console.log(`getSemesterPlan: Found state cached plan for unit ${unitId} with ${semesterPlans[unitId].weekPlans.length} weeks`);
        
        // Sync to persistent cache
        persistentCache.current[unitId] = semesterPlans[unitId];
        
        return semesterPlans[unitId];
      }
      
      console.log(`getSemesterPlan: No cached plan found for unit ${unitId}, fetching from API`);
      setIsLoading(true);
      
      // Fetch from API
      const apiData = await SemesterPlanAPI.getSemesterPlan(unitId);
      
      // Only update cache if we got actual data (not the default empty plan)
      if (apiData.weekPlans && apiData.weekPlans.length > 0) {
        console.log(`getSemesterPlan: API returned plan for unit ${unitId} with ${apiData.weekPlans.length} weeks`);
        const localData = convertApiDataToLocal(apiData);
        
        // Update both persistent cache and state
        persistentCache.current = {
          ...persistentCache.current,
          [unitId]: localData
        };
        
        setSemesterPlansLocal(prev => {
          console.log(`getSemesterPlan: Caching plan for unit ${unitId}`);
          return {
            ...prev,
            [unitId]: localData
          };
        });
        
        return localData;
      } else {
        console.log(`getSemesterPlan: API returned empty plan for unit ${unitId}`);
        // Return default empty plan but don't cache it
        return {
          semesterStart: undefined,
          semesterWeeks: 15,
          weekPlans: []
        };
      }
    } catch (error) {
      console.error('Failed to get semester plan:', error);
      // Return default empty plan on error
      return {
        semesterStart: undefined,
        semesterWeeks: 15,
        weekPlans: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearSemesterPlan = async (unitId: string) => {
    try {
      setIsLoading(true);
      
      // Delete from backend
      await SemesterPlanAPI.deleteSemesterPlan(unitId);
      
      // Remove from local cache
      setSemesterPlansLocal(prev => {
        const newPlans = { ...prev };
        delete newPlans[unitId];
        return newPlans;
      });
    } catch (error) {
      console.error('Failed to clear semester plan:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Document management functions
  const addDocumentToMaterial = async (unitId: string, weekNumber: number, materialId: string, document: Omit<WeeklyDocument, 'id' | 'uploadDate'>) => {
    try {
      const newDocument: WeeklyDocument = {
        ...document,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uploadDate: new Date()
      };

      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedMaterials = week.materials.map(material => {
              if (material.id === materialId) {
                return {
                  ...material,
                  documents: [...(material.documents || []), newDocument]
                };
              }
              return material;
            });
            return { ...week, materials: updatedMaterials };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });
    } catch (error) {
      console.error('Failed to add document to material:', error);
      throw error;
    }
  };

  const addDocumentToAssignment = async (unitId: string, weekNumber: number, assignmentId: string, document: Omit<WeeklyDocument, 'id' | 'uploadDate'>) => {
    try {
      const newDocument: WeeklyDocument = {
        ...document,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uploadDate: new Date()
      };

      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedAssignments = week.assignments.map(assignment => {
              if (assignment.id === assignmentId) {
                return {
                  ...assignment,
                  documents: [...(assignment.documents || []), newDocument]
                };
              }
              return assignment;
            });
            return { ...week, assignments: updatedAssignments };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });
    } catch (error) {
      console.error('Failed to add document to assignment:', error);
      throw error;
    }
  };

  const removeDocument = async (unitId: string, weekNumber: number, itemId: string, documentId: string, itemType: 'material' | 'assignment') => {
    try {
      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            if (itemType === 'material') {
              const updatedMaterials = week.materials.map(material => {
                if (material.id === itemId) {
                  return {
                    ...material,
                    documents: material.documents?.filter(doc => doc.id !== documentId) || []
                  };
                }
                return material;
              });
              return { ...week, materials: updatedMaterials };
            } else {
              const updatedAssignments = week.assignments.map(assignment => {
                if (assignment.id === itemId) {
                  return {
                    ...assignment,
                    documents: assignment.documents?.filter(doc => doc.id !== documentId) || []
                  };
                }
                return assignment;
              });
              return { ...week, assignments: updatedAssignments };
            }
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });
    } catch (error) {
      console.error('Failed to remove document:', error);
      throw error;
    }
  };

  // Exam question management functions
  const addExamQuestion = async (unitId: string, weekNumber: number, examId: string, question: Omit<ExamQuestion, 'id'>) => {
    try {
      const newQuestion: ExamQuestion = {
        ...question,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedExams = week.exams.map(exam => {
              if (exam.id === examId) {
                return {
                  ...exam,
                  questions: [...exam.questions, newQuestion]
                };
              }
              return exam;
            });
            return { ...week, exams: updatedExams };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });
    } catch (error) {
      console.error('Failed to add exam question:', error);
      throw error;
    }
  };

  const updateExamQuestion = async (unitId: string, weekNumber: number, examId: string, questionId: string, updates: Partial<ExamQuestion>) => {
    try {
      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedExams = week.exams.map(exam => {
              if (exam.id === examId) {
                const updatedQuestions = exam.questions.map(question => {
                  if (question.id === questionId) {
                    return { ...question, ...updates };
                  }
                  return question;
                });
                return { ...exam, questions: updatedQuestions };
              }
              return exam;
            });
            return { ...week, exams: updatedExams };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });
    } catch (error) {
      console.error('Failed to update exam question:', error);
      throw error;
    }
  };

  const removeExamQuestion = async (unitId: string, weekNumber: number, examId: string, questionId: string) => {
    try {
      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedExams = week.exams.map(exam => {
              if (exam.id === examId) {
                return {
                  ...exam,
                  questions: exam.questions.filter(q => q.id !== questionId)
                };
              }
              return exam;
            });
            return { ...week, exams: updatedExams };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });
    } catch (error) {
      console.error('Failed to remove exam question:', error);
      throw error;
    }
  };

  // Exam approval management functions
  const submitExamForApproval = async (unitId: string, weekNumber: number, examId: string) => {
    try {
      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedExams = week.exams.map(exam => {
              if (exam.id === examId) {
                return {
                  ...exam,
                  approvalStatus: 'pending_approval' as const
                };
              }
              return exam;
            });
            return { ...week, exams: updatedExams };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });

      // TODO: Send notification to HOD
    } catch (error) {
      console.error('Failed to submit exam for approval:', error);
      throw error;
    }
  };

  const approveExam = async (unitId: string, weekNumber: number, examId: string, hodComments?: string) => {
    try {
      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedExams = week.exams.map(exam => {
              if (exam.id === examId) {
                return {
                  ...exam,
                  approvalStatus: 'approved' as const,
                  approvedAt: new Date(),
                  hodComments
                };
              }
              return exam;
            });
            return { ...week, exams: updatedExams };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });

      // TODO: Send notification to lecturer
    } catch (error) {
      console.error('Failed to approve exam:', error);
      throw error;
    }
  };

  const rejectExam = async (unitId: string, weekNumber: number, examId: string, rejectionReason: string, hodComments?: string) => {
    try {
      setSemesterPlansLocal(prev => {
        const plan = prev[unitId];
        if (!plan) return prev;

        const updatedWeekPlans = plan.weekPlans.map(week => {
          if (week.weekNumber === weekNumber) {
            const updatedExams = week.exams.map(exam => {
              if (exam.id === examId) {
                return {
                  ...exam,
                  approvalStatus: 'rejected' as const,
                  rejectionReason,
                  hodComments
                };
              }
              return exam;
            });
            return { ...week, exams: updatedExams };
          }
          return week;
        });

        return {
          ...prev,
          [unitId]: { ...plan, weekPlans: updatedWeekPlans }
        };
      });

      // TODO: Send notification to lecturer
    } catch (error) {
      console.error('Failed to reject exam:', error);
      throw error;
    }
  };

  // Cross-tab integration functions - sync semester plan content to dashboard tabs
  const addMaterialToSemesterPlan = async (unitId: string, weekNumber: number, material: WeeklyMaterial) => {
    try {
      const plan = await getSemesterPlan(unitId);
      const updatedWeekPlans = plan.weekPlans.map(week =>
        week.weekNumber === weekNumber
          ? { ...week, materials: [...week.materials, material] }
          : week
      );

      await setSemesterPlan(unitId, {
        ...plan,
        weekPlans: updatedWeekPlans
      });

      // Sync to dashboard tabs - add to lecturer's created content
      await syncToLecturerDashboard(unitId, material, 'notes');
    } catch (error) {
      console.error('Failed to add material to semester plan:', error);
      throw error;
    }
  };

  const addAssignmentToSemesterPlan = async (unitId: string, weekNumber: number, assignment: WeeklyAssignment) => {
    try {
      const plan = await getSemesterPlan(unitId);
      const updatedWeekPlans = plan.weekPlans.map(week =>
        week.weekNumber === weekNumber
          ? { ...week, assignments: [...week.assignments, assignment] }
          : week
      );

      await setSemesterPlan(unitId, {
        ...plan,
        weekPlans: updatedWeekPlans
      });

      // Sync to dashboard tabs - add to lecturer's created content
      await syncToLecturerDashboard(unitId, assignment, 'assignment');
    } catch (error) {
      console.error('Failed to add assignment to semester plan:', error);
      throw error;
    }
  };

  const addExamToSemesterPlan = async (unitId: string, weekNumber: number, exam: WeeklyExam) => {
    try {
      const plan = await getSemesterPlan(unitId);
      const updatedWeekPlans = plan.weekPlans.map(week =>
        week.weekNumber === weekNumber
          ? { ...week, exams: [...week.exams, exam] }
          : week
      );

      await setSemesterPlan(unitId, {
        ...plan,
        weekPlans: updatedWeekPlans
      });

      // Sync to dashboard tabs - add to lecturer's created content
      await syncToLecturerDashboard(unitId, exam, exam.type === 'exam' ? 'exam' : 'cat');
    } catch (error) {
      console.error('Failed to add exam to semester plan:', error);
      throw error;
    }
  };

  // Helper function to sync semester plan content to lecturer dashboard tabs
  const syncToLecturerDashboard = async (unitId: string, content: any, type: string) => {
    try {
      // Get unit information to identify the lecturer
      const unit = createdUnits?.find(u => u.id === unitId);
      if (!unit || !unit.lecturerId) {
        console.warn('Unit or lecturer not found for cross-tab sync:', unitId);
        return;
      }

      // Create dashboard content from semester plan item
      const dashboardContent = {
        id: content.id,
        type: type,
        title: content.title,
        description: content.description,
        unitId: unitId,
        unitCode: unit.code,
        unitName: unit.name,
        lecturerId: unit.lecturerId,
        createdAt: new Date().toISOString(),
        status: 'active',
        // Map semester plan fields to dashboard fields
        ...(type === 'assignment' && {
          assignDate: content.assignDate,
          dueDate: content.dueDate,
          maxMarks: content.maxMarks,
          instructions: content.instructions,
          fileUrl: content.fileUrl,
          fileName: content.fileName
        }),
        ...(type === 'notes' && {
          fileUrl: content.fileUrl,
          fileName: content.fileName,
          releaseTime: content.releaseTime
        }),
        ...((type === 'exam' || type === 'cat') && {
          examDate: content.examDate,
          examTime: content.examTime,
          duration: content.duration,
          venue: content.venue,
          maxMarks: content.maxMarks,
          instructions: content.instructions,
          questions: content.questions || []
        })
      };

      // Send to backend API for real-time sync across all sessions
      const response = await fetch(`${API_BASE_URL}/api/lecturer/dashboard-content`, {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboardContent)
      });

      if (response.ok) {
        console.log('Successfully synced semester plan content to dashboard tabs:', type, content.title);
        
        // Also trigger student dashboard sync for this unit
        await syncToStudentDashboards(unitId, dashboardContent);
      }
    } catch (error) {
      console.error('Error syncing to lecturer dashboard:', error);
    }
  };

  // Helper function to sync content to all students registered for this unit
  const syncToStudentDashboards = async (unitId: string, content: any) => {
    try {
      // Get all students registered for this unit
      const response = await fetch(`${API_BASE_URL}/api/units/${unitId}/students`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { students } = await response.json();
        
        // Send content to each student's dashboard tabs
        for (const student of students) {
          await fetch(`${API_BASE_URL}/api/students/${student.id}/dashboard-content`, {
            method: 'POST',
            headers: {
              'x-api-key': import.meta.env.VITE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...content,
              studentId: student.id,
              isFromSemesterPlan: true
            })
          });
        }

        console.log(`Synced content to ${students.length} student dashboards`);
      }
    } catch (error) {
      console.error('Error syncing to student dashboards:', error);
    }
  };

  // Helper function to sync attendance sessions to student dashboards
  const syncAttendanceToStudents = async (unitId: string, attendanceSessionId: string) => {
    try {
      // Get students for this unit
      const response = await fetch(`${API_BASE_URL}/api/units/${unitId}/students`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { students } = await response.json();
        
        // Sync attendance to each student's dashboard
        for (const student of students) {
          await fetch(`${API_BASE_URL}/api/students/${student.id}/dashboard/attendance`, {
            method: 'POST',
            headers: {
              'x-api-key': import.meta.env.VITE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              attendanceSessionId: attendanceSessionId,
              unitId: unitId
            })
          });
        }

        console.log(`Synced attendance session to ${students.length} student dashboards`);
      }
    } catch (error) {
      console.error('Error syncing attendance to student dashboards:', error);
    }
  };

  // Helper function to sync online classes to student dashboards
  const syncOnlineClassToStudents = async (unitId: string, onlineClassId: string) => {
    try {
      // Get students for this unit
      const response = await fetch(`${API_BASE_URL}/api/units/${unitId}/students`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { students } = await response.json();
        
        // Sync online class to each student's dashboard
        for (const student of students) {
          await fetch(`${API_BASE_URL}/api/students/${student.id}/dashboard/online-classes`, {
            method: 'POST',
            headers: {
              'x-api-key': import.meta.env.VITE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              onlineClassId: onlineClassId,
              unitId: unitId
            })
          });
        }

        console.log(`Synced online class to ${students.length} student dashboards`);
      }
    } catch (error) {
      console.error('Error syncing online class to student dashboards:', error);
    }
  };

  // Helper function to load documents from persistent storage for materials and assignments
  const loadDocumentsFromStorage = async (entityId: string, entityType: 'semester-plan-material' | 'semester-plan-assignment', category: 'material' | 'assignment') => {
    try {
      const storedDocuments = await fileStorageService.getVisibleDocuments(entityId, entityType, category);
      
      // Convert StoredDocument format to WeeklyDocument format for compatibility
      return storedDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description || '',
        fileName: doc.fileName,
        fileUrl: doc.downloadUrl,
        fileSize: doc.fileSize,
        isVisible: doc.isVisible,
        uploadDate: doc.uploadedAt,
        uploadedBy: doc.uploadedBy
      }));
    } catch (error) {
      console.error(`Failed to load documents for ${entityId}:`, error);
      return [];
    }
  };

  // Student view function (filtered to show only visible content)
  const getStudentSemesterPlan = async (unitId: string, studentId: string) => {
    try {
      console.log('SemesterPlanContext - getStudentSemesterPlan called for unit:', unitId, 'student:', studentId);
      
      const plan = await getSemesterPlan(unitId);
      
      console.log('SemesterPlanContext - getSemesterPlan returned:', plan);
      console.log('SemesterPlanContext - Plan type:', typeof plan);
      console.log('SemesterPlanContext - Plan weekPlans length:', plan?.weekPlans?.length || 0);
      
      if (!plan || !plan.weekPlans || plan.weekPlans.length === 0) {
        console.log('SemesterPlanContext - No plan or no week plans found, returning default');
        return {
          semesterStart: undefined,
          semesterWeeks: 0,
          weekPlans: []
        };
      }
      
      // Filter content based on visibility and release dates, and load documents from persistent storage
      console.log('SemesterPlanContext - Filtering week plans for student view...');
      const filteredWeekPlans = await Promise.all(plan.weekPlans.map(async (week, index) => {
        console.log(`Week ${index + 1} before filtering:`, {
          weekNumber: week.weekNumber,
          materialsCount: week.materials?.length || 0,
          assignmentsCount: week.assignments?.length || 0,
          examsCount: week.exams?.length || 0
        });
        
        // Filter and enhance materials with persistent storage documents
        const filteredMaterials = await Promise.all(
          (week.materials?.filter(material => material.isVisible) || []).map(async (material) => {
            // Load documents from persistent storage
            const persistentDocs = await loadDocumentsFromStorage(material.id, 'semester-plan-material', 'material');
            
            // Merge existing documents with persistent documents (persistent takes priority)
            const allDocuments = [
              ...persistentDocs,
              ...(material.documents?.filter(doc => doc.isVisible && !persistentDocs.find(pDoc => pDoc.id === doc.id)) || [])
            ];

            return {
              ...material,
              documents: allDocuments
            };
          })
        );

        // Filter and enhance assignments with persistent storage documents
        const filteredAssignments = await Promise.all(
          (week.assignments?.filter(assignment => {
            // Only show assignments if they're past the assign date
            return new Date() >= assignment.assignDate;
          }) || []).map(async (assignment) => {
            // Load documents from persistent storage
            const persistentDocs = await loadDocumentsFromStorage(assignment.id, 'semester-plan-assignment', 'assignment');
            
            // Merge existing documents with persistent documents (persistent takes priority)
            const allDocuments = [
              ...persistentDocs,
              ...(assignment.documents?.filter(doc => doc.isVisible && !persistentDocs.find(pDoc => pDoc.id === doc.id)) || [])
            ];

            return {
              ...assignment,
              documents: allDocuments
            };
          })
        );
        
        const filteredWeek = {
          ...week,
          materials: filteredMaterials,
          assignments: filteredAssignments,
          exams: week.exams?.filter(exam => {
            // Only show approved exams
            return exam.approvalStatus === 'approved';
          }) || [],
          attendanceSessions: week.attendanceSessions || [],
          onlineClasses: week.onlineClasses || []
        };
        
        console.log(`Week ${index + 1} after filtering:`, {
          weekNumber: filteredWeek.weekNumber,
          materialsCount: filteredWeek.materials.length,
          assignmentsCount: filteredWeek.assignments.length,
          examsCount: filteredWeek.exams.length,
          totalDocuments: filteredWeek.materials.reduce((sum, m) => sum + (m.documents?.length || 0), 0) + 
                         filteredWeek.assignments.reduce((sum, a) => sum + (a.documents?.length || 0), 0)
        });
        return filteredWeek;
      }));

      const result = {
        ...plan,
        weekPlans: filteredWeekPlans
      };
      
      console.log('SemesterPlanContext - Returning filtered plan with persistent storage documents:', result);
      return result;
    } catch (error) {
      console.error('SemesterPlanContext - Failed to get student semester plan:', error);
      console.error('SemesterPlanContext - Error details:', error.message);
      throw error;
    }
  };

  // Helper function to check if a unit has a semester plan in memory
  const hasSemesterPlan = (unitId: string): boolean => {
    // Check persistent cache first
    if (persistentCache.current[unitId] && persistentCache.current[unitId].weekPlans.length > 0) {
      console.log(`hasSemesterPlan: Found persistent cache plan for unit ${unitId} with ${persistentCache.current[unitId].weekPlans.length} weeks`);
      return true;
    }
    
    // Check state cache
    const hasPlans = semesterPlans[unitId] && semesterPlans[unitId].weekPlans.length > 0;
    if (hasPlans) {
      console.log(`hasSemesterPlan: Found state cache plan for unit ${unitId} with ${semesterPlans[unitId].weekPlans.length} weeks`);
    } else {
      console.log(`hasSemesterPlan: No plan found for unit ${unitId}. Available plans:`, Object.keys(semesterPlans));
    }
    return hasPlans;
  };

  // Helper function to calculate semester progress based on current week vs total weeks
  const getSemesterProgress = (unitId: string): number => {
    try {
      // Check persistent cache first
      const plan = persistentCache.current[unitId] || semesterPlans[unitId];
      
      if (!plan || !plan.semesterStart || plan.weekPlans.length === 0) {
        console.log(`getSemesterProgress: No plan data found for unit ${unitId}`);
        return 0;
      }

      const now = new Date();
      const semesterStart = plan.semesterStart;
      const totalWeeks = plan.semesterWeeks || plan.weekPlans.length;

      // Find current week based on today's date
      let currentWeek = 0;
      
      for (let i = 0; i < plan.weekPlans.length; i++) {
        const week = plan.weekPlans[i];
        if (week.startDate && week.endDate) {
          const weekStart = new Date(week.startDate);
          const weekEnd = new Date(week.endDate);
          
          if (now >= weekStart && now <= weekEnd) {
            currentWeek = week.weekNumber;
            break;
          }
        }
      }

      // If we couldn't find the current week from date ranges, calculate based on semester start
      if (currentWeek === 0 && semesterStart) {
        const msInWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksSinceStart = Math.floor((now.getTime() - semesterStart.getTime()) / msInWeek) + 1;
        currentWeek = Math.max(1, Math.min(weeksSinceStart, totalWeeks));
      }

      // Calculate progress percentage
      const progress = Math.min(100, Math.max(0, (currentWeek / totalWeeks) * 100));
      
      console.log(`getSemesterProgress: Unit ${unitId} - Week ${currentWeek}/${totalWeeks} = ${progress}%`);
      return Math.round(progress);
    } catch (error) {
      console.error(`Failed to calculate semester progress for unit ${unitId}:`, error);
      return 0;
    }
  };

  // Function to activate attendance within semester plan
  const activateAttendance = async (unitId: string, weekNumber: number, sessionData: {
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    venue?: string;
    description?: string;
    locationRestriction?: {
      enabled: boolean;
      latitude?: number;
      longitude?: number;
      radius?: number;
      locationName?: string;
    };
  }) => {
    try {
      setIsLoading(true);
      
      // Create attendance session object
      const attendanceSession = {
        id: `attendance-${Date.now()}`,
        title: sessionData.title,
        description: sessionData.description || '',
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        venue: sessionData.venue,
        isActive: true,
        createdAt: new Date(),
        unitId: unitId,
        weekNumber: weekNumber,
        type: 'attendance' as const,
        locationRestriction: sessionData.locationRestriction
      };

      // Update the semester plan with attendance session
      const plan = await getSemesterPlan(unitId);
      const updatedWeekPlans = plan.weekPlans.map(week => {
        if (week.weekNumber === weekNumber) {
          return {
            ...week,
            attendanceSessions: [
              ...(week.attendanceSessions || []),
              attendanceSession
            ]
          };
        }
        return week;
      });

      // Save updated plan
      await setSemesterPlan(unitId, {
        ...plan,
        weekPlans: updatedWeekPlans
      });

      // Save attendance session to backend API
      const response = await fetch(`${API_BASE_URL}/api/semester-plans/${unitId}/attendance`, {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: attendanceSession.title,
          description: attendanceSession.description,
          date: attendanceSession.date.toISOString(),
          time: `${attendanceSession.startTime} - ${attendanceSession.endTime}`,
          venue: attendanceSession.venue,
          weekNumber: weekNumber
        })
      });

      if (response.ok) {
        const savedSession = await response.json();
        console.log('Attendance session saved to backend:', savedSession);

        // Sync to lecturer dashboard
        await fetch(`${API_BASE_URL}/api/lecturer/dashboard/attendance`, {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            attendanceSessionId: savedSession.sessionId,
            unitId: unitId,
            lecturerId: user?.id
          })
        });

        // Sync to student dashboards
        await syncAttendanceToStudents(unitId, savedSession.sessionId);
      }

      console.log(`Attendance session activated and synced to dashboards for unit ${unitId}, week ${weekNumber}`);
    } catch (error) {
      console.error('Failed to activate attendance:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add online class within semester plan
  const addOnlineClass = async (unitId: string, weekNumber: number, classData: {
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
    platform: 'zoom' | 'teams' | 'meet' | 'bbb' | 'other';
    meetingLink: string;
    meetingId?: string;
    passcode?: string;
    instructions?: string;
  }) => {
    try {
      setIsLoading(true);
      
      // Create online class object
      const onlineClass = {
        id: `online-class-${Date.now()}`,
        title: classData.title,
        description: classData.description,
        date: classData.date,
        startTime: classData.startTime,
        endTime: classData.endTime,
        platform: classData.platform,
        meetingLink: classData.meetingLink,
        meetingId: classData.meetingId,
        passcode: classData.passcode,
        instructions: classData.instructions,
        isActive: true,
        createdAt: new Date(),
        unitId: unitId,
        weekNumber: weekNumber,
        type: 'online-class' as const
      };

      // Update the semester plan with online class
      const plan = await getSemesterPlan(unitId);
      const updatedWeekPlans = plan.weekPlans.map(week => {
        if (week.weekNumber === weekNumber) {
          return {
            ...week,
            onlineClasses: [
              ...(week.onlineClasses || []),
              onlineClass
            ]
          };
        }
        return week;
      });

      // Save updated plan
      await setSemesterPlan(unitId, {
        ...plan,
        weekPlans: updatedWeekPlans
      });

      // Save online class to backend API
      const response = await fetch(`${API_BASE_URL}/api/semester-plans/${unitId}/online-classes`, {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: onlineClass.title,
          description: onlineClass.description,
          date: onlineClass.date.toISOString(),
          time: `${onlineClass.startTime} - ${onlineClass.endTime}`,
          platform: onlineClass.platform,
          meetingLink: onlineClass.meetingLink,
          meetingId: onlineClass.meetingId,
          passcode: onlineClass.passcode,
          instructions: onlineClass.instructions,
          weekNumber: weekNumber
        })
      });

      if (response.ok) {
        const savedClass = await response.json();
        console.log('Online class saved to backend:', savedClass);

        // Sync to lecturer dashboard
        await fetch(`${API_BASE_URL}/api/lecturer/dashboard/online-classes`, {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            onlineClassId: savedClass.classId,
            unitId: unitId,
            lecturerId: user?.id
          })
        });

        // Sync to student dashboards
        await syncOnlineClassToStudents(unitId, savedClass.classId);
      }

      console.log(`Online class added and synced to dashboards for unit ${unitId}, week ${weekNumber}`);
    } catch (error) {
      console.error('Failed to add online class:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SemesterPlanContext.Provider
      value={{
        semesterPlans,
        setSemesterPlan,
        getSemesterPlan,
        clearSemesterPlan,
        addDocumentToMaterial,
        addDocumentToAssignment,
        removeDocument,
        addExamQuestion,
        updateExamQuestion,
        removeExamQuestion,
        submitExamForApproval,
        approveExam,
        rejectExam,
        getStudentSemesterPlan,
        addMaterialToSemesterPlan,
        addAssignmentToSemesterPlan,
        addExamToSemesterPlan,
        hasSemesterPlan,
        getSemesterProgress,
        activateAttendance,
        addOnlineClass,
        isLoading
      }}
    >
      {children}
    </SemesterPlanContext.Provider>
  );
};

export type { WeekPlan, WeeklyMaterial, WeeklyAssignment, WeeklyExam, WeeklyDocument, ExamQuestion, AttendanceSession, OnlineClass };
