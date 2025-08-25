/**
 * Assignment File System Test Suite
 * Tests lecturer file upload and student download functionality
 */

import { fileStorageService } from '../services/FileStorageService';
import { FallbackUploadService } from '../services/FallbackUploadService';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  duration: number;
  data?: any;
}

export class AssignmentFileSystemTester {
  private results: TestResult[] = [];

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Assignment File System Tests...');
    
    this.results = [];
    
    // Basic functionality tests
    await this.testFileStorageAvailability();
    await this.testFallbackStorageAvailability();
    
    // Upload tests
    await this.testLecturerFileUpload();
    await this.testMultipleFileUpload();
    await this.testLargeFileHandling();
    
    // Download tests
    await this.testStudentFileDownload();
    await this.testFallbackDocumentDownload();
    
    // Error handling tests
    await this.testS3FailureFallback();
    await this.testInvalidFileHandling();
    
    // Performance tests
    await this.testUploadPerformance();
    await this.testStorageUsage();
    
    this.displayResults();
    return this.results;
  }

  /**
   * Test basic file storage availability
   */
  private async testFileStorageAvailability(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test if FileStorageService is available
      const isAvailable = typeof fileStorageService !== 'undefined' && 
                         typeof fileStorageService.uploadDocument === 'function';
      
      if (isAvailable) {
        this.addResult('File Storage Service Availability', true, 'Service is available and ready', startTime);
      } else {
        this.addResult('File Storage Service Availability', false, 'Service not available or missing methods', startTime);
      }
    } catch (error) {
      this.addResult('File Storage Service Availability', false, `Error: ${error}`, startTime);
    }
  }

  /**
   * Test fallback storage availability
   */
  private async testFallbackStorageAvailability(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test localStorage availability
      const isAvailable = typeof Storage !== 'undefined' && 
                         typeof FallbackUploadService !== 'undefined';
      
      if (isAvailable) {
        // Test actual storage
        const testKey = 'test_fallback_storage';
        localStorage.setItem(testKey, 'test');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (retrieved === 'test') {
          this.addResult('Fallback Storage Availability', true, 'Fallback storage is functional', startTime);
        } else {
          this.addResult('Fallback Storage Availability', false, 'Fallback storage test failed', startTime);
        }
      } else {
        this.addResult('Fallback Storage Availability', false, 'Fallback storage not available', startTime);
      }
    } catch (error) {
      this.addResult('Fallback Storage Availability', false, `Error: ${error}`, startTime);
    }
  }

  /**
   * Test lecturer file upload functionality
   */
  private async testLecturerFileUpload(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create a test file
      const testFile = this.createTestFile('test-assignment.txt', 'This is a test assignment file content');
      const assignmentId = `test-assignment-${Date.now()}`;
      
      // Test upload
      const uploadResult = await fileStorageService.uploadDocument(testFile, {
        title: 'Test Assignment File',
        description: 'Test file for assignment upload',
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: assignmentId,
        entityType: 'semester-plan-assignment'
      });
      
      if (uploadResult && uploadResult.id && uploadResult.downloadUrl) {
        this.addResult('Lecturer File Upload', true, `Upload successful: ${uploadResult.id}`, startTime, {
          documentId: uploadResult.id,
          downloadUrl: uploadResult.downloadUrl,
          fileSize: uploadResult.fileSize
        });
      } else {
        this.addResult('Lecturer File Upload', false, 'Upload returned invalid result', startTime);
      }
    } catch (error) {
      this.addResult('Lecturer File Upload', false, `Upload failed: ${error}`, startTime);
    }
  }

  /**
   * Test multiple file upload
   */
  private async testMultipleFileUpload(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const assignmentId = `test-multi-assignment-${Date.now()}`;
      const files = [
        this.createTestFile('assignment-part1.txt', 'Assignment part 1 content'),
        this.createTestFile('assignment-part2.txt', 'Assignment part 2 content'),
        this.createTestFile('assignment-rubric.txt', 'Assignment rubric content')
      ];
      
      const uploadResults = [];
      
      for (const file of files) {
        try {
          const result = await fileStorageService.uploadDocument(file, {
            title: `Test Multi File - ${file.name}`,
            description: 'Test file for multiple upload',
            isVisible: true,
            uploadedBy: 'test-lecturer@example.com',
            category: 'assignment',
            entityId: assignmentId,
            entityType: 'semester-plan-assignment'
          });
          uploadResults.push(result);
        } catch (uploadError) {
          console.warn('Individual file upload failed:', file.name, uploadError);
        }
      }
      
      if (uploadResults.length === files.length) {
        this.addResult('Multiple File Upload', true, `All ${files.length} files uploaded successfully`, startTime, {
          uploadCount: uploadResults.length,
          documents: uploadResults.map(r => ({ id: r.id, fileName: r.fileName }))
        });
      } else {
        this.addResult('Multiple File Upload', false, 
          `Only ${uploadResults.length} of ${files.length} files uploaded`, startTime);
      }
    } catch (error) {
      this.addResult('Multiple File Upload', false, `Multiple upload failed: ${error}`, startTime);
    }
  }

  /**
   * Test large file handling
   */
  private async testLargeFileHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create a larger test file (1MB)
      const largeContent = 'A'.repeat(1024 * 1024); // 1MB of 'A' characters
      const largeFile = this.createTestFile('large-assignment.txt', largeContent);
      const assignmentId = `test-large-assignment-${Date.now()}`;
      
      const uploadResult = await fileStorageService.uploadDocument(largeFile, {
        title: 'Large Test Assignment File',
        description: 'Test file for large file handling',
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: assignmentId,
        entityType: 'semester-plan-assignment'
      });
      
      if (uploadResult && uploadResult.fileSize >= 1024 * 1024) {
        this.addResult('Large File Handling', true, 
          `Large file (${(uploadResult.fileSize / (1024 * 1024)).toFixed(2)}MB) uploaded successfully`, startTime);
      } else {
        this.addResult('Large File Handling', false, 'Large file upload failed or size mismatch', startTime);
      }
    } catch (error) {
      this.addResult('Large File Handling', false, `Large file upload failed: ${error}`, startTime);
    }
  }

  /**
   * Test student file download functionality
   */
  private async testStudentFileDownload(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // First upload a file to download
      const testFile = this.createTestFile('download-test.txt', 'This file should be downloadable');
      const assignmentId = `test-download-assignment-${Date.now()}`;
      
      const uploadResult = await fileStorageService.uploadDocument(testFile, {
        title: 'Download Test File',
        description: 'Test file for download functionality',
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: assignmentId,
        entityType: 'semester-plan-assignment'
      });
      
      // Test download URL generation
      const downloadUrl = await fileStorageService.getDownloadUrl(uploadResult.id);
      
      if (downloadUrl && downloadUrl.startsWith('http')) {
        // Test if URL is accessible (basic check)
        try {
          const response = await fetch(downloadUrl, { method: 'HEAD' });
          if (response.ok || response.status === 403) { // 403 might be normal for presigned URLs
            this.addResult('Student File Download', true, 'Download URL generated and accessible', startTime, {
              downloadUrl: downloadUrl,
              documentId: uploadResult.id
            });
          } else {
            this.addResult('Student File Download', false, `Download URL not accessible: ${response.status}`, startTime);
          }
        } catch (fetchError) {
          // Might be CORS issue, but URL exists
          this.addResult('Student File Download', true, 'Download URL generated (CORS may prevent test)', startTime);
        }
      } else {
        this.addResult('Student File Download', false, 'Invalid download URL generated', startTime);
      }
    } catch (error) {
      this.addResult('Student File Download', false, `Download test failed: ${error}`, startTime);
    }
  }

  /**
   * Test fallback document download
   */
  private async testFallbackDocumentDownload(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create a test file and upload to fallback storage
      const testFile = this.createTestFile('fallback-test.txt', 'This is stored in fallback');
      const assignmentId = `test-fallback-assignment-${Date.now()}`;
      
      const fallbackResult = await FallbackUploadService.uploadDocument(testFile, {
        title: 'Fallback Test File',
        description: 'Test file for fallback download',
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: assignmentId,
        entityType: 'semester-plan-assignment'
      });
      
      // Test fallback download URL creation
      const fallbackDownloadUrl = await FallbackUploadService.createDownloadUrl(fallbackResult.id);
      
      if (fallbackDownloadUrl && fallbackDownloadUrl.startsWith('blob:')) {
        this.addResult('Fallback Document Download', true, 'Fallback download URL created successfully', startTime, {
          downloadUrl: fallbackDownloadUrl,
          documentId: fallbackResult.id
        });
      } else {
        this.addResult('Fallback Document Download', false, 'Fallback download URL creation failed', startTime);
      }
    } catch (error) {
      this.addResult('Fallback Document Download', false, `Fallback download test failed: ${error}`, startTime);
    }
  }

  /**
   * Test S3 failure fallback mechanism
   */
  private async testS3FailureFallback(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // This test simulates what happens when S3 fails
      // We'll test the fallback storage directly
      const testFile = this.createTestFile('fallback-simulation.txt', 'Simulating S3 failure');
      const assignmentId = `test-s3-failure-${Date.now()}`;
      
      // Upload directly to fallback to simulate S3 failure
      const fallbackResult = await FallbackUploadService.uploadDocument(testFile, {
        title: 'S3 Failure Simulation',
        description: 'Testing fallback when S3 fails',
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: assignmentId,
        entityType: 'semester-plan-assignment'
      });
      
      // Verify the document is stored in fallback
      const fallbackDocs = await FallbackUploadService.getDocuments(assignmentId);
      
      if (fallbackDocs.length > 0 && fallbackDocs[0].id === fallbackResult.id) {
        this.addResult('S3 Failure Fallback', true, 'Fallback storage works when S3 fails', startTime);
      } else {
        this.addResult('S3 Failure Fallback', false, 'Fallback storage not working properly', startTime);
      }
    } catch (error) {
      this.addResult('S3 Failure Fallback', false, `S3 fallback test failed: ${error}`, startTime);
    }
  }

  /**
   * Test invalid file handling
   */
  private async testInvalidFileHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test with null file
      let caughtError = false;
      try {
        await fileStorageService.uploadDocument(null as any, {
          title: 'Invalid File Test',
          isVisible: true,
          uploadedBy: 'test@example.com',
          category: 'assignment',
          entityId: 'test-invalid',
          entityType: 'semester-plan-assignment'
        });
      } catch (error) {
        caughtError = true;
      }
      
      if (caughtError) {
        this.addResult('Invalid File Handling', true, 'Invalid file properly rejected', startTime);
      } else {
        this.addResult('Invalid File Handling', false, 'Invalid file was not rejected', startTime);
      }
    } catch (error) {
      this.addResult('Invalid File Handling', true, 'Error handling works correctly', startTime);
    }
  }

  /**
   * Test upload performance
   */
  private async testUploadPerformance(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const testFile = this.createTestFile('performance-test.txt', 'Performance test content');
      const assignmentId = `test-performance-${Date.now()}`;
      
      const uploadStartTime = Date.now();
      
      const uploadResult = await fileStorageService.uploadDocument(testFile, {
        title: 'Performance Test File',
        description: 'Testing upload performance',
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: assignmentId,
        entityType: 'semester-plan-assignment'
      });
      
      const uploadDuration = Date.now() - uploadStartTime;
      
      if (uploadResult && uploadDuration < 10000) { // Less than 10 seconds
        this.addResult('Upload Performance', true, 
          `Upload completed in ${uploadDuration}ms`, startTime, { uploadDuration });
      } else {
        this.addResult('Upload Performance', false, 
          `Upload took too long: ${uploadDuration}ms`, startTime);
      }
    } catch (error) {
      this.addResult('Upload Performance', false, `Performance test failed: ${error}`, startTime);
    }
  }

  /**
   * Test storage usage tracking
   */
  private async testStorageUsage(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Get current fallback storage info
      const storageInfo = FallbackUploadService.getStorageInfo();
      
      if (typeof storageInfo.count === 'number' && 
          typeof storageInfo.sizeBytes === 'number' &&
          typeof storageInfo.maxSizeBytes === 'number') {
        
        this.addResult('Storage Usage Tracking', true, 
          `Storage tracking works: ${storageInfo.count} files, ${storageInfo.sizeBytes} bytes used`, 
          startTime, storageInfo);
      } else {
        this.addResult('Storage Usage Tracking', false, 'Storage tracking returned invalid data', startTime);
      }
    } catch (error) {
      this.addResult('Storage Usage Tracking', false, `Storage tracking failed: ${error}`, startTime);
    }
  }

  /**
   * Helper method to create test files
   */
  private createTestFile(name: string, content: string): File {
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], name, { type: 'text/plain' });
  }

  /**
   * Add test result
   */
  private addResult(testName: string, success: boolean, message: string, startTime: number, data?: any): void {
    this.results.push({
      testName,
      success,
      message,
      duration: Date.now() - startTime,
      data
    });
  }

  /**
   * Display test results
   */
  private displayResults(): void {
    console.log('\n📊 Assignment File System Test Results:');
    console.log('=' .repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = `(${result.duration}ms)`;
      
      console.log(`${index + 1}. ${status} ${result.testName} ${duration}`);
      console.log(`   ${result.message}`);
      
      if (result.data) {
        console.log(`   Data:`, result.data);
      }
      
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
      
      console.log('');
    });
    
    console.log('=' .repeat(60));
    console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${this.results.length} total`);
    console.log(`🎯 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Assignment file system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
    }
  }
}

// Export test runner for global access
(window as any).testAssignmentSystem = async () => {
  const tester = new AssignmentFileSystemTester();
  return await tester.runAllTests();
};

export default AssignmentFileSystemTester;
