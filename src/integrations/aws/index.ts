// S3 Storage utilities
export * from './storage';
export * from './fileUpload';
export * from './config';

// Re-export commonly used functions
export {
  uploadFileToS3,
  uploadBlobToS3,
  getSignedUrlForFile,
  deleteFileFromS3,
  uploadViolationImage,
  uploadScreenRecording,
} from './storage';

export {
  uploadStudentDocument,
  uploadProfilePicture,
  uploadExamMaterial,
  getTemporaryFileUrl,
  deleteFile,
} from './fileUpload';
