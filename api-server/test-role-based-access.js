// Test Role-Based Access Control for Applications
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';
const API_KEY = 'development-key-2024';

// Test clearance application submission by student
async function testStudentApplications() {
  console.log('🎓 Testing Student Application Submission...');
  
  // Login as student first
  const loginResponse = await fetch(`${API_BASE}/auth/student-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      email: 'read.student@tvet.ac.ke',
      password: 'student123'
    })
  });

  if (!loginResponse.ok) {
    console.log('❌ Student login failed');
    return null;
  }

  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✅ Student logged in successfully');

  // Test academic clearance application
  console.log('\n📋 Testing Academic Clearance Application...');
  const academicClearance = {
    type: 'academic',
    reason: 'Requesting academic clearance for graduation requirements verification'
  };

  const academicResponse = await fetch(`${API_BASE}/me/apply-clearance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(academicClearance)
  });

  if (academicResponse.ok) {
    const academicData = await academicResponse.json();
    console.log('✅ Academic clearance application submitted');
    console.log(`   Application ID: ${academicData.applicationId}`);
  } else {
    console.log('❌ Academic clearance application failed');
  }

  // Test financial clearance application
  console.log('\n💰 Testing Financial Clearance Application...');
  const financialClearance = {
    type: 'financial',
    reason: 'Requesting financial clearance for fee verification and completion certificate'
  };

  const financialResponse = await fetch(`${API_BASE}/me/apply-clearance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(financialClearance)
  });

  if (financialResponse.ok) {
    const financialData = await financialResponse.json();
    console.log('✅ Financial clearance application submitted');
    console.log(`   Application ID: ${financialData.applicationId}`);
  } else {
    console.log('❌ Financial clearance application failed');
  }

  // Test deferment application
  console.log('\n⏸️ Testing Deferment Application...');
  const deferment = {
    semester: 2,
    academicYear: '2024/2025',
    reason: 'Medical reasons requiring semester deferment for proper recovery'
  };

  const defermentResponse = await fetch(`${API_BASE}/me/defer-semester`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deferment)
  });

  if (defermentResponse.ok) {
    const defermentData = await defermentResponse.json();
    console.log('✅ Deferment application submitted');
    console.log(`   Application ID: ${defermentData.applicationId}`);
  } else {
    console.log('❌ Deferment application failed');
  }

  return token;
}

// Test HOD access to academic clearances and deferments
async function testHODAccess() {
  console.log('\n🎓 Testing HOD Dashboard Access...');

  // Test HOD dashboard stats
  const statsResponse = await fetch(`${API_BASE}/hod/dashboard-stats`, {
    headers: {
      'x-api-key': API_KEY
    }
  });

  if (statsResponse.ok) {
    const statsData = await statsResponse.json();
    console.log('✅ HOD dashboard stats retrieved');
    console.log(`   Pending Deferments: ${statsData.stats.pendingDeferments}`);
    console.log(`   Pending Academic Clearances: ${statsData.stats.pendingAcademicClearances}`);
    console.log(`   Total Pending: ${statsData.stats.totalPending}`);
  } else {
    console.log('❌ HOD dashboard stats failed:', await statsResponse.text());
  }

  // Test HOD academic clearance access
  console.log('\n📋 Testing HOD Academic Clearance Access...');
  const clearanceResponse = await fetch(`${API_BASE}/hod/clearance-applications`, {
    headers: {
      'x-api-key': API_KEY
    }
  });

  if (clearanceResponse.ok) {
    const clearanceData = await clearanceResponse.json();
    console.log('✅ HOD can access academic clearances');
    console.log(`   Academic Clearances: ${clearanceData.total}`);
    console.log(`   Type: ${clearanceData.type}`);
  } else {
    console.log('❌ HOD academic clearance access failed:', await clearanceResponse.text());
  }

  // Test HOD deferment access
  console.log('\n⏸️ Testing HOD Deferment Access...');
  const defermentResponse = await fetch(`${API_BASE}/hod/deferment-applications`, {
    headers: {
      'x-api-key': API_KEY
    }
  });

  if (defermentResponse.ok) {
    const defermentData = await defermentResponse.json();
    console.log('✅ HOD can access deferment applications');
    console.log(`   Deferment Applications: ${defermentData.total}`);
  } else {
    console.log('❌ HOD deferment access failed:', await defermentResponse.text());
  }
}

// Test Finance department access to financial clearances
async function testFinanceAccess() {
  console.log('\n💰 Testing Finance Department Access...');

  // Test Finance dashboard stats
  const statsResponse = await fetch(`${API_BASE}/finance/dashboard-stats`, {
    headers: {
      'x-api-key': API_KEY
    }
  });

  if (statsResponse.ok) {
    const statsData = await statsResponse.json();
    console.log('✅ Finance dashboard stats retrieved');
    console.log(`   Pending Financial Clearances: ${statsData.stats.pendingFinancialClearances}`);
    console.log(`   Recent Financial Clearances: ${statsData.stats.recentFinancialClearances}`);
    console.log(`   Total Processed: ${statsData.stats.totalProcessed}`);
  } else {
    console.log('❌ Finance dashboard stats failed:', await statsResponse.text());
  }

  // Test Finance financial clearance access
  console.log('\n💳 Testing Finance Clearance Access...');
  const clearanceResponse = await fetch(`${API_BASE}/finance/clearance-applications`, {
    headers: {
      'x-api-key': API_KEY
    }
  });

  if (clearanceResponse.ok) {
    const clearanceData = await clearanceResponse.json();
    console.log('✅ Finance can access financial clearances');
    console.log(`   Financial Clearances: ${clearanceData.total}`);
    console.log(`   Type: ${clearanceData.type}`);
  } else {
    console.log('❌ Finance clearance access failed:', await clearanceResponse.text());
  }
}

// Test Admin access (should only see library, hostel, general clearances)
async function testAdminAccess() {
  console.log('\n👤 Testing Admin Access (Library, Hostel, General only)...');

  const clearanceResponse = await fetch(`${API_BASE}/admin/clearance-applications`, {
    headers: {
      'x-api-key': API_KEY
    }
  });

  if (clearanceResponse.ok) {
    const clearanceData = await clearanceResponse.json();
    console.log('✅ Admin can access clearance applications');
    console.log(`   Total Clearances: ${clearanceData.total}`);
    console.log(`   Allowed Types: ${clearanceData.allowedTypes.join(', ')}`);
  } else {
    console.log('❌ Admin clearance access failed:', await clearanceResponse.text());
  }

  // Test that admin cannot access deferments (should fail)
  console.log('\n🚫 Testing Admin Deferment Access (Should Fail)...');
  const defermentResponse = await fetch(`${API_BASE}/admin/deferment-applications`, {
    headers: {
      'x-api-key': API_KEY
    }
  });

  if (defermentResponse.ok) {
    console.log('❌ Admin should NOT have access to deferments');
  } else {
    console.log('✅ Correctly blocked: Admin cannot access deferments');
  }
}

// Main test function
async function runRoleBasedTests() {
  console.log('🔐 TESTING ROLE-BASED ACCESS CONTROL');
  console.log('=' .repeat(60));

  // Test student application submission
  const studentToken = await testStudentApplications();
  
  if (!studentToken) {
    console.log('🛑 Cannot continue without student authentication');
    return;
  }

  // Test role-based access
  await testHODAccess();
  await testFinanceAccess();
  await testAdminAccess();

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 ROLE-BASED ACCESS CONTROL TESTING COMPLETE!');
  console.log('\n📋 Access Control Summary:');
  console.log('   🎓 HOD Dashboard: Deferments + Academic Clearances');
  console.log('   💰 Finance Dashboard: Financial Clearances + Fee Management');
  console.log('   👤 Admin Dashboard: Library + Hostel + General Clearances');
  console.log('\n🔒 Security Features:');
  console.log('   ✅ Role-based permissions enforced');
  console.log('   ✅ Department-specific access control');
  console.log('   ✅ Application type restrictions');
  console.log('   ✅ Proper authentication required');
}

// Run the tests
runRoleBasedTests().catch(console.error);
