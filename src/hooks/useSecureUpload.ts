import { useState } from 'react';
import { 
  uploadFileSecurely, 
  uploadProfilePictureSecurely, 
  uploadStudentDocumentSecurely, 
  uploadCourseMaterialSecurely 
} from '@/integrations/aws/secureUpload';

interface UseSecureUploadReturn {
  uploadFile: (file: File, folder?: string) => Promise<string>;
  uploadProfilePicture: (file: File, userId: string) => Promise<string>;
  uploadStudentDocument: (file: File, studentId: string) => Promise<string>;
  uploadCourseMaterial: (file: File, courseId: string) => Promise<string>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

/**
 * Hook for secure file uploads using Firebase Auth + S3 Signed URLs
 * 
 * Flow: [User Auth] → [Firebase Function] → [Signed URL] → [Direct S3 Upload]
 */
export function useSecureUpload(): UseSecureUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, folder: string = 'uploads'): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      setUploadProgress(25); // Starting upload
      const url = await uploadFileSecurely(file, folder);
      setUploadProgress(100);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after delay
    }
  };

  const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      setUploadProgress(25);
      const url = await uploadProfilePictureSecurely(file, userId);
      setUploadProgress(100);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile picture upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const uploadStudentDocument = async (file: File, studentId: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      setUploadProgress(25);
      const url = await uploadStudentDocumentSecurely(file, studentId);
      setUploadProgress(100);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Document upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const uploadCourseMaterial = async (file: File, courseId: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      setUploadProgress(25);
      const url = await uploadCourseMaterialSecurely(file, courseId);
      setUploadProgress(100);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Course material upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadFile,
    uploadProfilePicture,
    uploadStudentDocument,
    uploadCourseMaterial,
    isUploading,
    uploadProgress,
    error,
  };
}
