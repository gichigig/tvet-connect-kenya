import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DraftData {
  assignmentId: string;
  title: string;
  content: string;
  lastSaved: Date | null;
  wordCount: number;
  charCount: number;
}

interface GradeVaultSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  unitId: string;
  unitCode: string;
  submissionType: 'essay' | 'document';
  content?: string;
  title?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt: Date;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  aiCheckResult?: any;
  wordCount?: number;
  gradeStatus: 'pending' | 'graded' | 'approved' | 'returned';
  lecturerId?: string;
  maxMarks?: number;
  hodApprovalRequired: boolean;
  gradingWorkflow: {
    stage: 'submitted' | 'grading' | 'graded' | 'hod_review' | 'approved' | 'returned';
    lecturer: {
      graded: boolean;
      gradedAt: Date | null;
      gradedBy: string | null;
      marks: number | null;
      feedback: string | null;
    };
    hod: {
      approved: boolean;
      approvedAt: Date | null;
      approvedBy: string | null;
      comments: string | null;
      requiresRevision?: boolean;
    };
  };
}

interface UseAssignmentWorkflowReturn {
  drafts: { [assignmentId: string]: DraftData };
  submissions: GradeVaultSubmission[];
  saveDraft: (draftData: DraftData) => void;
  getDraft: (assignmentId: string) => DraftData | null;
  deleteDraft: (assignmentId: string) => void;
  submitToGradeVault: (submissionData: any) => Promise<void>;
  getSubmissionStatus: (assignmentId: string) => GradeVaultSubmission | null;
  syncWithGradeVault: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const GRADE_VAULT_API = import.meta.env.VITE_GRADE_VAULT_API || 'http://localhost:3002';

export const useAssignmentWorkflow = (): UseAssignmentWorkflowReturn => {
  const { user, createdUnits } = useAuth();
  const [drafts, setDrafts] = useState<{ [assignmentId: string]: DraftData }>({});
  const [submissions, setSubmissions] = useState<GradeVaultSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load drafts from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedDrafts = localStorage.getItem(`assignment_drafts_${user.id}`);
      if (savedDrafts) {
        try {
          const parsedDrafts = JSON.parse(savedDrafts);
          // Convert lastSaved strings back to Date objects
          Object.keys(parsedDrafts).forEach(key => {
            if (parsedDrafts[key].lastSaved) {
              parsedDrafts[key].lastSaved = new Date(parsedDrafts[key].lastSaved);
            }
          });
          setDrafts(parsedDrafts);
        } catch (error) {
          console.error('Failed to load drafts:', error);
        }
      }
    }
  }, [user]);

  // Load submissions from grade-vault on mount
  useEffect(() => {
    if (user) {
      syncWithGradeVault();
    }
  }, [user]);

  const saveDraft = (draftData: DraftData) => {
    if (!user) return;

    const updatedDrafts = {
      ...drafts,
      [draftData.assignmentId]: {
        ...draftData,
        lastSaved: new Date()
      }
    };

    setDrafts(updatedDrafts);
    
    // Save to localStorage
    localStorage.setItem(`assignment_drafts_${user.id}`, JSON.stringify(updatedDrafts));
  };

  const getDraft = (assignmentId: string): DraftData | null => {
    return drafts[assignmentId] || null;
  };

  const deleteDraft = (assignmentId: string) => {
    if (!user) return;

    const updatedDrafts = { ...drafts };
    delete updatedDrafts[assignmentId];
    setDrafts(updatedDrafts);
    
    // Update localStorage
    localStorage.setItem(`assignment_drafts_${user.id}`, JSON.stringify(updatedDrafts));
  };

  const submitToGradeVault = async (submissionData: any): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Try to resolve unit details (to set lecturerId reliably)
      let unitCode = submissionData.unitCode || '';
      let lecturerId: string | undefined = submissionData.lecturerId;
      const targetUnit = createdUnits?.find((u: any) => u.id === submissionData.unitId || u.code === submissionData.unitCode);
      if (targetUnit) {
        unitCode = targetUnit.code;
        lecturerId = targetUnit.lecturerId;
      }

      // Prepare submission for grade-vault integration
      const gradeVaultSubmission: GradeVaultSubmission = {
        id: submissionData.id,
        assignmentId: submissionData.assignmentId,
        studentId: user.id,
        studentName: `${user.firstName} ${user.lastName}`,
        unitId: submissionData.unitId || '',
        unitCode: unitCode || submissionData.unitCode || '',
        submissionType: submissionData.submissionType,
        content: submissionData.content,
        title: submissionData.title,
        fileName: submissionData.fileName,
        fileSize: submissionData.fileSize,
        submittedAt: new Date(),
        status: submissionData.status || 'submitted',
        aiCheckResult: submissionData.aiCheckResult,
        wordCount: submissionData.wordCount,
        gradeStatus: 'pending',
        lecturerId,
        maxMarks: submissionData.maxMarks,
        hodApprovalRequired: submissionData.hodApprovalRequired || false,
        gradingWorkflow: {
          stage: 'submitted',
          lecturer: {
            graded: false,
            gradedAt: null,
            gradedBy: null,
            marks: null,
            feedback: null
          },
          hod: {
            approved: false,
            approvedAt: null,
            approvedBy: null,
            comments: null
          }
        }
      };

      // Enhanced backend storage: Store in Firebase and S3
      try {
        // Store submission data in Firebase Firestore
        const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const db = getFirestore();
        
        // Generate unique submission ID
        const submissionId = `${user.id}_${gradeVaultSubmission.assignmentId}_${Date.now()}`;
        gradeVaultSubmission.id = submissionId;
        
        // Prepare submission document for Firebase
        const submissionDoc = {
          id: submissionId,
          assignmentId: gradeVaultSubmission.assignmentId,
          studentId: gradeVaultSubmission.studentId,
          studentName: gradeVaultSubmission.studentName,
          unitId: gradeVaultSubmission.unitId,
          unitCode: gradeVaultSubmission.unitCode,
          submissionType: gradeVaultSubmission.submissionType,
          content: gradeVaultSubmission.content,
          title: gradeVaultSubmission.title,
          fileName: gradeVaultSubmission.fileName,
          fileSize: gradeVaultSubmission.fileSize,
          submittedAt: serverTimestamp(),
          status: gradeVaultSubmission.status,
          wordCount: gradeVaultSubmission.wordCount,
          gradeStatus: gradeVaultSubmission.gradeStatus,
          lecturerId: gradeVaultSubmission.lecturerId,
          maxMarks: gradeVaultSubmission.maxMarks,
          hodApprovalRequired: gradeVaultSubmission.hodApprovalRequired,
          workflowStage: gradeVaultSubmission.gradingWorkflow.stage,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Store in Firebase
        await setDoc(doc(db, 'assignment_submissions', submissionId), submissionDoc);
        console.log('Assignment stored in Firebase successfully:', submissionId);

        // If there's a file, upload to S3
        if (submissionData.file && submissionData.file instanceof File) {
          try {
            // Upload file to S3 (using presigned URL or direct upload)
            const formData = new FormData();
            formData.append('file', submissionData.file);
            formData.append('submissionId', submissionId);
            formData.append('studentId', user.id);
            formData.append('assignmentId', gradeVaultSubmission.assignmentId);

            const uploadResponse = await fetch('/api/upload-assignment', {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              }
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              
              // Update Firebase document with S3 URL
              await setDoc(doc(db, 'assignment_submissions', submissionId), {
                ...submissionDoc,
                fileUrl: uploadResult.fileUrl,
                s3Key: uploadResult.s3Key,
                updatedAt: serverTimestamp()
              });
              
              console.log('File uploaded to S3 successfully:', uploadResult.fileUrl);
            } else {
              console.warn('Failed to upload file to S3');
            }
          } catch (uploadError) {
            console.warn('File upload to S3 failed:', uploadError);
          }
        }

      } catch (firebaseError) {
        console.warn('Firebase storage failed, continuing with local storage:', firebaseError);
      }

      // Send notification to grade-vault system (as external notification, not direct API call)
      try {
        // Instead of calling grade-vault API directly, we can send a webhook notification
        // or store a notification record that grade-vault can poll for
        const notificationData = {
          type: 'assignment_submission',
          submissionId: gradeVaultSubmission.id,
          studentId: user.id,
          assignmentId: gradeVaultSubmission.assignmentId,
          unitCode: gradeVaultSubmission.unitCode,
          submittedAt: gradeVaultSubmission.submittedAt.toISOString(),
          lecturerId: gradeVaultSubmission.lecturerId
        };

        // Store notification in Firebase for grade-vault to poll
        const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const db = getFirestore();
        
        await setDoc(doc(db, 'grade_vault_notifications', gradeVaultSubmission.id), {
          ...notificationData,
          processed: false,
          createdAt: serverTimestamp()
        });
        
        console.log('Notification sent to grade-vault system');
      } catch (notificationError) {
        console.warn('Failed to send notification to grade-vault:', notificationError);
      }
      
      // Always store locally for offline access and backup
      // Per-student store (existing behavior)
      const existingSubmissions = localStorage.getItem(`submissions_${user.id}`);
      const studentSubs = existingSubmissions ? JSON.parse(existingSubmissions) : [];
      studentSubs.push(gradeVaultSubmission);
      localStorage.setItem(`submissions_${user.id}`, JSON.stringify(studentSubs));
      
      // Global store for lecturer visibility
      const allKey = 'grade_vault_submissions';
      const allRaw = localStorage.getItem(allKey);
      const allSubs = allRaw ? JSON.parse(allRaw) : [];
      allSubs.push(gradeVaultSubmission);
      localStorage.setItem(allKey, JSON.stringify(allSubs));

      // Update local submissions
      setSubmissions(prev => [...prev, gradeVaultSubmission]);

      // Delete draft after successful submission
      deleteDraft(submissionData.assignmentId);

      console.log('Assignment submitted to grade-vault workflow:', gradeVaultSubmission);

    } catch (error) {
      console.error('Failed to submit to grade-vault:', error);
      setError('Failed to submit assignment. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissionStatus = (assignmentId: string): GradeVaultSubmission | null => {
    return submissions.find(s => s.assignmentId === assignmentId) || null;
  };

  const syncWithGradeVault = async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load submissions from Firebase Firestore
      try {
        const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
        const db = getFirestore();
        
        // Query submissions for current student
        const submissionsRef = collection(db, 'assignment_submissions');
        const q = query(submissionsRef, where('studentId', '==', user.id));
        const querySnapshot = await getDocs(q);
        
        const firebaseSubmissions: GradeVaultSubmission[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firebaseSubmissions.push({
            id: data.id,
            assignmentId: data.assignmentId,
            studentId: data.studentId,
            studentName: data.studentName,
            unitId: data.unitId,
            unitCode: data.unitCode,
            submissionType: data.submissionType,
            content: data.content,
            title: data.title,
            fileName: data.fileName,
            fileSize: data.fileSize,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            status: data.status,
            aiCheckResult: data.aiCheckResult,
            wordCount: data.wordCount,
            gradeStatus: data.gradeStatus,
            lecturerId: data.lecturerId,
            maxMarks: data.maxMarks,
            hodApprovalRequired: data.hodApprovalRequired,
            gradingWorkflow: {
              stage: data.workflowStage || 'submitted',
              lecturer: {
                graded: false,
                gradedAt: null,
                gradedBy: null,
                marks: null,
                feedback: null
              },
              hod: {
                approved: false,
                approvedAt: null,
                approvedBy: null,
                comments: null
              }
            }
          });
        });
        
        setSubmissions(firebaseSubmissions);
        console.log('Loaded submissions from Firebase:', firebaseSubmissions.length);
        
      } catch (firebaseError) {
        console.warn('Failed to load from Firebase, falling back to localStorage:', firebaseError);
        
        // Fallback to localStorage (prefer per-student store; if absent, derive from global)
        const localSubmissions = localStorage.getItem(`submissions_${user.id}`) || localStorage.getItem('grade_vault_submissions');
        if (localSubmissions) {
          const parsedSubmissions = JSON.parse(localSubmissions);
          // Filter to this student if using global store
          const filtered = Array.isArray(parsedSubmissions)
            ? parsedSubmissions.filter((s: any) => s.studentId === user.id)
            : [];
          const toUse = localSubmissions?.includes('grade_vault_submissions') ? filtered : parsedSubmissions;
          // Convert date strings back to Date objects
          (toUse || []).forEach((sub: any) => {
            sub.submittedAt = new Date(sub.submittedAt);
            if (sub.gradingWorkflow?.lecturer?.gradedAt) {
              sub.gradingWorkflow.lecturer.gradedAt = new Date(sub.gradingWorkflow.lecturer.gradedAt);
            }
            if (sub.gradingWorkflow?.hod?.approvedAt) {
              sub.gradingWorkflow.hod.approvedAt = new Date(sub.gradingWorkflow.hod.approvedAt);
            }
          });
          setSubmissions(toUse || []);
        }
      }
    } catch (error) {
      console.error('Failed to sync submissions:', error);
      setError('Failed to load assignment submissions');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    drafts,
    submissions,
    saveDraft,
    getDraft,
    deleteDraft,
    submitToGradeVault,
    getSubmissionStatus,
    syncWithGradeVault,
    isLoading,
    error
  };
};

export default useAssignmentWorkflow;
