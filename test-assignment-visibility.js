// Assignment creation and visibility test
// This script will programmatically create both essay and document assignments and verify their visibility for a student.


// Adjust the import path as needed based on your project structure
import { addAssignmentToSemesterPlan } from './src/contexts/SemesterPlanContext.tsx';
import { v4 as uuidv4 } from 'uuid';

async function testAssignmentVisibility() {
  const testUnitId = 'test-unit-001';
  const weekNumber = 1;
  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

  // Essay assignment
  const essayAssignment = {
    id: uuidv4(),
    title: 'Test Essay Assignment',
    description: 'Write an essay for testing.',
    type: 'essay',
    studentType: 'essay',
    assignDate: now,
    dueDate,
    maxMarks: 100,
    instructions: 'Essay instructions',
    isUploaded: false,
    requiresAICheck: true,
    documents: []
  };

  // Document assignment
  const documentAssignment = {
    id: uuidv4(),
    title: 'Test Document Assignment',
    description: 'Upload a document for testing.',
    type: 'document',
    studentType: 'document',
    assignDate: now,
    dueDate,
    maxMarks: 100,
    instructions: 'Document upload instructions',
    isUploaded: false,
    requiresAICheck: false,
    documents: []
  };

  // Add assignments to semester plan
  await addAssignmentToSemesterPlan(testUnitId, weekNumber, essayAssignment);
  await addAssignmentToSemesterPlan(testUnitId, weekNumber, documentAssignment);

  // Log for manual verification
  console.log('Test assignments created. Please log in as a student and verify:');
  console.log('- Essay assignment should show essay workspace.');
  console.log('- Document assignment should show document upload workspace.');
}

testAssignmentVisibility();
