// AWS Lambda integration for secure file uploads
// This file calls AWS Lambda functions instead of Firebase Functions
import { getAuth } from 'firebase/auth';

interface SignedUrlResponse {
  uploadUrl: string;
  uploadFields: Record<string, string>;
  fileUrl: string;
  key: string;
}

// Configuration for AWS Lambda API Gateway
const LAMBDA_API_BASE_URL = import.meta.env.VITE_AWS_LAMBDA_API_URL || 'https://your-api-gateway-url.execute-api.region.amazonaws.com/prod';

/**
 * Secure file upload using Firebase Auth + AWS Lambda + S3 Signed URLs
 * This follows the pattern: Auth → AWS Lambda → Signed URL → Direct S3 Upload
 */
export async function uploadFileSecurely(
  file: File, 
  folder: string = 'uploads'
): Promise<string> {
  try {
    // Step 1: Get Firebase ID Token for authentication
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }
    
    const idToken = await user.getIdToken();
    
    // Step 2: Request signed URL from AWS Lambda
    console.log('Requesting signed URL for:', file.name, file.type);
    
    const response = await fetch(`${LAMBDA_API_BASE_URL}/generate-signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` // Firebase ID token for auth
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder: folder,
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }
    
    const result: SignedUrlResponse = await response.json();
    const { uploadUrl, uploadFields, fileUrl } = result;
    
    // Step 3: Upload file directly to S3 using signed URL
    const formData = new FormData();
    
    // Add all the required fields from the presigned POST
    Object.entries(uploadFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Add the file last (this is important for S3)
    formData.append('file', file);
    
    console.log('Uploading file to S3...');
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`S3 upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    
    console.log('File uploaded successfully to:', fileUrl);
    return fileUrl;
    
  } catch (error) {
    console.error('Secure upload failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload file securely'
    );
  }
}

/**
 * Upload profile picture securely
 */
export async function uploadProfilePictureSecurely(
  file: File, 
  userId: string
): Promise<string> {
  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }
  
  return uploadFileSecurely(file, `profile-pictures/${userId}`);
}

/**
 * Upload student document securely
 */
export async function uploadStudentDocumentSecurely(
  file: File, 
  studentId: string
): Promise<string> {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF, images, and Word documents are allowed');
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
  
  return uploadFileSecurely(file, `student-documents/${studentId}`);
}

/**
 * Upload course material securely
 */
export async function uploadCourseMaterialSecurely(
  file: File, 
  courseId: string
): Promise<string> {
  const maxSize = 50 * 1024 * 1024; // 50MB for course materials
  if (file.size > maxSize) {
    throw new Error('File size must be less than 50MB');
  }
  
  return uploadFileSecurely(file, `course-materials/${courseId}`);
}
