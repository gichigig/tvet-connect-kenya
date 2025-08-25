/**
 * Test Device Fingerprinting and Attendance Restriction System
 * This script tests the device-based attendance fraud prevention
 */

import { 
  generateDeviceFingerprint, 
  checkDeviceAttendanceEligibility, 
  recordDeviceAttendanceRestriction,
  clearDeviceAttendanceRestrictions
} from './src/utils/deviceFingerprinting.js';

// Test configuration
const TEST_CONFIG = {
  restrictionPeriodMinutes: 1, // Short period for testing
  testUsers: ['student1', 'student2', 'student3'],
  testScenarios: [
    'same_device_multiple_users',
    'different_devices_same_user',
    'restriction_expiry',
    'fingerprint_generation'
  ]
};

// Test utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (test, message, status = 'info') => {
  const timestamp = new Date().toISOString();
  const statusIcon = {
    'pass': '✅',
    'fail': '❌',
    'info': 'ℹ️',
    'warn': '⚠️'
  }[status] || 'ℹ️';
  
  console.log(`[${timestamp}] ${statusIcon} [${test}] ${message}`);
};

/**
 * Test 1: Device Fingerprint Generation
 */
async function testDeviceFingerprintGeneration() {
  log('FINGERPRINT_GEN', 'Testing device fingerprint generation...');
  
  try {
    // Generate multiple fingerprints
    const fingerprint1 = await generateDeviceFingerprint();
    const fingerprint2 = await generateDeviceFingerprint();
    
    if (!fingerprint1 || !fingerprint2) {
      log('FINGERPRINT_GEN', 'Failed to generate device fingerprints', 'fail');
      return false;
    }
    
    // Check fingerprint consistency
    if (fingerprint1 !== fingerprint2) {
      log('FINGERPRINT_GEN', 'Device fingerprints are inconsistent', 'fail');
      log('FINGERPRINT_GEN', `Fingerprint 1: ${fingerprint1}`);
      log('FINGERPRINT_GEN', `Fingerprint 2: ${fingerprint2}`);
      return false;
    }
    
    // Check fingerprint format and length
    if (fingerprint1.length < 32) {
      log('FINGERPRINT_GEN', `Fingerprint too short: ${fingerprint1.length} characters`, 'warn');
    }
    
    log('FINGERPRINT_GEN', `Device fingerprint: ${fingerprint1}`, 'pass');
    log('FINGERPRINT_GEN', 'Device fingerprint generation test passed', 'pass');
    return true;
    
  } catch (error) {
    log('FINGERPRINT_GEN', `Error: ${error.message}`, 'fail');
    return false;
  }
}

/**
 * Test 2: Same Device Multiple Users Restriction
 */
async function testSameDeviceMultipleUsers() {
  log('SAME_DEVICE_MULTI', 'Testing same device multiple users restriction...');
  
  try {
    // Clear any existing restrictions
    clearDeviceAttendanceRestrictions();
    
    // First user marks attendance
    const user1 = TEST_CONFIG.testUsers[0];
    log('SAME_DEVICE_MULTI', `Testing attendance for user: ${user1}`);
    
    // Check initial eligibility
    const eligible1 = await checkDeviceAttendanceEligibility();
    if (!eligible1.eligible) {
      log('SAME_DEVICE_MULTI', `User ${user1} unexpectedly not eligible: ${eligible1.reason}`, 'fail');
      return false;
    }
    
    // Record attendance restriction
    recordDeviceAttendanceRestriction();
    log('SAME_DEVICE_MULTI', `Recorded attendance restriction for ${user1}`, 'info');
    
    // Try second user immediately
    const user2 = TEST_CONFIG.testUsers[1];
    log('SAME_DEVICE_MULTI', `Testing attendance for user: ${user2}`);
    
    const eligible2 = await checkDeviceAttendanceEligibility();
    if (eligible2.eligible) {
      log('SAME_DEVICE_MULTI', `User ${user2} should not be eligible but is`, 'fail');
      return false;
    }
    
    log('SAME_DEVICE_MULTI', `User ${user2} correctly blocked: ${eligible2.reason}`, 'pass');
    log('SAME_DEVICE_MULTI', 'Same device multiple users test passed', 'pass');
    return true;
    
  } catch (error) {
    log('SAME_DEVICE_MULTI', `Error: ${error.message}`, 'fail');
    return false;
  }
}

/**
 * Test 3: Restriction Expiry
 */
async function testRestrictionExpiry() {
  log('RESTRICTION_EXPIRY', 'Testing restriction expiry...');
  
  try {
    // Clear existing restrictions
    clearDeviceAttendanceRestrictions();
    
    // Set short restriction period for testing
    const originalPeriod = localStorage.getItem('deviceRestrictionPeriodMinutes');
    localStorage.setItem('deviceRestrictionPeriodMinutes', '0.1'); // 6 seconds
    
    // Record restriction
    recordDeviceAttendanceRestriction();
    log('RESTRICTION_EXPIRY', 'Recorded device restriction with 6 second expiry');
    
    // Check immediate eligibility
    const eligibleImmediate = await checkDeviceAttendanceEligibility();
    if (eligibleImmediate.eligible) {
      log('RESTRICTION_EXPIRY', 'Device should be restricted immediately', 'fail');
      return false;
    }
    
    // Wait for expiry
    log('RESTRICTION_EXPIRY', 'Waiting for restriction to expire...');
    await delay(7000); // Wait 7 seconds
    
    // Check eligibility after expiry
    const eligibleAfterExpiry = await checkDeviceAttendanceEligibility();
    if (!eligibleAfterExpiry.eligible) {
      log('RESTRICTION_EXPIRY', `Device should be eligible after expiry: ${eligibleAfterExpiry.reason}`, 'fail');
      return false;
    }
    
    // Restore original period
    if (originalPeriod) {
      localStorage.setItem('deviceRestrictionPeriodMinutes', originalPeriod);
    } else {
      localStorage.removeItem('deviceRestrictionPeriodMinutes');
    }
    
    log('RESTRICTION_EXPIRY', 'Restriction expiry test passed', 'pass');
    return true;
    
  } catch (error) {
    log('RESTRICTION_EXPIRY', `Error: ${error.message}`, 'fail');
    return false;
  }
}

/**
 * Test 4: Device Storage and Cleanup
 */
async function testDeviceStorageAndCleanup() {
  log('STORAGE_CLEANUP', 'Testing device storage and cleanup...');
  
  try {
    // Clear existing data
    clearDeviceAttendanceRestrictions();
    
    // Record multiple restrictions
    recordDeviceAttendanceRestriction();
    await delay(100);
    recordDeviceAttendanceRestriction();
    await delay(100);
    recordDeviceAttendanceRestriction();
    
    // Check localStorage
    const storedRestrictions = localStorage.getItem('deviceAttendanceRestrictions');
    if (!storedRestrictions) {
      log('STORAGE_CLEANUP', 'No restrictions found in localStorage', 'fail');
      return false;
    }
    
    const restrictions = JSON.parse(storedRestrictions);
    log('STORAGE_CLEANUP', `Found ${restrictions.length} stored restrictions`, 'info');
    
    if (restrictions.length === 0) {
      log('STORAGE_CLEANUP', 'No restrictions stored', 'fail');
      return false;
    }
    
    // Test cleanup
    clearDeviceAttendanceRestrictions();
    const clearedRestrictions = localStorage.getItem('deviceAttendanceRestrictions');
    
    if (clearedRestrictions && JSON.parse(clearedRestrictions).length > 0) {
      log('STORAGE_CLEANUP', 'Restrictions not properly cleared', 'fail');
      return false;
    }
    
    log('STORAGE_CLEANUP', 'Device storage and cleanup test passed', 'pass');
    return true;
    
  } catch (error) {
    log('STORAGE_CLEANUP', `Error: ${error.message}`, 'fail');
    return false;
  }
}

/**
 * Test 5: Comprehensive Integration Test
 */
async function testComprehensiveIntegration() {
  log('INTEGRATION', 'Running comprehensive integration test...');
  
  try {
    // Clear state
    clearDeviceAttendanceRestrictions();
    
    // Simulate realistic attendance workflow
    const user = TEST_CONFIG.testUsers[0];
    
    // 1. Check initial eligibility
    const initialCheck = await checkDeviceAttendanceEligibility();
    if (!initialCheck.eligible) {
      log('INTEGRATION', `Initial eligibility check failed: ${initialCheck.reason}`, 'fail');
      return false;
    }
    
    // 2. Generate device fingerprint
    const fingerprint = await generateDeviceFingerprint();
    if (!fingerprint) {
      log('INTEGRATION', 'Failed to generate device fingerprint', 'fail');
      return false;
    }
    log('INTEGRATION', `Generated fingerprint: ${fingerprint.substring(0, 16)}...`);
    
    // 3. Mark attendance (record restriction)
    recordDeviceAttendanceRestriction();
    log('INTEGRATION', `Recorded attendance for user: ${user}`);
    
    // 4. Verify restriction is active
    const restrictedCheck = await checkDeviceAttendanceEligibility();
    if (restrictedCheck.eligible) {
      log('INTEGRATION', 'Device should be restricted after attendance', 'fail');
      return false;
    }
    log('INTEGRATION', `Device correctly restricted: ${restrictedCheck.reason}`);
    
    // 5. Simulate different user trying to use same device
    const secondUserCheck = await checkDeviceAttendanceEligibility();
    if (secondUserCheck.eligible) {
      log('INTEGRATION', 'Second user should not be able to use restricted device', 'fail');
      return false;
    }
    log('INTEGRATION', 'Second user correctly blocked from using device');
    
    log('INTEGRATION', 'Comprehensive integration test passed', 'pass');
    return true;
    
  } catch (error) {
    log('INTEGRATION', `Error: ${error.message}`, 'fail');
    return false;
  }
}

/**
 * Run All Tests
 */
async function runAllTests() {
  console.log('🚀 Starting Device Fingerprinting Test Suite\n');
  
  const tests = [
    { name: 'Device Fingerprint Generation', fn: testDeviceFingerprintGeneration },
    { name: 'Same Device Multiple Users', fn: testSameDeviceMultipleUsers },
    { name: 'Restriction Expiry', fn: testRestrictionExpiry },
    { name: 'Storage and Cleanup', fn: testDeviceStorageAndCleanup },
    { name: 'Comprehensive Integration', fn: testComprehensiveIntegration }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        log('TEST_RUNNER', `${test.name} PASSED`, 'pass');
      } else {
        failed++;
        log('TEST_RUNNER', `${test.name} FAILED`, 'fail');
      }
    } catch (error) {
      failed++;
      log('TEST_RUNNER', `${test.name} ERROR: ${error.message}`, 'fail');
    }
    
    // Small delay between tests
    await delay(500);
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Device fingerprinting system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
  
  // Cleanup
  clearDeviceAttendanceRestrictions();
  log('TEST_RUNNER', 'Test cleanup completed');
}

// Export for manual testing
export {
  runAllTests,
  testDeviceFingerprintGeneration,
  testSameDeviceMultipleUsers,
  testRestrictionExpiry,
  testDeviceStorageAndCleanup,
  testComprehensiveIntegration
};

// Run tests if called directly
if (typeof window !== 'undefined' && window.location?.pathname) {
  // Browser environment - add to window for manual testing
  window.deviceFingerprintingTests = {
    runAllTests,
    testDeviceFingerprintGeneration,
    testSameDeviceMultipleUsers,
    testRestrictionExpiry,
    testDeviceStorageAndCleanup,
    testComprehensiveIntegration
  };
  
  console.log('Device fingerprinting tests loaded. Run window.deviceFingerprintingTests.runAllTests() to start.');
} else if (typeof require !== 'undefined') {
  // Node environment
  runAllTests().catch(console.error);
}
