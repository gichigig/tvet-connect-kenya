// Test script to verify semester plan to dashboard sync functionality
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testing Semester Plan to Dashboard Sync Functionality');
console.log('='.repeat(60));

// Test 1: Check if all manager components use useDashboardSync
console.log('\n📋 Test 1: Verifying Manager Components Use Dashboard Sync');

const managersToCheck = [
  'src/components/lecturer/AssignmentManager.tsx',
  'src/components/lecturer/ExamManager.tsx', 
  'src/components/lecturer/NotesManager.tsx',
  'src/components/lecturer/AttendanceManager.tsx'
];

let syncCheckResults = [];

managersToCheck.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const usesDashboardSync = content.includes('useDashboardSync');
    const getsContentByType = content.includes('getContentByType');
    
    syncCheckResults.push({
      file: filePath.split('/').pop(),
      usesDashboardSync,
      getsContentByType,
      status: usesDashboardSync && getsContentByType ? '✅' : '❌'
    });
    
    console.log(`  ${usesDashboardSync && getsContentByType ? '✅' : '❌'} ${filePath.split('/').pop()}`);
    if (!usesDashboardSync) console.log(`    ⚠️  Missing useDashboardSync import`);
    if (!getsContentByType) console.log(`    ⚠️  Missing getContentByType usage`);
    
  } catch (error) {
    console.log(`  ❌ ${filePath.split('/').pop()} - File not found`);
    syncCheckResults.push({
      file: filePath.split('/').pop(),
      usesDashboardSync: false,
      getsContentByType: false,
      status: '❌',
      error: 'File not found'
    });
  }
});

// Test 2: Check sync functions in SemesterPlanContext
console.log('\n📋 Test 2: Verifying SemesterPlanContext Sync Functions');

try {
  const contextContent = fs.readFileSync('src/contexts/SemesterPlanContext.tsx', 'utf8');
  
  const syncFunctions = [
    'syncToLecturerDashboard',
    'syncToStudentDashboards'
  ];
  
  syncFunctions.forEach(func => {
    const hasFunction = contextContent.includes(func);
    console.log(`  ${hasFunction ? '✅' : '❌'} ${func} function exists`);
  });
  
  // Check if sync calls are made when adding content
  const syncCalls = [
    'await syncToLecturerDashboard(unitId, material, \'notes\')',
    'await syncToLecturerDashboard(unitId, assignment, \'assignment\')',
    'await syncToLecturerDashboard(unitId, exam,'
  ];
  
  console.log('\n  Sync trigger points:');
  syncCalls.forEach(call => {
    const hasCall = contextContent.includes(call.substring(0, 40));
    console.log(`  ${hasCall ? '✅' : '❌'} ${call.substring(6, 50)}...`);
  });
  
} catch (error) {
  console.log('  ❌ SemesterPlanContext.tsx not found');
}

// Test 3: Check useDashboardSync hook implementation
console.log('\n📋 Test 3: Verifying useDashboardSync Hook Implementation');

try {
  const hookContent = fs.readFileSync('src/hooks/useDashboardSync.ts', 'utf8');
  
  const hookFeatures = [
    { name: 'extractContentFromSemesterPlans', check: 'extractContentFromSemesterPlans' },
    { name: 'getContentByType', check: 'getContentByType' },
    { name: 'Assignment extraction', check: 'week.assignments?.forEach' },
    { name: 'Exam extraction', check: 'week.exams?.forEach' },
    { name: 'Notes/Materials extraction', check: 'week.materials?.forEach' },
    { name: 'Attendance extraction', check: 'week.attendanceSessions?.forEach' },
    { name: 'Online class extraction', check: 'week.onlineClasses?.forEach' },
    { name: 'Refresh function', check: 'refreshSyncedContent' }
  ];
  
  hookFeatures.forEach(feature => {
    const hasFeature = hookContent.includes(feature.check);
    console.log(`  ${hasFeature ? '✅' : '❌'} ${feature.name}`);
  });
  
} catch (error) {
  console.log('  ❌ useDashboardSync.ts not found');
}

// Test 4: Check API endpoint for sync
console.log('\n📋 Test 4: Verifying API Sync Endpoint');

try {
  const apiContent = fs.readFileSync('api-server/routes/enhanced.js', 'utf8');
  
  const apiFeatures = [
    { name: 'dashboard-content POST endpoint', check: 'router.post(\'/dashboard-content\'' },
    { name: 'lecturer dashboard content storage', check: 'lecturerDashboardContent' },
    { name: 'dashboard-content GET endpoint', check: 'dashboard-content\', (req, res)' }
  ];
  
  apiFeatures.forEach(feature => {
    const hasFeature = apiContent.includes(feature.check);
    console.log(`  ${hasFeature ? '✅' : '❌'} ${feature.name}`);
  });
  
} catch (error) {
  console.log('  ❌ enhanced.js API routes not found');
}

// Test 5: Generate sync test data
console.log('\n📋 Test 5: Creating Test Data for Manual Verification');

const testData = {
  testDate: new Date().toISOString(),
  syncResults: syncCheckResults,
  expectedBehavior: {
    'When lecturer creates assignment in semester plan': [
      'Assignment appears in Assignments tab',
      'Assignment has isFromSemesterPlan: true flag',
      'Assignment shows week number and unit info'
    ],
    'When lecturer creates exam/CAT in semester plan': [
      'Exam/CAT appears in Exams & CATs tab',
      'Shows correct type (exam vs cat)',
      'Displays scheduled date and duration'
    ],
    'When lecturer uploads notes in semester plan': [
      'Notes appear in Notes tab',
      'Shows correct unit and week info',
      'Displays upload status and file info'
    ],
    'When lecturer creates attendance session': [
      'Session appears in Attendance tab',
      'Shows scheduled date/time and venue',
      'Displays active/inactive status'
    ]
  },
  troubleshooting: {
    'If content not appearing in tabs': [
      'Check browser console for sync errors',
      'Verify API server is running',
      'Check if lecturer ID matches between semester plan and dashboard',
      'Try refreshing the page to reload synced content'
    ]
  }
};

// Save test results
try {
  fs.writeFileSync(
    'SEMESTER_PLAN_DASHBOARD_SYNC_TEST_RESULTS.json', 
    JSON.stringify(testData, null, 2)
  );
  console.log('  ✅ Test results saved to SEMESTER_PLAN_DASHBOARD_SYNC_TEST_RESULTS.json');
} catch (error) {
  console.log('  ⚠️  Could not save test results file');
}

// Summary
console.log('\n🏁 SYNC VERIFICATION SUMMARY');
console.log('='.repeat(40));
const allPassed = syncCheckResults.every(result => result.status === '✅');
console.log(`Overall Status: ${allPassed ? '✅ PASS' : '❌ NEEDS ATTENTION'}`);

if (!allPassed) {
  console.log('\n🔧 RECOMMENDED FIXES:');
  syncCheckResults.forEach(result => {
    if (result.status === '❌') {
      console.log(`  • Update ${result.file} to use useDashboardSync hook`);
    }
  });
}

console.log('\n📖 MANUAL TESTING STEPS:');
console.log('1. Start API server: cd api-server && npm start');
console.log('2. Start frontend: bun run dev');
console.log('3. Login as lecturer');
console.log('4. Create semester plan with assignments, exams, notes');
console.log('5. Check respective dashboard tabs for synced content');
console.log('6. Look for "synced from semester plans" indicators');

export default testData;
