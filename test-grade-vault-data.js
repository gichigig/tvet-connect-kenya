/**
 * Grade Vault Test Data Setup
 * Creates sample data for testing the Grade Vault system
 */

const testStudents = [
  {
    id: 'test-student-1',
    name: 'John Doe',
    regNumber: 'TVT/001/2024',
    email: 'john.doe@student.tvt.ac.ke',
    course: 'Computer Science',
    year: 2,
    semester: '2'
  },
  {
    id: 'test-student-2', 
    name: 'Jane Smith',
    regNumber: 'TVT/002/2024',
    email: 'jane.smith@student.tvt.ac.ke',
    course: 'Electrical Engineering',
    year: 1,
    semester: '1'
  }
];

const testGradeVaultResults = [
  {
    id: 'result-1',
    studentId: 'test-student-1',
    studentName: 'John Doe',
    studentRegNumber: 'TVT/001/2024',
    unitId: 'CS101',
    unitCode: 'CS101',
    unitName: 'Introduction to Programming',
    lecturerId: 'lec-1',
    lecturerName: 'Dr. Alice Johnson',
    semester: '2',
    year: 2024,
    marks: 85,
    grade: 'A',
    assessmentType: 'exam',
    status: 'pending',
    canEdit: true,
    submittedAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'result-2',
    studentId: 'test-student-1',
    studentName: 'John Doe',
    studentRegNumber: 'TVT/001/2024',
    unitId: 'CS102',
    unitCode: 'CS102',
    unitName: 'Data Structures',
    lecturerId: 'lec-2',
    lecturerName: 'Prof. Bob Wilson',
    semester: '2',
    year: 2024,
    marks: 75,
    grade: 'A',
    assessmentType: 'cat',
    status: 'approved',
    approvedBy: 'hod-1',
    approvedAt: new Date('2024-11-30'),
    canEdit: false,
    submittedAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-11-30')
  },
  {
    id: 'result-3',
    studentId: 'test-student-2',
    studentName: 'Jane Smith',
    studentRegNumber: 'TVT/002/2024',
    unitId: 'EE101',
    unitCode: 'EE101',
    unitName: 'Circuit Analysis',
    lecturerId: 'lec-3',
    lecturerName: 'Dr. Carol Davis',
    semester: '1',
    year: 2024,
    marks: 65,
    grade: 'B',
    assessmentType: 'exam',
    status: 'pending',
    canEdit: true,
    submittedAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'result-4',
    studentId: 'test-student-1',
    studentName: 'John Doe',
    studentRegNumber: 'TVT/001/2024',
    unitId: 'CS103',
    unitCode: 'CS103',
    unitName: 'Database Systems',
    lecturerId: 'lec-1',
    lecturerName: 'Dr. Alice Johnson',
    semester: '2',
    year: 2024,
    marks: 45,
    grade: 'D',
    assessmentType: 'assignment',
    status: 'rejected',
    rejectedReason: 'Marks seem too low for this student\'s usual performance. Please verify.',
    canEdit: true,
    submittedAt: new Date('2024-11-28'),
    updatedAt: new Date('2024-11-30')
  }
];

const testHODUser = {
  id: 'hod-1',
  name: 'Dr. Robert Williams',
  email: 'robert.williams@tvt.ac.ke',
  role: 'hod',
  department: 'Computer Science'
};

const testLecturerUser = {
  id: 'lec-1',
  name: 'Dr. Alice Johnson',
  email: 'alice.johnson@tvt.ac.ke',
  role: 'lecturer',
  department: 'Computer Science'
};

// Grade Vault Test Functions
function calculateTestGPA(results) {
  if (!results || results.length === 0) return 0;
  
  const approvedResults = results.filter(r => r.status === 'approved');
  if (approvedResults.length === 0) return 0;
  
  const gradePoints = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'E': 0.0
  };
  
  const totalPoints = approvedResults.reduce((sum, result) => {
    return sum + (gradePoints[result.grade] || 0);
  }, 0);
  
  return totalPoints / approvedResults.length;
}

function getTestStatistics(results) {
  const stats = {
    totalResults: results.length,
    pendingApproval: results.filter(r => r.status === 'pending').length,
    approvedResults: results.filter(r => r.status === 'approved').length,
    rejectedResults: results.filter(r => r.status === 'rejected').length,
    averageGPA: 0,
    gradeDistribution: {
      A: results.filter(r => r.grade === 'A').length,
      B: results.filter(r => r.grade === 'B').length,
      C: results.filter(r => r.grade === 'C').length,
      D: results.filter(r => r.grade === 'D').length,
      E: results.filter(r => r.grade === 'E').length,
      I: results.filter(r => r.grade === 'I').length,
      missing: results.filter(r => r.grade === '*').length,
      retake: results.filter(r => r.grade === '#').length
    }
  };
  
  // Calculate average GPA for all students
  const studentGPAs = testStudents.map(student => {
    const studentResults = results.filter(r => r.studentId === student.id);
    return calculateTestGPA(studentResults);
  });
  
  stats.averageGPA = studentGPAs.reduce((sum, gpa) => sum + gpa, 0) / studentGPAs.length;
  
  return stats;
}

// Export test data
console.log('📊 Grade Vault Test Data Generated:');
console.log(`✅ ${testStudents.length} test students`);
console.log(`✅ ${testGradeVaultResults.length} test results`);
console.log(`✅ Statistics:`, getTestStatistics(testGradeVaultResults));

// Test TVET Grading Scale
function testGradeCalculation() {
  const testMarks = [95, 85, 75, 65, 55, 45, 35, 25];
  
  console.log('\n🎯 TVET Grading Scale Test:');
  testMarks.forEach(marks => {
    let grade = 'E';
    if (marks >= 70) grade = 'A';
    else if (marks >= 60) grade = 'B';
    else if (marks >= 50) grade = 'C';
    else if (marks >= 40) grade = 'D';
    
    console.log(`${marks} marks = Grade ${grade}`);
  });
}

testGradeCalculation();

// Export for use in the application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testStudents,
    testGradeVaultResults,
    testHODUser,
    testLecturerUser,
    calculateTestGPA,
    getTestStatistics
  };
}
