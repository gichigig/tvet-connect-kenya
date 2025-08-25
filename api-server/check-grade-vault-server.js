import fetch from 'node-fetch';

async function checkGradeVaultServer() {
  console.log('🔍 Checking if Grade Vault server is running...\n');
  
  try {
    // Test if server is running
    const response = await fetch('http://localhost:3000/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      }),
      timeout: 3000
    });
    
    console.log('✅ Grade Vault server is running!');
    console.log(`📡 Server responded with status: ${response.status}`);
    
    const data = await response.json();
    console.log('📝 Response:', data);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.log('❌ Grade Vault server is NOT running on localhost:3000');
      console.log('\n🔧 To start Grade Vault server:');
      console.log('1. Open a new terminal');
      console.log('2. cd ../grade-vault-tvet');
      console.log('3. npm run dev');
      console.log('4. Wait for "Server running on port 3000"');
      console.log('5. Then re-run this test');
    } else {
      console.log('❌ Error checking server:', error.message);
    }
  }
}

checkGradeVaultServer();
