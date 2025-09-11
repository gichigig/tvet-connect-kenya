// File upload service using Supabase Storage (replacing AWS S3)
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface UploadOptions {
  bucket: string;
  folder?: string;
  fileName?: string;
  allowedTypes?: string[];
  maxSizeBytes?: number;
  upsert?: boolean;
  cacheControl?: string;
}

const DEFAULT_OPTIONS: Partial<UploadOptions> = {
  bucket: 'uploads',
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  upsert: false,
  cacheControl: '3600'
};

/**
 * Validate file before upload
 */
const validateFile = (file: File, options: UploadOptions): string | null => {
  // Check file size
  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    return `File size exceeds ${(options.maxSizeBytes / 1024 / 1024).toFixed(1)}MB limit`;
  }

  // Check file type
  if (options.allowedTypes && options.allowedTypes.length > 0) {
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    const isTypeAllowed = options.allowedTypes.some(allowedType => {
      if (allowedType.startsWith('.')) {
        return fileExtension === allowedType.substring(1);
      }
      return fileType === allowedType || fileType.startsWith(allowedType);
    });

    if (!isTypeAllowed) {
      return `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`;
    }
  }

  return null;
};

/**
 * Generate unique file name
 */
const generateFileName = (originalName: string, customName?: string): string => {
  if (customName) {
    const extension = originalName.split('.').pop();
    return extension ? `${customName}.${extension}` : customName;
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `${baseName}_${timestamp}_${randomString}.${extension}`;
};

/**
 * Upload a single file to Supabase Storage
 */
export const uploadFile = async (
  file: File,
  options: Partial<UploadOptions> = {}
): Promise<UploadResult> => {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options } as UploadOptions;

  try {
    // Validate file
    const validationError = validateFile(file, finalOptions);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Generate file path
    const fileName = generateFileName(file.name, finalOptions.fileName);
    const folder = finalOptions.folder ? `${finalOptions.folder}/` : '';
    const filePath = `${folder}${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(finalOptions.bucket)
      .upload(filePath, file, {
        cacheControl: finalOptions.cacheControl,
        upsert: finalOptions.upsert
      });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(finalOptions.bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (
  files: File[],
  options: Partial<UploadOptions> = {}
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (const file of files) {
    const result = await uploadFile(file, options);
    results.push(result);
  }

  return results;
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Get file URL from Supabase Storage
 */
export const getFileUrl = (bucket: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * List files in a bucket/folder
 */
export const listFiles = async (
  bucket: string,
  folder?: string,
  limit?: number
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      return {
        success: false,
        error: error.message,
        files: []
      };
    }

    return {
      success: true,
      files: data || []
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      files: []
    };
  }
};

/**
 * Upload timetable file (specific use case)
 */
export const uploadTimetableFile = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'timetables',
    folder: 'current',
    allowedTypes: ['.pdf', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg'],
    maxSizeBytes: 50 * 1024 * 1024, // 50MB for timetables
    upsert: true
  });
};

/**
 * Upload assignment file
 */
export const uploadAssignmentFile = async (
  file: File,
  unitCode: string,
  assignmentId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'assignments',
    folder: `${unitCode}/${assignmentId}`,
    allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar'],
    maxSizeBytes: 20 * 1024 * 1024 // 20MB for assignments
  });
};

/**
 * Upload student submission
 */
export const uploadStudentSubmission = async (
  file: File,
  studentId: string,
  assignmentId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'submissions',
    folder: `${assignmentId}/${studentId}`,
    fileName: `submission_${Date.now()}`,
    allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.png', '.jpg'],
    maxSizeBytes: 50 * 1024 * 1024, // 50MB for submissions
    upsert: true
  });
};

/**
 * Upload profile photo
 */
export const uploadProfilePhoto = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'profile-photos',
    fileName: userId,
    allowedTypes: ['.png', '.jpg', '.jpeg', '.gif'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB for profile photos
    upsert: true
  });
};

/**
 * Upload document (ID, certificates, etc.)
 */
export const uploadDocument = async (
  file: File,
  studentId: string,
  documentType: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'documents',
    folder: `${studentId}/${documentType}`,
    allowedTypes: ['.pdf', '.png', '.jpg', '.jpeg'],
    maxSizeBytes: 10 * 1024 * 1024 // 10MB for documents
  });
};

/**
 * Upload student document (alias for uploadDocument)
 */
export const uploadStudentDocument = uploadDocument;

/**
 * Create signed URL for private file access
 */
export const createSignedUrl = async (
  bucket: string,
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      url: data.signedUrl
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (
  bucket: string,
  filePath: string
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        search: filePath
      });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    const file = data?.find(f => f.name === filePath.split('/').pop());
    
    return {
      success: true,
      metadata: file
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};
