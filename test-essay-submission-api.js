// Test script for essay submission API endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'your-api-key-here'; // Replace with actual API key

// Test data
const testSubmission = {
  assignmentId: 'test-assignment-001',
  studentId: 'test-student-001',
  unitId: 'test-unit-001',
  submissionType: 'essay',
  content: 'This is a test essay submission with multiple paragraphs.\n\nSecond paragraph here.\n\nThird paragraph for testing word count.',
  title: 'Test Essay Submission',
  submittedAt: new Date().toISOString(),
  status: 'submitted',
  wordCount: 20,
  aiCheckResult: { plagiarismScore: 5, aiGenerated: false },
  metadata: { testData: true }
};

async function testCreateSubmission() {
  console.log('\n🧪 Testing: Create Essay Submission');
  try {
    const response = await fetch(`${API_BASE_URL}/api/assignments/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(testSubmission)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Create Submission Success:', result.message);
      console.log('📄 Submission ID:', result.submission.id);
      return result.submission.id;
    } else {
      console.log('❌ Create Submission Failed:', result);
      return null;
    }
  } catch (error) {
    console.log('❌ Create Submission Error:', error.message);
    return null;
  }
}

async function testGetStudentSubmissions(studentId, unitId) {
  console.log('\n🧪 Testing: Get Student Submissions');
  try {
    const response = await fetch(`${API_BASE_URL}/api/assignments/submissions/student/${studentId}/unit/${unitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Get Student Submissions Success');
      console.log('📊 Found', result.length, 'submissions');
      result.forEach((submission, index) => {
        console.log(`  ${index + 1}. ${submission.title} (${submission.status})`);
      });
      return result;
    } else {
      console.log('❌ Get Student Submissions Failed:', result);
      return [];
    }
  } catch (error) {
    console.log('❌ Get Student Submissions Error:', error.message);
    return [];
  }
}

async function testGetSpecificSubmission(submissionId) {
  console.log('\n🧪 Testing: Get Specific Submission');
  try {
    const response = await fetch(`${API_BASE_URL}/api/assignments/submissions/${submissionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Get Specific Submission Success');
      console.log('📄 Title:', result.title);
      console.log('📊 Word Count:', result.wordCount);
      console.log('📅 Submitted:', result.submittedAt);
      return result;
    } else {
      console.log('❌ Get Specific Submission Failed:', result);
      return null;
    }
  } catch (error) {
    console.log('❌ Get Specific Submission Error:', error.message);
    return null;
  }
}

async function testGetAssignmentSubmissions(assignmentId) {
  console.log('\n🧪 Testing: Get Assignment Submissions');
  try {
    const response = await fetch(`${API_BASE_URL}/api/assignments/assignment/${assignmentId}/submissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Get Assignment Submissions Success');
      console.log('📊 Found', result.length, 'submissions for assignment');
      result.forEach((submission, index) => {
        console.log(`  ${index + 1}. Student: ${submission.studentId} - ${submission.title}`);
      });
      return result;
    } else {
      console.log('❌ Get Assignment Submissions Failed:', result);
      return [];
    }
  } catch (error) {
    console.log('❌ Get Assignment Submissions Error:', error.message);
    return [];
  }
}

async function testUpdateSubmission(submissionId) {
  console.log('\n🧪 Testing: Update Submission');
  const updateData = {
    ...testSubmission,
    title: 'Updated Test Essay Submission',
    content: testSubmission.content + '\n\nThis is an updated version of the essay.',
    wordCount: 25,
    updatedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/assignments/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Update Submission Success:', result.message);
      return result.submission;
    } else {
      console.log('❌ Update Submission Failed:', result);
      return null;
    }
  } catch (error) {
    console.log('❌ Update Submission Error:', error.message);
    return null;
  }
}

async function testDeleteSubmission(submissionId) {
  console.log('\n🧪 Testing: Delete Submission');
  try {
    const response = await fetch(`${API_BASE_URL}/api/assignments/submissions/${submissionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Delete Submission Success:', result.message);
      return true;
    } else {
      console.log('❌ Delete Submission Failed:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Delete Submission Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Essay Submission API Tests');
  console.log('🔗 API Base URL:', API_BASE_URL);
  
  // Test 1: Create submission
  const submissionId = await testCreateSubmission();
  
  if (!submissionId) {
    console.log('\n❌ Cannot continue tests - submission creation failed');
    return;
  }

  // Test 2: Get student submissions
  await testGetStudentSubmissions(testSubmission.studentId, testSubmission.unitId);

  // Test 3: Get specific submission
  await testGetSpecificSubmission(submissionId);

  // Test 4: Get all submissions for assignment
  await testGetAssignmentSubmissions(testSubmission.assignmentId);

  // Test 5: Update submission
  await testUpdateSubmission(submissionId);

  // Test 6: Delete submission (cleanup)
  await testDeleteSubmission(submissionId);

  console.log('\n✅ All tests completed!');
}

// Check if API_KEY is provided
if (API_KEY === 'your-api-key-here') {
  console.log('❌ Please set a valid API_KEY in the script before running tests');
  console.log('💡 You can find your API key in the api-server/.env file');
} else {
  runAllTests().catch(console.error);
}
