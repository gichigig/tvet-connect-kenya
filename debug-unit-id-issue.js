// Debug script to check unit registration data and semester plan matching
console.log('🔍 Debugging Unit ID and Semester Plan Matching...\n');

// Let me simulate the student unit details view with debug logging
function debugStudentUnitFlow() {
  console.log('=== STUDENT UNIT FLOW DEBUG ===');
  
  // Simulating the unit that a student would click on in UnitDetails
  const simulatedStudentUnit = {
    id: "1", // This is the registration ID, not the unit ID
    code: "CS201",
    name: "Data Structures",
    lecturer: "Dr. Jane Smith",
    credits: 3,
    progress: 75,
    nextClass: "Mon 9:00 AM",
    status: "active",
    semester: "Semester 1"
  };
  
  console.log('1. Student clicks on unit:', simulatedStudentUnit);
  console.log('   - Unit ID being passed to getStudentSemesterPlan:', simulatedStudentUnit.id);
  console.log('   - This ID is actually the REGISTRATION ID, not the UNIT ID!');
  
  console.log('\n2. The issue: Registration ID vs Unit ID mismatch');
  console.log('   - Student registration has an ID field that is the registration ID');
  console.log('   - But semester plans are stored by UNIT ID (the actual unit identifier)');
  console.log('   - The UnitDetails component is passing registration.id instead of unit.id');
  
  console.log('\n3. The fix needed:');
  console.log('   - In MyUnits.tsx, when converting registrations to Unit objects,');
  console.log('   - Need to use registration.unitId as the unit.id');
  console.log('   - Currently using registration.id which is wrong');
  
  console.log('\n4. Data structure mapping:');
  console.log('   PendingUnitRegistration {');
  console.log('     id: "reg_123",           // ← Currently used as unit.id (WRONG)');
  console.log('     unitId: "unit_456",      // ← Should be used as unit.id (CORRECT)');
  console.log('     unitCode: "CS201",');
  console.log('     unitName: "Data Structures",');
  console.log('     studentId: "student_789"');
  console.log('   }');
  
  console.log('\n5. Semester plans are stored by:');
  console.log('   /api/semester/plans/{unitId} ← This is the actual unit ID, not registration ID');
}

debugStudentUnitFlow();

console.log('\n🎯 SOLUTION: Fix the ID mapping in MyUnits.tsx component');
console.log('Change: id: reg.id → id: reg.unitId');
