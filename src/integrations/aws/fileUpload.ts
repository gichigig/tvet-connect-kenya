import { uploadFileToS3, getSignedUrlForFile, deleteFileFromS3 } from '../aws/storage';
import { extractS3KeyFromUrl, validateProfilePicture, generateUniqueFilename } from './utils';

/**
 * Upload student document to S3
 */
export async function uploadStudentDocument(file: File, studentId: string): Promise<string> {
  const filename = generateUniqueFilename(file.name, studentId);
  const result = await uploadFileToS3(file, 'STUDENT_DOCUMENTS', filename);
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Failed to upload document');
  }
  
  return result.url;
}

/**
 * Upload profile picture to S3 and delete previous one if it exists
 */
export async function uploadProfilePicture(file: File, userId: string, previousImageUrl?: string): Promise<string> {
  // Validate the file first
  const validation = validateProfilePicture(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = file.name.split('.').pop();
  const filename = `${userId}_profile_${Date.now()}.${fileExtension}`;
  
  // Upload new profile picture
  const result = await uploadFileToS3(file, 'PROFILE_PICTURES', filename);
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Failed to upload profile picture');
  }
  
  // Delete previous profile picture if it exists
  if (previousImageUrl && previousImageUrl !== result.url) {
    const previousKey = extractS3KeyFromUrl(previousImageUrl);
    if (previousKey) {
      try {
        await deleteFileFromS3(previousKey);
        console.log('Previous profile picture deleted:', previousKey);
      } catch (error) {
        console.warn('Failed to delete previous profile picture:', error);
        // Don't throw error - new upload was successful
      }
    }
  }
  
  return result.url;
}

/**
 * Upload exam material to S3
 */
export async function uploadExamMaterial(file: File, examId: string): Promise<string> {
  const filename = generateUniqueFilename(file.name, examId);
  const result = await uploadFileToS3(file, 'EXAM_MATERIALS', filename);
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Failed to upload exam material');
  }
  
  return result.url;
}

/**
 * Get a temporary signed URL for accessing a private file
 */
export async function getTemporaryFileUrl(s3Key: string, expiresInHours: number = 1): Promise<string> {
  const expiresInSeconds = expiresInHours * 60 * 60;
  return await getSignedUrlForFile(s3Key, expiresInSeconds);
}

/**
 * Delete a file from S3
 */
export async function deleteFile(s3Key: string): Promise<boolean> {
  return await deleteFileFromS3(s3Key);
}

/**
 * Delete profile picture from S3 using the URL
 */
export async function deleteProfilePicture(imageUrl: string): Promise<boolean> {
  const s3Key = extractS3KeyFromUrl(imageUrl);
  if (!s3Key) {
    console.warn('Could not extract S3 key from URL:', imageUrl);
    return false;
  }
  
  return await deleteFileFromS3(s3Key);
}
