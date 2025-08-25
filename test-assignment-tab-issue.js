/**
 * Test script to reproduce and debug the assignment tab issue
 * 
 * Issue: When lecturer creates an essay assignment, it shows document upload tab
 * instead of essay workspace tab in the student dashboard.
 */

const fs = require('fs');
const path = require('path');

// Simulate assignment data structure
const createEssayAssignment = () => ({
  id: 'test-essay-001',
  title: 'Test Essay Assignment',
  description: 'Write an essay about your learning experience',
  type: 'essay', // This should enable essay workspace tab
  assignDate: new Date('2025-08-01'),
  dueDate: new Date('2025-08-25'),
  maxMarks: 100,
  instructions: 'Write a comprehensive essay',
  requiresAICheck: true,
  unitId: 'unit-001',
  unitCode: 'CS101',
  unitName: 'Computer Science Fundamentals',
  documents: []
});

const createDocumentAssignment = () => ({
  id: 'test-doc-001',
  title: 'Test Document Assignment',
  description: 'Upload your project report',
  type: 'document', // This should enable document upload tab
  assignDate: new Date('2025-08-01'),
  dueDate: new Date('2025-08-25'),
  maxMarks: 100,
  instructions: 'Upload your project documentation',
  requiresAICheck: false,
  unitId: 'unit-001',
  unitCode: 'CS101',
  unitName: 'Computer Science Fundamentals',
  documents: []
});

// Debug assignment type handling
function debugAssignmentType(assignment) {
  console.log('\n=== Assignment Type Debug ===');
  console.log('Assignment ID:', assignment.id);
  console.log('Assignment Title:', assignment.title);
  console.log('Assignment Type:', assignment.type);
  console.log('Type of assignment.type:', typeof assignment.type);
  console.log('Is Essay?:', assignment.type === 'essay');
  console.log('Is Document?:', assignment.type === 'document');
  
  // Simulate the AssignmentWorkplace logic
  const isEssay = assignment.type === 'essay';
  console.log('\nTab Logic:');
  console.log('isEssay variable:', isEssay);
  console.log('Essay tab disabled?:', !isEssay);
  console.log('Document tab disabled?:', isEssay);
  console.log('Active tab should be:', assignment.type);
  console.log('================================\n');
}

// Test both assignment types
console.log('Testing Assignment Tab Logic\n');

const essayAssignment = createEssayAssignment();
const documentAssignment = createDocumentAssignment();

debugAssignmentType(essayAssignment);
debugAssignmentType(documentAssignment);

// Check what the StudentSemesterPlanView is passing
console.log('=== StudentSemesterPlanView Assignment Object ===');
console.log('Looking at how assignment is passed to AssignmentWorkplace...\n');

// Read the current StudentSemesterPlanView to see the assignment object structure
const studentViewPath = path.join(__dirname, 'src/components/student/StudentSemesterPlanView.tsx');
const workplacePath = path.join(__dirname, 'src/components/student/AssignmentWorkplace.tsx');

if (fs.existsSync(studentViewPath)) {
  const content = fs.readFileSync(studentViewPath, 'utf8');
  
  // Find the AssignmentWorkplace usage
  const workplaceMatch = content.match(/AssignmentWorkplace[^}]+assignment=\{[^}]+\}/s);
  if (workplaceMatch) {
    console.log('Found AssignmentWorkplace usage in StudentSemesterPlanView:');
    console.log(workplaceMatch[0]);
  }
  
  // Look for type assignment
  const typeMatches = content.match(/type:\s*[^,\n]+/g);
  if (typeMatches) {
    console.log('\nFound type assignments:');
    typeMatches.forEach(match => console.log(' -', match));
  }
} else {
  console.log('StudentSemesterPlanView.tsx not found at expected path');
}

console.log('\n=== Expected Behavior ===');
console.log('1. Essay Assignment (type: "essay"):');
console.log('   - Essay workspace tab: ENABLED');
console.log('   - Document upload tab: DISABLED');
console.log('   - Active tab: "essay"');
console.log('');
console.log('2. Document Assignment (type: "document"):');
console.log('   - Essay workspace tab: DISABLED');
console.log('   - Document upload tab: ENABLED');
console.log('   - Active tab: "document"');
console.log('');
console.log('=== Troubleshooting Steps ===');
console.log('1. Verify assignment.type value in StudentSemesterPlanView');
console.log('2. Check AssignmentWorkplace receives correct type');
console.log('3. Verify tab enabling/disabling logic');
console.log('4. Check activeTab state initialization');
