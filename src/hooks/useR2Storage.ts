/**
 * React Hook for Cloudflare R2 Storage
 * Provides easy-to-use functions for file upload and management
 */

import { useState, useCallback } from 'react';
import { R2StorageService, R2UploadParams, R2UploadResult, UploadProgress } from '@/services/R2StorageService';
import { useToast } from '@/hooks/use-toast';

export interface UseR2StorageOptions {
  onUploadStart?: () => void;
  onUploadComplete?: (result: R2UploadResult) => void;
  onUploadError?: (error: Error) => void;
  autoShowToasts?: boolean;
}

export interface UseR2StorageReturn {
  // State
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  uploadResult: R2UploadResult | null;
  error: Error | null;
  
  // Functions
  uploadFile: (params: R2UploadParams) => Promise<R2UploadResult>;
  downloadFile: (fileKey: string, fileName?: string) => Promise<void>;
  resetState: () => void;
  checkHealth: () => Promise<{ status: string; service: string; bucket: string }>;
  
  // Utils
  formatFileSize: (bytes: number) => string;
  getFileTypeIcon: (mimeType: string) => string;
  generateUniqueFileName: (originalName: string) => string;
}

export const useR2Storage = (options: UseR2StorageOptions = {}): UseR2StorageReturn => {
  const {
    onUploadStart,
    onUploadComplete,
    onUploadError,
    autoShowToasts = true
  } = options;

  const { toast } = useToast();

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResult, setUploadResult] = useState<R2UploadResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Reset state
  const resetState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(null);
    setUploadResult(null);
    setError(null);
  }, []);

  // Upload file
  const uploadFile = useCallback(async (params: R2UploadParams): Promise<R2UploadResult> => {
    try {
      resetState();
      setIsUploading(true);
      setError(null);
      
      onUploadStart?.();

      const result = await R2StorageService.uploadFile({
        ...params,
        onProgress: (progress) => {
          setUploadProgress(progress);
          params.onProgress?.(progress);
        }
      });

      setUploadResult(result);
      onUploadComplete?.(result);

      if (autoShowToasts) {
        toast({
          title: "Upload Successful",
          description: `${result.originalName} has been uploaded successfully.`,
          variant: "default",
        });
      }

      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setError(error);
      onUploadError?.(error);

      if (autoShowToasts) {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      }

      throw error;

    } finally {
      setIsUploading(false);
    }
  }, [onUploadStart, onUploadComplete, onUploadError, autoShowToasts, toast, resetState]);

  // Download file
  const downloadFile = useCallback(async (fileKey: string, fileName?: string): Promise<void> => {
    try {
      await R2StorageService.downloadFile(fileKey, fileName);

      if (autoShowToasts) {
        toast({
          title: "Download Started",
          description: `${fileName || 'File'} download has started.`,
          variant: "default",
        });
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed');
      
      if (autoShowToasts) {
        toast({
          title: "Download Failed",
          description: error.message,
          variant: "destructive",
        });
      }

      throw error;
    }
  }, [autoShowToasts, toast]);

  // Check health
  const checkHealth = useCallback(async () => {
    return await R2StorageService.checkHealth();
  }, []);

  // Utility functions
  const formatFileSize = useCallback((bytes: number) => {
    return R2StorageService.formatFileSize(bytes);
  }, []);

  const getFileTypeIcon = useCallback((mimeType: string) => {
    return R2StorageService.getFileTypeIcon(mimeType);
  }, []);

  const generateUniqueFileName = useCallback((originalName: string) => {
    return R2StorageService.generateUniqueFileName(originalName);
  }, []);

  return {
    // State
    isUploading,
    uploadProgress,
    uploadResult,
    error,
    
    // Functions
    uploadFile,
    downloadFile,
    resetState,
    checkHealth,
    
    // Utils
    formatFileSize,
    getFileTypeIcon,
    generateUniqueFileName
  };
};
