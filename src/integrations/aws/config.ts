import { S3Client } from '@aws-sdk/client-s3';

// S3 Configuration
export const s3Config = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_***REMOVED*** || '',
    secretAccessKey: import.meta.env.VITE_***REMOVED*** || '',
  },
};

export const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME || 'tvet-connect-kenya';

// Create S3 client instance
export const s3Client = new S3Client(s3Config);

// S3 folder structure
export const S3_FOLDERS = {
  VIOLATION_IMAGES: 'proctoring/violations/images/',
  SCREEN_RECORDINGS: 'proctoring/violations/recordings/',
  STUDENT_DOCUMENTS: 'students/documents/',
  EXAM_MATERIALS: 'exams/materials/',
  PROFILE_PICTURES: 'users/profiles/',
} as const;
