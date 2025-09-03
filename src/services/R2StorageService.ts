/**
 * Cloudflare R2 Storage Service
 * Handles file uploads using the backend R2 API endpoints
 */

export interface R2UploadParams {
  file: File;
  unitId?: string;
  unitCode?: string;
  fileName?: string;
  category?: 'assignment' | 'material' | 'submission' | 'notes';
  onProgress?: (progress: UploadProgress) => void;
}

export interface R2UploadResult {
  success: boolean;
  fileUrl: string;
  fileName: string;
  originalName: string;
  size: number;
  key: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class R2StorageService {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  private static readonly UPLOAD_ENDPOINT = '/api/upload/upload-course-material';
  private static readonly DOWNLOAD_ENDPOINT = '/api/upload/download';
  
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/plain', // .txt
    'text/markdown', // .md
    'image/jpeg', // .jpg
    'image/png', // .png
    'image/gif', // .gif
    'application/zip', // .zip
    'application/x-zip-compressed' // .zip alternative
  ];

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): void {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }
  }

  /**
   * Upload file to Cloudflare R2 via backend API
   */
  static async uploadFile(params: R2UploadParams): Promise<R2UploadResult> {
    const { file, unitId, unitCode, fileName, category = 'material', onProgress } = params;

    // Validate file
    this.validateFile(file);

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    if (unitId) formData.append('unitId', unitId);
    if (unitCode) formData.append('unitCode', unitCode);
    if (fileName) formData.append('fileName', fileName);
    formData.append('category', category);

    try {
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<R2UploadResult>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response: R2UploadResult = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });

        // Send request
        xhr.open('POST', `${this.API_BASE_URL}${this.UPLOAD_ENDPOINT}`);
        xhr.send(formData);
      });

    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get download URL for a file
   */
  static getDownloadUrl(fileKey: string): string {
    return `${this.API_BASE_URL}${this.DOWNLOAD_ENDPOINT}/${encodeURIComponent(fileKey)}`;
  }

  /**
   * Download file from R2
   */
  static async downloadFile(fileKey: string, fileName?: string): Promise<void> {
    try {
      const downloadUrl = this.getDownloadUrl(fileKey);
      
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'download';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if upload service is available
   */
  static async checkHealth(): Promise<{ status: string; service: string; bucket: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/upload/upload-health`);
      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a unique file name
   */
  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon based on MIME type
   */
  static getFileTypeIcon(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'application/pdf': '📄',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
      'application/vnd.ms-powerpoint': '📊',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📈',
      'application/vnd.ms-excel': '📈',
      'text/plain': '📃',
      'text/markdown': '📋',
      'image/jpeg': '🖼️',
      'image/png': '🖼️',
      'image/gif': '🖼️',
      'application/zip': '🗂️',
      'application/x-zip-compressed': '🗂️'
    };
    
    return typeMap[mimeType] || '📎';
  }
}
