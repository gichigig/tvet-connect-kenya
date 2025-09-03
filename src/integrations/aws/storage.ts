import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload a file to S3
 */
export async function uploadFileToS3(
  file: File,
  folder: keyof typeof S3_FOLDERS,
  filename?: string
): Promise<UploadResult> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = filename || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const key = `${S3_FOLDERS[folder]}${fileName}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
      ACL: 'private', // Files are private by default
    });

    await s3Client.send(command);

    // Generate the file URL
    const url = `https://${S3_BUCKET_NAME}.s3.${s3Client.config.region}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload a blob to S3 (for screen recordings, violation images)
 */
export async function uploadBlobToS3(
  blob: Blob,
  folder: keyof typeof S3_FOLDERS,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const key = `${S3_FOLDERS[folder]}${filename}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: blob,
      ContentType: contentType,
      ACL: 'private',
    });

    await s3Client.send(command);

    const url = `https://${S3_BUCKET_NAME}.s3.${s3Client.config.region}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('Error uploading blob to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get a signed URL for accessing a private file
 */
export async function getSignedUrlForFile(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
}

/**
 * Upload violation image to S3
 */
export async function uploadViolationImage(
  imageBlob: Blob,
  sessionId: string,
  violationType: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  const filename = `${sessionId}_${violationType}_${timestamp}.jpg`;
  
  return uploadBlobToS3(imageBlob, 'VIOLATION_IMAGES', filename, 'image/jpeg');
}

/**
 * Upload screen recording to S3
 */
export async function uploadScreenRecording(
  recordingBlob: Blob,
  sessionId: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  const filename = `${sessionId}_recording_${timestamp}.webm`;
  
  return uploadBlobToS3(recordingBlob, 'SCREEN_RECORDINGS', filename, 'video/webm');
}
