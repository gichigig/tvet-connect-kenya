/**
 * Test Script: Assignment Submission Workflow
 * Tests the complete workflow from student submission to lecturer viewing
 */

import { fileStorageService } from '../src/services/FileStorageService';

async function testAssignmentSubmissionWorkflow() {
  console.log('🧪 Testing Assignment Submission Workflow');
  console.log('========================================');

  try {
    // Test 1: Create a sample assignment submission
    const testAssignmentId = 'test-assignment-001';
    const testStudentId = 'student-001';
    const testSubmissionEntityId = `${testAssignmentId}_${testStudentId}`;

    console.log('📝 Test 1: Creating sample student submission...');

    // Create a mock file for testing
    const mockFileContent = 'This is a test assignment submission document.';
    const mockFile = new File([mockFileContent], 'test-submission.txt', {
      type: 'text/plain'
    });

    console.log(`Creating submission for Assignment: ${testAssignmentId}, Student: ${testStudentId}`);

    // Upload the test submission
    const uploadedDocument = await fileStorageService.uploadDocument(
      mockFile,
      {
        title: 'Test Assignment Submission',
        description: 'This is a test submission for assignment workflow testing',
        isVisible: true,
        uploadedBy: testStudentId,
        category: 'submission',
        entityId: testSubmissionEntityId,
        entityType: 'student-submission'
      }
    );

    console.log('✅ Submission uploaded successfully:', uploadedDocument.id);

    // Test 2: Retrieve submissions for the assignment
    console.log('\n📋 Test 2: Retrieving assignment submissions...');

    const submissionDocuments = await fileStorageService.getAssignmentSubmissions(testAssignmentId);
    console.log(`Found ${submissionDocuments.length} submissions for assignment ${testAssignmentId}`);

    if (submissionDocuments.length > 0) {
      console.log('📄 Submission details:');
      submissionDocuments.forEach((doc, index) => {
        console.log(`  ${index + 1}. Title: ${doc.title}`);
        console.log(`     Entity ID: ${doc.entityId}`);
        console.log(`     Student: ${doc.uploadedBy}`);
        console.log(`     Uploaded: ${doc.uploadedAt}`);
        console.log(`     S3 Key: ${doc.s3Key}`);
      });
    }

    // Test 3: Test download functionality
    console.log('\n⬇️ Test 3: Testing download functionality...');

    for (const doc of submissionDocuments) {
      try {
        const downloadUrl = await fileStorageService.getDownloadUrl(doc.id);
        if (downloadUrl) {
          console.log(`✅ Download URL generated for ${doc.title}: ${downloadUrl.substring(0, 50)}...`);
        } else {
          console.log(`❌ No download URL for ${doc.title}`);
        }
      } catch (error) {
        console.log(`❌ Download failed for ${doc.title}:`, error.message);
      }
    }

    // Test 4: Create additional test submissions (different students)
    console.log('\n👥 Test 4: Creating multiple student submissions...');

    const additionalStudents = ['student-002', 'student-003'];
    for (const studentId of additionalStudents) {
      const entityId = `${testAssignmentId}_${studentId}`;
      const studentFile = new File(
        [`Assignment submission by ${studentId}. This is a comprehensive response to the assignment requirements.`], 
        `${studentId}-assignment.txt`, 
        { type: 'text/plain' }
      );

      try {
        const studentDoc = await fileStorageService.uploadDocument(
          studentFile,
          {
            title: `Assignment Submission - ${studentId}`,
            description: `Submission by ${studentId} for test assignment`,
            isVisible: true,
            uploadedBy: studentId,
            category: 'submission',
            entityId: entityId,
            entityType: 'student-submission'
          }
        );
        console.log(`✅ Created submission for ${studentId}: ${studentDoc.id}`);
      } catch (error) {
        console.log(`❌ Failed to create submission for ${studentId}:`, error.message);
      }
    }

    // Test 5: Final verification - get all submissions
    console.log('\n🔍 Test 5: Final verification - retrieving all submissions...');

    const allSubmissions = await fileStorageService.getAssignmentSubmissions(testAssignmentId);
    console.log(`📊 Total submissions found: ${allSubmissions.length}`);

    // Group by student
    const submissionsByStudent = {};
    allSubmissions.forEach(doc => {
      if (doc.entityId && doc.entityId.startsWith(`${testAssignmentId}_`)) {
        const studentId = doc.entityId.replace(`${testAssignmentId}_`, '');
        if (!submissionsByStudent[studentId]) {
          submissionsByStudent[studentId] = [];
        }
        submissionsByStudent[studentId].push(doc);
      }
    });

    console.log('📈 Submissions grouped by student:');
    Object.keys(submissionsByStudent).forEach(studentId => {
      console.log(`  👤 ${studentId}: ${submissionsByStudent[studentId].length} file(s)`);
      submissionsByStudent[studentId].forEach(doc => {
        console.log(`     - ${doc.title} (${doc.fileName})`);
      });
    });

    console.log('\n🎉 Assignment submission workflow test completed successfully!');
    console.log('✨ The lecturer dashboard should now be able to display these submissions.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Running assignment submission workflow test in browser...');
  testAssignmentSubmissionWorkflow();
} else {
  // Node.js environment
  console.log('This test should be run in the browser console after the app loads.');
}

export { testAssignmentSubmissionWorkflow };
