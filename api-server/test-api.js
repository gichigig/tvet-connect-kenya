import fetch from 'node-fetch';

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/hod/unit-registrations', {
      headers: {
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
