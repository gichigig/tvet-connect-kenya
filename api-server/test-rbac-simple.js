import fetch from 'node-fetch';

console.log('🔍 Testing Role-Based Access Control...\n');

async function testServer() {
  try {
    // Test if server is running
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:3001/health');
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Server is running:', health.message);
    } else {
      console.log('❌ Server health check failed');
      return;
    }

    // Test HOD endpoints
    console.log('\n2. Testing HOD endpoints...');
    
    const hodTests = [
      { endpoint: '/api/hod/deferment-applications', permission: 'hod:deferment:read' },
      { endpoint: '/api/hod/clearance-applications', permission: 'hod:clearance:read' },
      { endpoint: '/api/hod/dashboard-stats', permission: 'hod:dashboard:read' }
    ];

    for (const test of hodTests) {
      try {
        const response = await fetch(`http://localhost:3001${test.endpoint}`, {
          headers: {
            'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
          }
        });
        
        if (response.status === 403) {
          console.log(`⚠️  ${test.endpoint}: Permission denied (expected for now)`);
        } else if (response.status === 200) {
          console.log(`✅ ${test.endpoint}: Accessible`);
        } else {
          console.log(`❓ ${test.endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${test.endpoint}: ${error.message}`);
      }
    }

    // Test Finance endpoints
    console.log('\n3. Testing Finance endpoints...');
    
    const financeTests = [
      { endpoint: '/api/finance/clearance-applications', permission: 'finance:clearance:read' },
      { endpoint: '/api/finance/dashboard-stats', permission: 'finance:dashboard:read' }
    ];

    for (const test of financeTests) {
      try {
        const response = await fetch(`http://localhost:3001${test.endpoint}`, {
          headers: {
            'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
          }
        });
        
        if (response.status === 403) {
          console.log(`⚠️  ${test.endpoint}: Permission denied (expected for now)`);
        } else if (response.status === 200) {
          console.log(`✅ ${test.endpoint}: Accessible`);
        } else {
          console.log(`❓ ${test.endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${test.endpoint}: ${error.message}`);
      }
    }

    // Test Admin endpoints
    console.log('\n4. Testing Admin endpoints...');
    
    const adminTests = [
      { endpoint: '/api/admin/clearance-applications', permission: 'admin:clearance:read' },
      { endpoint: '/api/admin/fee-structures', permission: 'admin:fees:read' }
    ];

    for (const test of adminTests) {
      try {
        const response = await fetch(`http://localhost:3001${test.endpoint}`, {
          headers: {
            'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
          }
        });
        
        if (response.status === 403) {
          console.log(`⚠️  ${test.endpoint}: Permission denied (expected for now)`);
        } else if (response.status === 200) {
          console.log(`✅ ${test.endpoint}: Accessible`);
        } else {
          console.log(`❓ ${test.endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${test.endpoint}: ${error.message}`);
      }
    }

    console.log('\n🎉 Role-based access control testing completed!');
    console.log('📝 Note: Permission denied responses are expected until API key permissions are configured.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testServer();
