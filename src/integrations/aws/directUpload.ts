// Fallback upload method using direct S3 upload for when Lambda is not available
// This is a temporary solution until Lambda API Gateway is properly configured

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Debug AWS configuration
console.log('AWS Configuration:', {
  region: import.meta.env.VITE_AWS_REGION,
  bucket: import.meta.env.VITE_S3_BUCKET_NAME,
  hasAccessKey: !!import.meta.env.VITE_***REMOVED***,
  hasSecretKey: !!import.meta.env.VITE_***REMOVED***,
  accessKeyPrefix: import.meta.env.VITE_***REMOVED***?.substring(0, 8)
});

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_***REMOVED***!,
    secretAccessKey: import.meta.env.VITE_***REMOVED***!,
  },
});

const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME || 'tvet-kenya-uploads-2024';

/**
 * Direct S3 upload as fallback when Lambda is not available
 * Note: This method exposes AWS credentials to the client, use only for development/testing
 */
export async function uploadFileDirectly(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  try {
    // Generate a unique file name to prevent collisions
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`;
    
    // Construct the S3 key (file path)
    const key = `${folder}/${uniqueFileName}`;
    
    console.log('Uploading file directly to S3:', {
      fileName: file.name,
      key,
      bucket: BUCKET_NAME,
      size: file.size
    });
    
    // Convert File to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Create the upload command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: uint8Array,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    // Upload the file
    await s3Client.send(command);
    
    // Return the file URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
    console.log('File uploaded successfully:', fileUrl);
    
    return fileUrl;
  } catch (error) {
    console.error('Direct S3 upload failed:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Course material upload using direct S3 upload
 */
export async function uploadCourseMaterialDirectly(
  file: File,
  unitId: string
): Promise<string> {
  // Use a specific folder structure for course materials
  const folder = `course-materials/${unitId}`;
  return uploadFileDirectly(file, folder);
}
