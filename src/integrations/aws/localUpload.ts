// Simple local file storage for development/testing
// This stores files in browser memory as data URLs - for testing purposes only

export interface LocalFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

// In-memory storage for files (will be lost on refresh)
const localFiles = new Map<string, LocalFile>();

/**
 * Mock upload function that stores files locally for development/testing
 * This is a temporary solution while AWS upload issues are resolved
 */
export async function uploadFileLocally(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  try {
    console.log('Uploading file locally (development mode):', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      folder
    });

    // Generate unique ID
    const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Convert file to data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Store file info
    const localFile: LocalFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl,
      uploadedAt: new Date().toISOString()
    };

    localFiles.set(fileId, localFile);

    // Return a mock URL that can be used for retrieval
    const mockUrl = `local://files/${fileId}`;
    
    console.log('File stored locally:', {
      fileId,
      mockUrl,
      originalName: file.name
    });

    return mockUrl;
  } catch (error) {
    console.error('Local file storage failed:', error);
    throw new Error(`Local upload failed: ${error.message}`);
  }
}

/**
 * Course material upload using local storage
 */
export async function uploadCourseMaterialLocally(
  file: File,
  unitId: string
): Promise<string> {
  console.log(`Storing course material for unit ${unitId} locally`);
  return uploadFileLocally(file, `course-materials/${unitId}`);
}

/**
 * Retrieve a locally stored file
 */
export function getLocalFile(fileId: string): LocalFile | null {
  return localFiles.get(fileId) || null;
}

/**
 * Get file data URL from a mock URL
 */
export function getFileDataUrl(mockUrl: string): string | null {
  if (!mockUrl.startsWith('local://files/')) {
    return null;
  }
  
  const fileId = mockUrl.replace('local://files/', '');
  const file = localFiles.get(fileId);
  return file?.dataUrl || null;
}

/**
 * List all locally stored files
 */
export function listLocalFiles(): LocalFile[] {
  return Array.from(localFiles.values());
}
