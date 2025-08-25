import fetch from 'node-fetch';

async function checkServers() {
  console.log('🔍 Checking if servers are running...\n');
  
  // Check API server (port 3000)
  try {
    const apiResponse = await fetch('http://localhost:3000/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
      timeout: 3000
    });
    console.log('✅ API Server (port 3000) is running!');
  } catch (error) {
    console.log('❌ API Server (port 3000) is NOT running');
  }
  
  // Check Grade Vault frontend (usually port 5173 for Vite)
  try {
    const frontendResponse = await fetch('http://localhost:5173', {
      timeout: 3000
    });
    console.log('✅ Grade Vault Frontend (port 5173) is running!');
  } catch (error) {
    console.log('❌ Grade Vault Frontend (port 5173) is NOT running');
  }
  
  // Check alternative ports
  for (const port of [3001, 4173, 8080]) {
    try {
      const response = await fetch(`http://localhost:${port}`, { timeout: 2000 });
      console.log(`✅ Found server running on port ${port}`);
    } catch (error) {
      // Ignore
    }
  }
}

checkServers();
