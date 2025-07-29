import { useState } from 'react';
import { uploadFileToS3, S3_FOLDERS } from '../integrations/aws';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    url: null,
  });

  const uploadFile = async (
    file: File,
    folder: keyof typeof S3_FOLDERS,
    filename?: string
  ) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      url: null,
    });

    try {
      // Simulate progress (S3 SDK doesn't provide real-time progress for browser uploads)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await uploadFileToS3(file, folder, filename);

      clearInterval(progressInterval);

      if (result.success && result.url) {
        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          url: result.url,
        });
        return result.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        url: null,
      });
      throw error;
    }
  };

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      url: null,
    });
  };

  return {
    ...uploadState,
    uploadFile,
    resetUpload,
  };
}
