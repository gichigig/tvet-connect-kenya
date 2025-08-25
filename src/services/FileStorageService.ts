/**
 * File Storage Service - AWS S3 Implementation
 * Handles file uploads to AWS S3 and manages document persistence with Firestore metadata
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { firebaseApp } from '@/integrations/firebase/config';
import { FallbackUploadService } from './FallbackUploadService';

// AWS S3 Configuration
const AWS_API_ENDPOINT = import.meta.env.VITE_AWS_API_ENDPOINT || 
                         import.meta.env.VITE_LAMBDA_ENDPOINT || 
                         'https://5tdpymqo3b.execute-api.eu-north-1.amazonaws.com/prod';
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME || 'tvet-kenya-uploads-2024';
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'eu-north-1';

export interface StoredDocument {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  s3Key: string; // S3 object key
  s3Bucket: string;
  isVisible: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'assignment' | 'material' | 'submission';
  entityId: string; // ID of the assignment, material, or submission this document belongs to
  entityType: 'semester-plan-assignment' | 'semester-plan-material' | 'student-submission';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface S3PresignedPostResponse {
  url: string;
  fields: Record<string, string>;
  s3Key: string;
  downloadUrl: string;
}

export class FileStorageService {
  private db = getFirestore(firebaseApp);
  
  // Supported file types
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

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Get presigned POST URL from AWS Lambda for direct S3 upload
   */
  private async getPresignedPost(
    fileName: string,
    fileType: string,
    fileSize: number,
    folder: string,
    userId: string
  ): Promise<S3PresignedPostResponse> {
    // Use the existing Lambda endpoint that expects /generate-signed-url
    const lambdaEndpoint = AWS_API_ENDPOINT.includes('generate-signed-url') 
      ? AWS_API_ENDPOINT 
      : `${AWS_API_ENDPOINT}/generate-signed-url`;
      
    const response = await fetch(lambdaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
      },
      body: JSON.stringify({
        token: localStorage.getItem('token') || 'demo-token',
        fileName,
        fileType,
        fileSize,
        folder
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to get presigned URL' }));
      throw new Error(`Failed to get presigned URL: ${errorData.message}`);
    }

    const data = await response.json();
    
    // Convert Lambda response format to our expected format
    return {
      url: data.uploadUrl,
      fields: data.formData,
      s3Key: this.extractS3KeyFromUrl(data.fileUrl),
      downloadUrl: data.fileUrl
    };
  }

  /**
   * Extract S3 key from the full S3 URL
   */
  private extractS3KeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch (error) {
      // Fallback: assume the URL format is https://bucket.s3.region.amazonaws.com/key
      const parts = url.split('/');
      return parts.slice(3).join('/');
    }
  }

  /**
   * Upload file directly to S3 using presigned POST
   */
  private async uploadToS3(
    file: File,
    presignedPost: S3PresignedPostResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      
      // Add all the fields from presigned POST
      Object.keys(presignedPost.fields).forEach(key => {
        formData.append(key, presignedPost.fields[key]);
      });
      
      // Add the file (must be last)
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: (event.loaded / event.total) * 100
            };
            onProgress(progress);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status === 204 || xhr.status === 200) {
          resolve(presignedPost.downloadUrl);
        } else {
          reject(new Error(`S3 upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('S3 upload failed'));
      };

      xhr.open('POST', presignedPost.url);
      xhr.send(formData);
    });
  }

  /**
   * Upload a file to AWS S3 and save metadata to Firestore
   */
  async uploadDocument(
    file: File,
    metadata: {
      title: string;
      description?: string;
      isVisible: boolean;
      uploadedBy: string;
      category: 'assignment' | 'material' | 'submission';
      entityId: string;
      entityType: 'semester-plan-assignment' | 'semester-plan-material' | 'student-submission';
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<StoredDocument> {
    
    // Validate file
    this.validateFile(file);

    // Generate unique document ID
    const documentId = `${metadata.category}_${metadata.entityId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine S3 folder structure
    const s3Folder = `documents/${metadata.category}/${metadata.entityType}/${metadata.entityId}`;
    
    try {
      // Use CORS-aware upload system to handle Lambda endpoint properly
      console.log('Using CORS-aware Lambda upload for:', file.name, s3Folder);
      
      const { uploadWithCORSHandling } = await import('./CORSAwareUpload');
      
      const s3Url = await uploadWithCORSHandling(file, s3Folder, {
        maxRetries: 3,
        retryDelay: 1000,
        enableFallback: true
      });
      
      console.log('File uploaded via CORS-aware Lambda system:', s3Url);

        // Extract S3 key from URL
        const s3Key = this.extractS3KeyFromUrl(s3Url);

        // Create document metadata
        const document: StoredDocument = {
          id: documentId,
          title: metadata.title,
          description: metadata.description,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          downloadUrl: s3Url,
          s3Key,
          s3Bucket: S3_BUCKET_NAME,
          isVisible: metadata.isVisible,
          uploadedBy: metadata.uploadedBy,
          uploadedAt: new Date(),
          category: metadata.category,
          entityId: metadata.entityId,
          entityType: metadata.entityType
        };

        // Save metadata to Firestore
        await setDoc(doc(this.db, 'documents', documentId), {
          ...document,
          uploadedAt: serverTimestamp()
        });

        // Report progress as complete
        if (onProgress) {
          onProgress({
            loaded: file.size,
            total: file.size,
            percentage: 100
          });
        }

        console.log('Document uploaded successfully via CORS-aware system:', documentId);
        console.log('S3 Key:', s3Key);
        console.log('Download URL:', s3Url);
        
        return document;

    } catch (error) {
      console.error('Failed to upload document:', error);
      
      // Check if this is an infrastructure error that we should handle with fallback
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isInfrastructureError = 
        errorMessage.includes('Access Denied') ||
        errorMessage.includes('Quota exceeded') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('Network') ||
        errorMessage.includes('Firebase') ||
        errorMessage.includes('AWS');

      if (isInfrastructureError) {
        console.log('🔄 Infrastructure error detected, attempting fallback upload:', errorMessage);
        
        try {
          // Use fallback upload service
          const fallbackDocument = await FallbackUploadService.uploadDocument(file, metadata, {
            useLocalStorage: true,
            mockS3Urls: true
          });
          
          console.log('✅ Fallback upload successful:', fallbackDocument.id);
          
          // Report progress as complete
          if (onProgress) {
            onProgress({
              loaded: file.size,
              total: file.size,
              percentage: 100
            });
          }
          
          // Return fallback document but warn user
          console.warn('⚠️ Using fallback storage due to infrastructure issues');
          return fallbackDocument;
          
        } catch (fallbackError) {
          console.error('Fallback upload also failed:', fallbackError);
          throw new Error(
            `Upload failed and fallback storage unavailable. ` +
            `Original error: ${errorMessage}. ` +
            `Fallback error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'}`
          );
        }
      }
      
      // For non-infrastructure errors, throw the original error
      throw new Error(`Upload failed: ${errorMessage}`);
    }
  }

  /**
   * Get documents for a specific entity (assignment, material, etc.)
   */
  async getDocuments(entityId: string, entityType?: string, category?: string): Promise<StoredDocument[]> {
    try {
      let q = query(
        collection(this.db, 'documents'),
        where('entityId', '==', entityId),
        orderBy('uploadedAt', 'desc')
      );

      if (entityType) {
        q = query(q, where('entityType', '==', entityType));
      }

      if (category) {
        q = query(q, where('category', '==', category));
      }

      const querySnapshot = await getDocs(q);
      const documents: StoredDocument[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date()
        } as StoredDocument);
      });

      // Also get fallback documents from localStorage
      try {
        const fallbackDocuments = await FallbackUploadService.getDocuments(entityId, entityType, category);
        documents.push(...fallbackDocuments);
        
        if (fallbackDocuments.length > 0) {
          console.log(`📁 Found ${fallbackDocuments.length} fallback documents for ${entityId}`);
        }
      } catch (fallbackError) {
        console.warn('Could not retrieve fallback documents:', fallbackError);
      }

      // Sort all documents by upload date (newest first)
      return documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      
    } catch (error) {
      console.error('Failed to get documents from Firestore:', error);
      
      // If Firestore fails, try to get only fallback documents
      try {
        const fallbackDocuments = await FallbackUploadService.getDocuments(entityId, entityType, category);
        console.log(`⚠️ Using only fallback documents due to Firestore error: ${fallbackDocuments.length} found`);
        return fallbackDocuments;
      } catch (fallbackError) {
        console.error('Both Firestore and fallback failed:', error, fallbackError);
        return [];
      }
    }
  }

  /**
   * Get all student submissions for a specific assignment
   */
  async getAssignmentSubmissions(assignmentId: string): Promise<StoredDocument[]> {
    try {
      // Get all documents with entityType 'student-submission' and category 'submission'
      const q = query(
        collection(this.db, 'documents'),
        where('entityType', '==', 'student-submission'),
        where('category', '==', 'submission'),
        orderBy('uploadedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allSubmissions: StoredDocument[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const document = {
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date()
        } as StoredDocument;
        
        // Filter for this assignment (entityId format: assignmentId_studentId)
        if (document.entityId && document.entityId.startsWith(`${assignmentId}_`)) {
          allSubmissions.push(document);
        }
      });

      return allSubmissions;
    } catch (error) {
      console.error('Failed to get assignment submissions:', error);
      return [];
    }
  }

  /**
   * Get visible documents for students (filters by isVisible = true)
   */
  async getVisibleDocuments(entityId: string, entityType?: string, category?: string): Promise<StoredDocument[]> {
    const allDocuments = await this.getDocuments(entityId, entityType, category);
    return allDocuments.filter(doc => doc.isVisible);
  }

  /**
   * Get a single document by ID
   */
  async getDocument(documentId: string): Promise<StoredDocument | null> {
    try {
      const docRef = doc(this.db, 'documents', documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date()
        } as StoredDocument;
      }

      return null;
    } catch (error) {
      console.error('Failed to get document:', error);
      return null;
    }
  }

  /**
   * Update document visibility
   */
  async updateDocumentVisibility(documentId: string, isVisible: boolean): Promise<void> {
    try {
      const docRef = doc(this.db, 'documents', documentId);
      await setDoc(docRef, { 
        isVisible, 
        updatedAt: serverTimestamp() 
      }, { merge: true });
      
      console.log('Document visibility updated:', documentId, isVisible);
    } catch (error) {
      console.error('Failed to update document visibility:', error);
      throw error;
    }
  }

  /**
   * Delete a document (removes from S3 and database)
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get document metadata
      const document = await this.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete from S3 via Lambda function
      try {
        await fetch(`${AWS_API_ENDPOINT}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
          },
          body: JSON.stringify({
            s3Key: document.s3Key,
            bucket: document.s3Bucket
          })
        });
        console.log('Document deleted from S3:', document.s3Key);
      } catch (s3Error) {
        console.warn('Failed to delete from S3, continuing with metadata deletion:', s3Error);
      }

      // Delete from Firestore
      await deleteDoc(doc(this.db, 'documents', documentId));

      console.log('Document deleted successfully:', documentId);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    // Check file size
    if (file.size > FileStorageService.MAX_FILE_SIZE) {
      throw new Error(`File size too large. Maximum allowed size is ${FileStorageService.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!FileStorageService.ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`File type not supported. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MD, JPG, PNG, GIF, ZIP`);
    }

    // Check filename for security
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      throw new Error('Invalid file name');
    }
  }

  /**
   * Get download URL for a document (returns S3 URL or fallback blob URL)
   */
  async getDownloadUrl(documentId: string): Promise<string | null> {
    const document = await this.getDocument(documentId);
    if (!document) return null;

    // Check if this is a fallback document
    if (documentId.startsWith('fallback_')) {
      // Create download URL for fallback document
      const fallbackUrl = await FallbackUploadService.createDownloadUrl(documentId);
      return fallbackUrl || document.downloadUrl;
    }

    return document.downloadUrl;
  }

  /**
   * Create a secure download link with expiration (presigned URL)
   */
  async createSecureDownloadLink(documentId: string, expirationMinutes: number = 60): Promise<string | null> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) return null;

      // Check if this is a fallback document
      if (documentId.startsWith('fallback_')) {
        console.log('Creating download URL for fallback document:', documentId);
        // Create download URL for fallback document (no expiration needed for blob URLs)
        const fallbackUrl = await FallbackUploadService.createDownloadUrl(documentId);
        return fallbackUrl || document.downloadUrl;
      }

      // Request presigned URL for download from Lambda
      const response = await fetch(`${AWS_API_ENDPOINT}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
        },
        body: JSON.stringify({
          s3Key: document.s3Key,
          expirationMinutes
        })
      });

      if (!response.ok) {
        console.warn('Failed to create presigned download URL, using direct URL');
        return document.downloadUrl;
      }

      const data = await response.json();
      return data.downloadUrl;
    } catch (error) {
      console.error('Failed to create secure download link:', error);
      // Fallback to direct S3 URL
      const document = await this.getDocument(documentId);
      return document?.downloadUrl || null;
    }
  }

  /**
   * Clean up expired or orphaned documents
   */
  async cleanupOrphanedDocuments(entityIds: string[]): Promise<void> {
    try {
      // Get all documents
      const allDocs = await getDocs(collection(this.db, 'documents'));
      const documentsToDelete: string[] = [];

      allDocs.forEach((doc) => {
        const data = doc.data();
        if (!entityIds.includes(data.entityId)) {
          documentsToDelete.push(doc.id);
        }
      });

      // Delete orphaned documents
      for (const docId of documentsToDelete) {
        await this.deleteDocument(docId);
      }

      console.log(`Cleaned up ${documentsToDelete.length} orphaned documents from S3`);
    } catch (error) {
      console.error('Failed to cleanup orphaned documents:', error);
    }
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService();
