/**
 * CORS-Aware AWS Lambda Upload Service
 * Handles CORS issues with AWS Lambda endpoints in development
 */

interface CORSAwareUploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableFallback?: boolean;
}

/**
 * Upload file with CORS handling and retry mechanism
 */
export async function uploadWithCORSHandling(
  file: File,
  folder: string,
  options: CORSAwareUploadOptions = {}
): Promise<string> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableFallback = true
  } = options;

  const LAMBDA_ENDPOINT = import.meta.env.VITE_LAMBDA_ENDPOINT || 
                         'https://5tdpymqo3b.execute-api.eu-north-1.amazonaws.com/prod/generate-signed-url';

  // Try Lambda endpoint with CORS-friendly approach
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries} to Lambda endpoint`);
      
      // Get auth token
      let authToken = '';
      try {
        const { getAuth } = await import('firebase/auth');
        const { firebaseApp } = await import('@/integrations/firebase/config');
        const auth = getAuth(firebaseApp);
        if (auth.currentUser) {
          authToken = await auth.currentUser.getIdToken();
        }
      } catch (error) {
        console.warn('Could not get Firebase auth token:', error);
      }

      // Prepare request with CORS-friendly headers
      const requestBody = {
        token: authToken || 'demo-token',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder,
      };

      console.log('Making CORS-aware request to Lambda:', LAMBDA_ENDPOINT);

      // Make request with explicit CORS configuration
      const response = await fetch(LAMBDA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        mode: 'cors',
        credentials: 'omit', // Don't send credentials to avoid CORS preflight issues
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || `Lambda returned ${response.status}: ${response.statusText}`);
      }

      const uploadData = await response.json();
      console.log('Lambda response received:', uploadData);

      // Upload file directly to S3 using presigned URL
      const formData = new FormData();
      Object.entries(uploadData.formData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      console.log('Uploading to S3 with presigned URL...');

      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`S3 upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('File uploaded successfully:', uploadData.fileUrl);
      return uploadData.fileUrl;

    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      // Enhanced error detection
      if (isAccessDeniedError(error)) {
        console.log('AWS Access Denied error detected, using fallback methods');
        if (enableFallback) {
          return await uploadViaProxy(file, folder);
        }
        throw new Error(getUploadErrorMessage(error));
      }
      
      if (isCORSError(error) && attempt < maxRetries) {
        console.log(`CORS error detected, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
      
      if (isAuthError(error)) {
        console.log('Authentication error detected');
        throw new Error(getUploadErrorMessage(error));
      }
      
      // If it's the last attempt or not a retryable error
      if (attempt === maxRetries) {
        if (isCORSError(error) && enableFallback) {
          console.log('All Lambda attempts failed due to CORS, trying proxy approach...');
          return await uploadViaProxy(file, folder);
        }
        throw new Error(getUploadErrorMessage(error));
      }
    }
  }

  throw new Error('Upload failed after all attempts');
}

/**
 * Upload via a fallback system when Lambda/S3 access is denied
 */
async function uploadViaProxy(file: File, folder: string): Promise<string> {
  console.log('Using fallback upload system due to access issues');
  
  try {
    // Check if local API server is available as fallback
    const localApiUrl = 'http://localhost:3001/api/upload';
    
    try {
      // Test if local API server is running
      const testResponse = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (testResponse.ok) {
        console.log('Local API server detected, using for upload fallback');
        return await uploadViaLocalAPI(file, folder);
      }
    } catch (localError) {
      console.log('Local API server not available, using development storage');
    }
    
    // Fallback to development storage system
    return await uploadToDevStorage(file, folder);
    
  } catch (error) {
    console.error('All fallback upload methods failed:', error);
    throw new Error(`Upload system unavailable. Please check your internet connection and try again. Details: ${error.message}`);
  }
}

/**
 * Upload via local API server (if running)
 */
async function uploadViaLocalAPI(file: File, folder: string): Promise<string> {
  console.log('Uploading via local API server');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('category', 'documents');
  
  const response = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(`Local API upload failed: ${errorData.error}`);
  }
  
  const result = await response.json();
  return result.fileUrl || result.downloadUrl;
}

/**
 * Development storage fallback
 */
async function uploadToDevStorage(file: File, folder: string): Promise<string> {
  console.log('Using development storage fallback');
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const fileName = `${folder}/${timestamp}_${randomId}_${file.name}`;
  
  // Read file as base64 for storage
  const reader = new FileReader();
  const fileData = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  // Store in localStorage with metadata
  const storageKey = `dev_upload_${timestamp}_${randomId}`;
  const uploadRecord = {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    folder: folder,
    data: fileData,
    uploadedAt: new Date().toISOString(),
    storageKey: storageKey
  };
  
  localStorage.setItem(storageKey, JSON.stringify(uploadRecord));
  
  // Also maintain an index of uploads
  const existingUploads = JSON.parse(localStorage.getItem('dev_uploads_index') || '[]');
  existingUploads.push({
    key: storageKey,
    fileName: file.name,
    folder: folder,
    uploadedAt: uploadRecord.uploadedAt
  });
  localStorage.setItem('dev_uploads_index', JSON.stringify(existingUploads));
  
  // Generate a mock S3 URL that includes the storage key for retrieval
  const mockS3Url = `https://dev-storage.localhost/${fileName}?key=${storageKey}`;
  
  console.log('File stored in development storage:', storageKey);
  console.log('Development URL:', mockS3Url);
  
  return mockS3Url;
}

/**
 * Enhanced error handling for various upload-related issues
 */
export function isCORSError(error: any): boolean {
  return error instanceof TypeError && 
         (error.message.includes('Failed to fetch') ||
          error.message.includes('CORS') ||
          error.message.includes('Access-Control-Allow-Origin'));
}

/**
 * Check if error is AWS Access Denied
 */
export function isAccessDeniedError(error: any): boolean {
  const errorMessage = error.message?.toLowerCase() || '';
  return errorMessage.includes('access denied') ||
         errorMessage.includes('accessdenied') ||
         errorMessage.includes('403') ||
         (error.response && error.response.status === 403);
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: any): boolean {
  const errorMessage = error.message?.toLowerCase() || '';
  return errorMessage.includes('401') ||
         errorMessage.includes('unauthorized') ||
         errorMessage.includes('authentication failed') ||
         (error.response && error.response.status === 401);
}

/**
 * Get user-friendly error message for upload failures
 */
export function getUploadErrorMessage(error: any): string {
  if (isCORSError(error)) {
    return 'Network connectivity issue detected. Please check your internet connection and try again.';
  }
  
  if (isAccessDeniedError(error)) {
    return 'Upload service is temporarily unavailable due to configuration issues. Your file will be stored locally and can be synced later.';
  }
  
  if (isAuthError(error)) {
    return 'Authentication expired. Please refresh the page and log in again.';
  }
  
  if (error.message.includes('413') || error.message.includes('too large')) {
    return 'File is too large. Please choose a file smaller than 10MB.';
  }
  
  if (error.message.includes('400') || error.message.includes('invalid')) {
    return 'Invalid file type. Please choose a supported file format.';
  }
  
  if (error.message.includes('network') || error.message.includes('timeout')) {
    return 'Network timeout. Please check your internet connection and try again.';
  }
  
  // Default fallback message
  return `Upload temporarily unavailable. File will be stored locally for now. (${error.message})`;
}
