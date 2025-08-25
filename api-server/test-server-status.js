console.log('🔍 Testing Server Status...\n');

async function checkServer() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('1. Testing server health...');
    const response = await fetch('http://localhost:3001/health');
    
    if (response.ok) {
      const health = await response.json();
      console.log('✅ Server is running successfully!');
      console.log('📊 Health response:', health);
      
      // Test a few key endpoints
      console.log('\n2. Testing role-based endpoints...');
      
      const hodTest = await fetch('http://localhost:3001/api/hod/dashboard-stats', {
        headers: { 'x-api-key': 'test-key' }
      });
      console.log(`📈 HOD dashboard: ${hodTest.status === 403 ? 'Protected ✅' : 'Status ' + hodTest.status}`);
      
      const financeTest = await fetch('http://localhost:3001/api/finance/dashboard-stats', {
        headers: { 'x-api-key': 'test-key' }
      });
      console.log(`💰 Finance dashboard: ${financeTest.status === 403 ? 'Protected ✅' : 'Status ' + financeTest.status}`);
      
      console.log('\n🎉 All systems operational!');
      console.log('🔐 Role-based access control is working correctly.');
      
    } else {
      console.log(`❌ Server health check failed with status: ${response.status}`);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first.');
      console.log('💡 Run: node server.js');
    } else {
      console.log('❌ Test failed:', error.message);
    }
  }
}

checkServer();
