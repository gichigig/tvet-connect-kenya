/**
 * Fallback Upload Service for Development
 * Handles file storage when AWS/Firebase services are unavailable
 */

import { StoredDocument } from './FileStorageService';

interface FallbackUploadOptions {
  useLocalStorage?: boolean;
  mockS3Urls?: boolean;
}

export class FallbackUploadService {
  private static readonly STORAGE_KEY_PREFIX = 'tvet_fallback_upload_';
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB total limit

  /**
   * Upload file using fallback mechanism (localStorage for development)
   */
  static async uploadDocument(
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
    options: FallbackUploadOptions = {}
  ): Promise<StoredDocument> {
    const { useLocalStorage = true, mockS3Urls = true } = options;

    // Check storage availability
    if (useLocalStorage && !this.isStorageAvailable()) {
      throw new Error('Browser storage not available for fallback upload');
    }

    // Check file size for localStorage limitations
    if (file.size > 5 * 1024 * 1024) { // 5MB limit for localStorage
      throw new Error('File too large for fallback storage. Please try again when the upload service is available.');
    }

    try {
      // Generate document ID and storage key
      const documentId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const storageKey = `${this.STORAGE_KEY_PREFIX}${documentId}`;

      // Read file as base64 for storage
      const fileData = await this.fileToBase64(file);

      // Create mock S3 URL
      const mockS3Url = mockS3Urls 
        ? `https://tvet-kenya-uploads-2024.s3.eu-north-1.amazonaws.com/fallback/${metadata.category}/${metadata.entityId}/${file.name}`
        : URL.createObjectURL(file);

      // Create document metadata
      const document: StoredDocument = {
        id: documentId,
        title: metadata.title,
        description: metadata.description,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloadUrl: mockS3Url,
        s3Key: `fallback/${metadata.category}/${metadata.entityId}/${file.name}`,
        s3Bucket: 'tvet-kenya-uploads-2024',
        isVisible: metadata.isVisible,
        uploadedBy: metadata.uploadedBy,
        uploadedAt: new Date(),
        category: metadata.category,
        entityId: metadata.entityId,
        entityType: metadata.entityType
      };

      // Store in localStorage with file data
      const fallbackData = {
        document,
        fileData,
        storedAt: new Date().toISOString(),
        isFallback: true
      };

      if (useLocalStorage) {
        localStorage.setItem(storageKey, JSON.stringify(fallbackData));
        
        // Store document reference for easy retrieval
        this.addDocumentReference(documentId, metadata.entityId, metadata.entityType, metadata.category);
      }

      console.log('📁 Fallback upload completed:', documentId);
      console.log('💾 Stored in localStorage:', storageKey);
      
      return document;

    } catch (error) {
      console.error('Fallback upload failed:', error);
      throw new Error(`Fallback upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get documents from fallback storage
   */
  static async getDocuments(entityId: string, entityType?: string, category?: string): Promise<StoredDocument[]> {
    try {
      const documents: StoredDocument[] = [];
      const references = this.getDocumentReferences();

      for (const ref of references) {
        // Filter by criteria
        if (entityId && ref.entityId !== entityId) continue;
        if (entityType && ref.entityType !== entityType) continue;
        if (category && ref.category !== category) continue;

        // Get document from storage
        const storageKey = `${this.STORAGE_KEY_PREFIX}${ref.documentId}`;
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          try {
            const fallbackData = JSON.parse(storedData);
            documents.push(fallbackData.document);
          } catch (parseError) {
            console.warn('Failed to parse fallback document:', ref.documentId);
          }
        }
      }

      return documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    } catch (error) {
      console.error('Failed to get fallback documents:', error);
      return [];
    }
  }

  /**
   * Get document file data for download
   */
  static async getDocumentData(documentId: string): Promise<string | null> {
    try {
      const storageKey = `${this.STORAGE_KEY_PREFIX}${documentId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const fallbackData = JSON.parse(storedData);
        return fallbackData.fileData;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get fallback document data:', error);
      return null;
    }
  }

  /**
   * Create download URL for fallback document
   */
  static async createDownloadUrl(documentId: string): Promise<string | null> {
    try {
      const fileData = await this.getDocumentData(documentId);
      if (!fileData) return null;

      // Create blob URL for download
      const byteCharacters = atob(fileData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to create fallback download URL:', error);
      return null;
    }
  }

  /**
   * Clear all fallback storage
   */
  static clearFallbackStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      const fallbackKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      
      fallbackKeys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}references`);
      
      console.log(`🧹 Cleared ${fallbackKeys.length} fallback documents from storage`);
    } catch (error) {
      console.error('Failed to clear fallback storage:', error);
    }
  }

  /**
   * Get fallback storage usage info
   */
  static getStorageInfo(): { count: number; sizeBytes: number; maxSizeBytes: number } {
    try {
      const keys = Object.keys(localStorage);
      const fallbackKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      
      let totalSize = 0;
      fallbackKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length * 2; // Rough estimate (UTF-16)
        }
      });

      return {
        count: fallbackKeys.length,
        sizeBytes: totalSize,
        maxSizeBytes: this.MAX_STORAGE_SIZE
      };
    } catch (error) {
      return { count: 0, sizeBytes: 0, maxSizeBytes: this.MAX_STORAGE_SIZE };
    }
  }

  // Private helper methods

  private static isStorageAvailable(): boolean {
    try {
      const testKey = 'test_storage';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private static addDocumentReference(
    documentId: string, 
    entityId: string, 
    entityType: string, 
    category: string
  ): void {
    try {
      const references = this.getDocumentReferences();
      references.push({
        documentId,
        entityId,
        entityType,
        category,
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}references`, 
        JSON.stringify(references)
      );
    } catch (error) {
      console.error('Failed to add document reference:', error);
    }
  }

  private static getDocumentReferences(): Array<{
    documentId: string;
    entityId: string;
    entityType: string;
    category: string;
    createdAt: string;
  }> {
    try {
      const referencesData = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}references`);
      return referencesData ? JSON.parse(referencesData) : [];
    } catch {
      return [];
    }
  }
}
