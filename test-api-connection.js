// Simple test to verify API server connectivity
console.log('Testing API server connectivity...');

const API_URL = 'http://localhost:3001/api';
const API_KEY = 'tvet_1fd0f562039f427aac9bf7bdf515b804';

async function testConnection() {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    console.log('Health status:', healthResponse.status);
    console.log('Health response:', await healthResponse.text());
  } catch (error) {
    console.error('Health check failed:', error.message);
  }

  try {
    console.log('Testing CORS with auth verify...');
    const authResponse = await fetch(`${API_URL}/auth/verify`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, x-api-key'
      }
    });
    console.log('CORS preflight status:', authResponse.status);
    console.log('CORS headers:', Object.fromEntries(authResponse.headers.entries()));
  } catch (error) {
    console.error('CORS test failed:', error.message);
  }

  try {
    console.log('Testing auth endpoint...');
    const testResponse = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Origin': 'http://localhost:8081'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test'
      })
    });
    console.log('Auth test status:', testResponse.status);
    console.log('Auth response:', await testResponse.text());
  } catch (error) {
    console.error('Auth test failed:', error.message);
  }
}

testConnection();
