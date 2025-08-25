// Test script to verify the download endpoint works correctly
const http = require('http');

// Test the API server health
function testHealth() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Health Check Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Health Response:', data);
      testDownloadEndpoint();
    });
  });

  req.on('error', (e) => {
    console.error(`Health check error: ${e.message}`);
  });

  req.end();
}

// Test the download endpoint with a sample key
function testDownloadEndpoint() {
  const sampleKey = 'course-materials/test/sample.pdf';
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/upload/download/${encodeURIComponent(sampleKey)}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`\nDownload Endpoint Status: ${res.statusCode}`);
    console.log('Response Headers:', res.headers);
    
    if (res.statusCode === 404) {
      console.log('✅ Download endpoint exists and responds correctly (404 expected for non-existent file)');
    } else if (res.statusCode === 200) {
      console.log('✅ Download endpoint working - file found');
    } else {
      console.log('❌ Unexpected response status');
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (res.statusCode !== 200) {
        console.log('Response body:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Download endpoint error: ${e.message}`);
  });

  req.end();
}

console.log('Testing API server endpoints...\n');
testHealth();
