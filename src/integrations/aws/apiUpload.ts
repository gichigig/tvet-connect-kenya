// Server-side S3 upload using API server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Upload file to S3 via API server
 * This uses the backend API server which handles S3 uploads server-side
 */
export async function uploadFileViaAPI(
  file: File,
  unitId: string,
  unitCode?: string
): Promise<string> {
  try {
    console.log('Uploading file via API server:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      unitId,
      unitCode,
      apiUrl: API_BASE_URL
    });

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unitId', unitId);
    if (unitCode) {
      formData.append('unitCode', unitCode);
    }

    // Upload to API server
    const response = await fetch(`${API_BASE_URL}/api/upload/upload-course-material`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('API upload successful:', {
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      originalName: result.originalName
    });

    return result.fileUrl;
  } catch (error) {
    console.error('API upload failed:', error);
    throw new Error(`API upload failed: ${error.message}`);
  }
}

/**
 * Course material upload using API server
 */
export async function uploadCourseMaterialViaAPI(
  file: File,
  unitId: string,
  unitCode?: string
): Promise<string> {
  console.log(`Uploading course material for unit ${unitId} via API server`);
  return uploadFileViaAPI(file, unitId, unitCode);
}

/**
 * Test API server connectivity
 */
export async function testAPIServerConnectivity(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/upload-health`);
    const data = await response.json();
    
    console.log('API server health check:', data);
    return response.ok && data.status === 'ok';
  } catch (error) {
    console.error('API server connectivity test failed:', error);
    return false;
  }
}
