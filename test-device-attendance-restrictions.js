/**
 * Test Device-Based Attendance Restrictions
 * Tests the implementation to prevent one device from marking attendance for multiple users
 */

// Import the device fingerprinting functions
import { 
  generateDeviceFingerprint, 
  checkDeviceAttendanceEligibility, 
  recordDeviceAttendanceRestriction 
} from './src/utils/deviceFingerprinting.js';

async function testDeviceAttendanceRestrictions() {
  console.log('🔒 Testing Device-Based Attendance Restrictions...\n');

  try {
    // Step 1: Generate device fingerprint
    console.log('1️⃣ Generating device fingerprint...');
    const deviceFingerprint = await generateDeviceFingerprint();
    console.log(`   Device fingerprint: ${deviceFingerprint.substring(0, 16)}...`);

    // Step 2: Test initial eligibility (should be allowed)
    console.log('\n2️⃣ Testing initial device eligibility...');
    const locationId = 'test-location-123';
    const studentId1 = 'student-001';
    
    const initialEligibility = await checkDeviceAttendanceEligibility(locationId, studentId1);
    console.log(`   Initial eligibility: ${initialEligibility.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    console.log(`   Reason: ${initialEligibility.reason || 'No restrictions'}`);

    // Step 3: Record attendance for first student
    console.log('\n3️⃣ Recording attendance for first student...');
    await recordDeviceAttendanceRestriction(locationId, studentId1, {
      latitude: 40.7128,
      longitude: -74.0060
    });
    console.log('   ✅ Attendance recorded for Student 001');

    // Step 4: Test eligibility for same student (should still be allowed)
    console.log('\n4️⃣ Testing eligibility for same student...');
    const sameStudentEligibility = await checkDeviceAttendanceEligibility(locationId, studentId1);
    console.log(`   Same student eligibility: ${sameStudentEligibility.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    console.log(`   Reason: ${sameStudentEligibility.reason || 'No restrictions'}`);

    // Step 5: Test eligibility for different student (should be blocked)
    console.log('\n5️⃣ Testing eligibility for different student on same device...');
    const studentId2 = 'student-002';
    const differentStudentEligibility = await checkDeviceAttendanceEligibility(locationId, studentId2);
    console.log(`   Different student eligibility: ${differentStudentEligibility.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    console.log(`   Reason: ${differentStudentEligibility.reason || 'No restrictions'}`);

    // Step 6: Test with different location (should be allowed)
    console.log('\n6️⃣ Testing with different location...');
    const differentLocationId = 'test-location-456';
    const differentLocationEligibility = await checkDeviceAttendanceEligibility(differentLocationId, studentId2);
    console.log(`   Different location eligibility: ${differentLocationEligibility.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    console.log(`   Reason: ${differentLocationEligibility.reason || 'No restrictions'}`);

    // Step 7: Test restriction cleanup (simulate time passage)
    console.log('\n7️⃣ Testing restriction cleanup (24-hour expiry simulation)...');
    
    // Manually simulate expired restriction by modifying localStorage
    const restrictions = JSON.parse(localStorage.getItem('device_attendance_restrictions') || '[]');
    if (restrictions.length > 0) {
      // Make the restriction appear to be from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      restrictions[0].timestamp = yesterday.toISOString();
      localStorage.setItem('device_attendance_restrictions', JSON.stringify(restrictions));
      
      // Now test eligibility again
      const expiredRestrictionEligibility = await checkDeviceAttendanceEligibility(locationId, studentId2);
      console.log(`   After expiry simulation: ${expiredRestrictionEligibility.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
      console.log(`   Reason: ${expiredRestrictionEligibility.reason || 'Restrictions expired'}`);
    }

    console.log('\n🎉 Device-Based Attendance Restriction Test Complete!');
    
    // Expected Results Summary
    console.log('\n📊 Expected Results Summary:');
    console.log('✅ Initial eligibility: ALLOWED (no prior restrictions)');
    console.log('✅ Same student after attendance: ALLOWED (same student can check status)');
    console.log('❌ Different student same device: BLOCKED (prevents fraud)');
    console.log('✅ Different location: ALLOWED (location-specific restrictions)');
    console.log('✅ After 24-hour expiry: ALLOWED (restrictions auto-expire)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  testDeviceAttendanceRestrictions();
} else {
  console.log('This test should be run in a browser environment with localStorage support');
}

export { testDeviceAttendanceRestrictions };
