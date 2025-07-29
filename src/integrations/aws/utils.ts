/**
 * AWS S3 utility functions
 */

/**
 * Extract S3 key from URL
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle S3 direct URLs (amazonaws.com)
    if (urlObj.hostname.includes('amazonaws.com')) {
      // Remove leading slash and decode
      return decodeURIComponent(urlObj.pathname.substring(1));
    }
    
    // Handle CloudFront URLs (if configured)
    if (urlObj.hostname.includes('cloudfront.net')) {
      return decodeURIComponent(urlObj.pathname.substring(1));
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing S3 URL:', error);
    return null;
  }
}

/**
 * Validate if URL is from S3
 */
export function isS3Url(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('amazonaws.com') || 
           urlObj.hostname.includes('cloudfront.net');
  } catch {
    return false;
  }
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const fileExtension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  if (prefix) {
    return `${prefix}_${baseName}_${timestamp}.${fileExtension}`;
  }
  
  return `${baseName}_${timestamp}.${fileExtension}`;
}

/**
 * Validate file type for uploads
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Profile picture validation
 */
export const PROFILE_PICTURE_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSizeInBytes: 5 * 1024 * 1024, // 5MB
  maxSizeInMB: 5
};

/**
 * Validate profile picture file
 */
export function validateProfilePicture(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, PROFILE_PICTURE_CONFIG.allowedTypes)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  if (!validateFileSize(file, PROFILE_PICTURE_CONFIG.maxSizeInBytes)) {
    return {
      valid: false,
      error: `File size must be less than ${PROFILE_PICTURE_CONFIG.maxSizeInMB}MB`
    };
  }
  
  return { valid: true };
}
