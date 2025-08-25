import fetch from 'node-fetch';

async function testApiPorts() {
  console.log('🔍 Testing API endpoints on different ports...\n');
  
  const ports = [3000, 3001, 8080];
  
  for (const port of ports) {
    console.log(`🔍 Testing port ${port}...`);
    
    try {
      const response = await fetch(`http://localhost:${port}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'test123' 
        }),
        timeout: 5000
      });
      
      const data = await response.json();
      console.log(`✅ Port ${port} - API responded!`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Port ${port} - No server running`);
      } else if (error.message.includes('404')) {
        console.log(`❌ Port ${port} - Server running but no /api/auth/verify endpoint`);
      } else {
        console.log(`❌ Port ${port} - Error:`, error.message);
      }
    }
    console.log('');
  }
}

testApiPorts();
