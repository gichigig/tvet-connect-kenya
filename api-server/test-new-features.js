// Test Grade Vault TVET New Features
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';
const TEST_STUDENT = {
  email: 'read.student@tvet.ac.ke',
  password: 'student123'
};

let authToken = null;

async function login() {
  console.log('🔐 Logging in...');
  
  const response = await fetch(`${API_BASE}/auth/student-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'development-key-2024'
    },
    body: JSON.stringify(TEST_STUDENT)
  });

  if (response.ok) {
    const data = await response.json();
    authToken = data.token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log('❌ Login failed:', await response.text());
    return false;
  }
}

async function testFeeBalance() {
  console.log('\n💰 Testing Fee Balance...');
  
  const response = await fetch(`${API_BASE}/me/fee-balance`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Fee balance retrieved');
    console.log(`   Total Fees: KSh ${data.feeBalance.totalFees}`);
    console.log(`   Total Paid: KSh ${data.feeBalance.totalPaid}`);
    console.log(`   Balance: KSh ${data.feeBalance.balance}`);
    console.log(`   Course: ${data.feeBalance.course}`);
  } else {
    console.log('❌ Fee balance failed:', await response.text());
  }
}

async function testFeeStructure() {
  console.log('\n📋 Testing Fee Structure...');
  
  const response = await fetch(`${API_BASE}/me/fee-structure`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Fee structure retrieved');
    console.log(`   Tuition Fee: KSh ${data.feeStructure.tuitionFee}`);
    console.log(`   Exam Fee: KSh ${data.feeStructure.examFee}`);
    console.log(`   Library Fee: KSh ${data.feeStructure.libraryFee}`);
    console.log(`   Lab Fee: KSh ${data.feeStructure.labFee}`);
    console.log(`   Total per Semester: KSh ${data.feeStructure.totalPerSemester}`);
  } else {
    console.log('❌ Fee structure failed:', await response.text());
  }
}

async function testClearanceApplication() {
  console.log('\n🗂️ Testing Clearance Application...');
  
  const clearanceData = {
    type: 'academic',
    reason: 'Requesting academic clearance for semester completion',
    documents: ['transcript-request.pdf', 'id-copy.pdf']
  };

  const response = await fetch(`${API_BASE}/me/apply-clearance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(clearanceData)
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Clearance application submitted');
    console.log(`   Application ID: ${data.applicationId}`);
    console.log(`   Type: ${data.application.type}`);
    console.log(`   Status: ${data.application.status}`);
  } else {
    console.log('❌ Clearance application failed:', await response.text());
  }
}

async function testDefermentApplication() {
  console.log('\n⏸️ Testing Deferment Application...');
  
  const defermentData = {
    semester: 2,
    academicYear: '2024/2025',
    reason: 'Medical reasons requiring semester deferment',
    documents: ['medical-certificate.pdf']
  };

  const response = await fetch(`${API_BASE}/me/defer-semester`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(defermentData)
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Deferment application submitted');
    console.log(`   Application ID: ${data.applicationId}`);
    console.log(`   Semester: ${data.application.semester}`);
    console.log(`   Academic Year: ${data.application.academicYear}`);
    console.log(`   Status: ${data.application.status}`);
  } else {
    console.log('❌ Deferment application failed:', await response.text());
  }
}

async function testAvailableUnits() {
  console.log('\n📚 Testing Available Units...');
  
  const response = await fetch(`${API_BASE}/me/available-units?semester=1`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Available units retrieved');
    console.log(`   Total Available: ${data.totalAvailable}`);
    console.log(`   Total Registered: ${data.totalRegistered}`);
    console.log(`   Course: ${data.course}`);
    console.log(`   Semester: ${data.semester}`);
    
    if (data.units.length > 0) {
      console.log(`   Sample Unit: ${data.units[0].name} (${data.units[0].code})`);
    }
  } else {
    console.log('❌ Available units failed:', await response.text());
  }
}

async function testUnitRegistration() {
  console.log('\n📝 Testing Unit Registration...');
  
  // First get available units
  const unitsResponse = await fetch(`${API_BASE}/me/available-units?semester=1`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (unitsResponse.ok) {
    const unitsData = await unitsResponse.json();
    const availableUnits = unitsData.units.filter(unit => unit.canRegister);
    
    if (availableUnits.length === 0) {
      console.log('⚠️ No units available for registration');
      return;
    }

    const registrationData = {
      unitIds: [availableUnits[0].id], // Register for first available unit
      semester: 1,
      academicYear: '2024/2025'
    };

    const response = await fetch(`${API_BASE}/me/register-units`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Unit registration successful');
      console.log(`   Registered Units: ${data.registrations.length}`);
    } else {
      console.log('❌ Unit registration failed:', await response.text());
    }
  } else {
    console.log('❌ Could not fetch units for registration');
  }
}

async function testApplicationsList() {
  console.log('\n📄 Testing Applications List...');
  
  const response = await fetch(`${API_BASE}/me/applications`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Applications list retrieved');
    console.log(`   Total Applications: ${data.applications.length}`);
    
    if (data.applications.length > 0) {
      const recent = data.applications[0];
      console.log(`   Recent Application: ${recent.type} - ${recent.status}`);
    }
  } else {
    console.log('❌ Applications list failed:', await response.text());
  }
}

async function runAllTests() {
  console.log('🧪 TESTING GRADE VAULT TVET NEW FEATURES');
  console.log('=' .repeat(60));

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('🛑 Cannot run tests without authentication');
    return;
  }

  // Test all new features
  await testFeeBalance();
  await testFeeStructure();
  await testClearanceApplication();
  await testDefermentApplication();
  await testAvailableUnits();
  await testUnitRegistration();
  await testApplicationsList();

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 GRADE VAULT TVET FEATURE TESTING COMPLETE!');
  console.log('\n📱 New Features Available in Grade Vault TVET:');
  console.log('   ✅ Fee Balance View');
  console.log('   ✅ Fee Structure View');
  console.log('   ✅ Clearance Applications');
  console.log('   ✅ Semester Deferment');
  console.log('   ✅ Unit Registration');
  console.log('   ✅ Applications Tracking');
  console.log('\n🔧 Admin Features Available in TVET Connect Kenya:');
  console.log('   ✅ Review Clearance Applications');
  console.log('   ✅ Review Deferment Applications');
  console.log('   ✅ Manage Fee Structures');
  console.log('   ✅ View Unit Registrations');
}

// Run tests
runAllTests().catch(console.error);
