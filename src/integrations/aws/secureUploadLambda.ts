import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '@/integrations/firebase/config';

// AWS Lambda endpoint for secure uploads 
// You'll need to replace this with your actual Lambda API Gateway endpoint
const LAMBDA_ENDPOINT = import.meta.env.VITE_LAMBDA_ENDPOINT || 'https://your-api-id.execute-api.eu-north-1.amazonaws.com/prod/generate-signed-url';

interface LambdaUploadResponse {
  uploadUrl: string;
  formData: Record<string, string>;
  fileUrl: string;
  expiresIn: number;
}

/**
 * Wait for Firebase Auth to be ready and return the current user
 */
async function getCurrentUser(): Promise<any> {
  const auth = getAuth(firebaseApp);
  
  console.log('getCurrentUser - Initial auth state:', {
    hasAuth: !!auth,
    currentUser: !!auth.currentUser,
    userId: auth.currentUser?.uid
  });
  
  return new Promise((resolve, reject) => {
    // If user is already available, return immediately
    if (auth.currentUser) {
      console.log('User already available:', auth.currentUser.uid);
      resolve(auth.currentUser);
      return;
    }
    
    console.log('Waiting for auth state change...');
    
    // Otherwise wait for auth state to change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed in getCurrentUser:', !!user, user?.uid);
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User must be authenticated to upload files'));
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      console.log('Auth state timeout reached');
      unsubscribe();
      reject(new Error('Authentication timeout - please try logging in again'));
    }, 5000);
  });
}

/**
 * Secure file upload using Firebase Auth + AWS Lambda + S3 Signed URLs
 * This follows the pattern: Auth → Lambda → Signed URL → Direct S3 Upload
 */
export async function uploadFileSecurely(
  file: File, 
  folder: string = 'uploads',
  token?: string
): Promise<string> {
  try {
    let authToken = token;
    
    // If no token provided, try to get it from Firebase Auth
    if (!authToken) {
      try {
        const user = await getCurrentUser();
        console.log('Firebase Auth check:', {
          hasUser: !!user,
          userId: user?.uid,
          userEmail: user?.email
        });
        authToken = await user.getIdToken();
      } catch (error) {
        console.warn('Firebase Auth not available, proceeding without token:', error);
        // Continue without token - let the Lambda decide if it's acceptable
      }
    }
    
    console.log('Requesting signed URL for:', file.name, file.type, {
      hasToken: !!authToken,
      tokenLength: authToken ? authToken.length : 0,
      endpoint: LAMBDA_ENDPOINT
    });
    
    // Step 2: Request signed URL from AWS Lambda
    console.log('Making request to Lambda endpoint:', LAMBDA_ENDPOINT);
    
    let response;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if we have a token
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Add CORS headers for preflight requests
      headers['Access-Control-Request-Method'] = 'POST';
      headers['Access-Control-Request-Headers'] = 'Content-Type, Authorization';

      response = await fetch(LAMBDA_ENDPOINT, {
        method: 'POST',
        headers,
        mode: 'cors', // Explicitly enable CORS
        body: JSON.stringify({
          token: authToken,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          folder,
        }),
      });
    } catch (fetchError) {
      console.error('Network error when calling Lambda:', fetchError);
      throw new Error(`Network error: ${fetchError.message}. Check if Lambda endpoint is accessible: ${LAMBDA_ENDPOINT}`);
    }

    console.log('Lambda response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('Lambda response not OK:', response.status, response.statusText);
      let errorData;
      try {
        errorData = await response.json();
        console.error('Lambda error response:', errorData);
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.error || `Lambda returned ${response.status}: ${response.statusText}`);
    }

    let uploadData: LambdaUploadResponse;
    try {
      uploadData = await response.json();
      console.log('Lambda response data:', uploadData);
    } catch (parseError) {
      console.error('Could not parse Lambda response:', parseError);
      throw new Error('Invalid response from Lambda function');
    }
    
    // Step 3: Upload file directly to S3 using signed URL
    const formData = new FormData();
    
    // Add all the required fields from the presigned POST
    Object.entries(uploadData.formData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Add the file last (this is important for S3)
    formData.append('file', file);
    
    console.log('Uploading file to S3...');
    
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`S3 upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    
    console.log('File uploaded successfully to:', uploadData.fileUrl);
    return uploadData.fileUrl;
    
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
  
  return uploadFileSecurely(file, `profile-pictures`);
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
  
  return uploadFileSecurely(file, `student-documents`);
}

/**
 * Upload course material securely
 */
export async function uploadCourseMaterialSecurely(
  file: File, 
  courseId: string,
  token?: string
): Promise<string> {
  const maxSize = 50 * 1024 * 1024; // 50MB for course materials
  if (file.size > maxSize) {
    throw new Error('File size must be less than 50MB');
  }
  
  return uploadFileSecurely(file, `course-materials`, token);
}
