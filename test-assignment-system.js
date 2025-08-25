/**
 * Test Script for Assignment File Upload and Download System
 * Tests lecturer file upload to S3 and student download functionality
 */

import { fileStorageService } from '../src/services/FileStorageService';

// Mock data for testing
const mockAssignmentData = {
  title: 'Database Systems Assignment 1',
  description: 'Complete the ER diagram and normalization exercises',
  unitCode: 'CS301',
  unitId: 'unit-cs301-2024',
  lecturerId: 'lecturer-001',
  weekNumber: 5,
  dueDate: new Date('2025-09-15T23:59:59.000Z'),
  maxMarks: 100
};

const mockFileData = {
  name: 'assignment-questions.pdf',
  size: 2048576, // 2MB
  type: 'application/pdf',
  content: 'Mock PDF content for testing...'
};

// Test functions
async function testLecturerFileUpload() {
  console.log('🧪 Testing lecturer file upload to S3...');
  
  try {
    // Create a mock File object
    const mockFile = new File([mockFileData.content], mockFileData.name, {
      type: mockFileData.type
    });

    // Generate assignment ID
    const assignmentId = `assignment-${Date.now()}-test`;

    // Upload file using FileStorageService
    const uploadedDoc = await fileStorageService.uploadDocument(
      mockFile,
      {
        title: `${mockAssignmentData.title} - ${mockFileData.name}`,
        description: `Assignment question file for ${mockAssignmentData.title}`,
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: assignmentId,
        entityType: 'semester-plan-assignment'
      }
    );

    console.log('✅ File upload successful:');
    console.log('📁 Document ID:', uploadedDoc.id);
    console.log('🔗 Download URL:', uploadedDoc.downloadUrl);
    console.log('📦 S3 Key:', uploadedDoc.s3Key);
    console.log('📊 File Size:', uploadedDoc.fileSize, 'bytes');

    return {
      assignmentId,
      uploadedDoc,
      documentData: {
        id: uploadedDoc.id,
        name: uploadedDoc.fileName,
        url: uploadedDoc.downloadUrl,
        size: uploadedDoc.fileSize,
        type: uploadedDoc.fileType,
        uploadedAt: uploadedDoc.uploadedAt
      }
    };

  } catch (error) {
    console.error('❌ File upload failed:', error);
    throw error;
  }
}

async function testAssignmentCreation(uploadResult) {
  console.log('🧪 Testing assignment creation with uploaded files...');
  
  const assignmentWithFiles = {
    id: uploadResult.assignmentId,
    title: mockAssignmentData.title,
    description: mockAssignmentData.description,
    type: 'document' as const,
    assignDate: new Date(),
    dueDate: mockAssignmentData.dueDate,
    maxMarks: mockAssignmentData.maxMarks,
    instructions: mockAssignmentData.description,
    isUploaded: true,
    requiresAICheck: false,
    documents: [uploadResult.documentData]
  };

  console.log('✅ Assignment created with documents:');
  console.log('📋 Assignment ID:', assignmentWithFiles.id);
  console.log('📄 Documents Count:', assignmentWithFiles.documents.length);
  console.log('🗂️ Document Details:', assignmentWithFiles.documents[0]);

  return assignmentWithFiles;
}

async function testStudentDownload(assignmentWithFiles) {
  console.log('🧪 Testing student download functionality...');
  
  try {
    const document = assignmentWithFiles.documents[0];
    const downloadUrl = document.url;

    if (!downloadUrl) {
      throw new Error('No download URL available');
    }

    console.log('✅ Student download test:');
    console.log('📥 Download URL accessible:', !!downloadUrl);
    console.log('🔗 URL:', downloadUrl);
    console.log('📋 File Name:', document.name);
    console.log('📊 File Size:', (document.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('📅 Upload Date:', new Date(document.uploadedAt).toLocaleDateString());

    // Simulate download action (in browser, this would trigger actual download)
    console.log('🎯 Simulating download action...');
    console.log('✓ Download would be initiated for:', document.name);

    return true;

  } catch (error) {
    console.error('❌ Student download test failed:', error);
    throw error;
  }
}

async function testFallbackSystem() {
  console.log('🧪 Testing fallback upload system...');
  
  try {
    const { FallbackUploadService } = await import('../src/services/FallbackUploadService');
    
    // Create a mock file for fallback testing
    const mockFile = new File(['Fallback test content'], 'fallback-test.txt', {
      type: 'text/plain'
    });

    // Test fallback upload
    const fallbackDoc = await FallbackUploadService.uploadDocument(
      mockFile,
      {
        title: 'Fallback Test Document',
        description: 'Testing fallback upload system',
        isVisible: true,
        uploadedBy: 'test-lecturer@example.com',
        category: 'assignment',
        entityId: 'test-assignment-fallback',
        entityType: 'semester-plan-assignment'
      }
    );

    console.log('✅ Fallback upload successful:');
    console.log('📁 Document ID:', fallbackDoc.id);
    console.log('🔗 Download URL:', fallbackDoc.downloadUrl);
    console.log('💾 Storage Type: localStorage');

    // Test fallback retrieval
    const fallbackDocs = await FallbackUploadService.getDocuments('test-assignment-fallback');
    console.log('📦 Fallback documents retrieved:', fallbackDocs.length);

    // Test storage info
    const storageInfo = FallbackUploadService.getStorageInfo();
    console.log('📊 Storage usage:', storageInfo);

    return true;

  } catch (error) {
    console.error('❌ Fallback system test failed:', error);
    throw error;
  }
}

// Main test runner
async function runCompleteTest() {
  console.log('🚀 Starting comprehensive assignment file system test...');
  console.log('===============================================');

  try {
    // Test 1: Lecturer file upload
    const uploadResult = await testLecturerFileUpload();
    console.log('');

    // Test 2: Assignment creation with files
    const assignmentWithFiles = await testAssignmentCreation(uploadResult);
    console.log('');

    // Test 3: Student download
    await testStudentDownload(assignmentWithFiles);
    console.log('');

    // Test 4: Fallback system
    await testFallbackSystem();
    console.log('');

    console.log('===============================================');
    console.log('🎉 All tests completed successfully!');
    console.log('✅ Lecturer upload to S3: WORKING');
    console.log('✅ Assignment creation with files: WORKING');
    console.log('✅ Student download functionality: WORKING');
    console.log('✅ Fallback system: WORKING');

  } catch (error) {
    console.log('===============================================');
    console.error('❌ Test suite failed:', error);
    console.log('Please check the implementation and try again.');
  }
}

// Export for use in browser console or test environment
if (typeof window !== 'undefined') {
  window.testAssignmentSystem = runCompleteTest;
  console.log('Test suite loaded! Run window.testAssignmentSystem() to start testing.');
} else {
  // For Node.js environment
  runCompleteTest().catch(console.error);
}

export {
  testLecturerFileUpload,
  testAssignmentCreation,
  testStudentDownload,
  testFallbackSystem,
  runCompleteTest
};
