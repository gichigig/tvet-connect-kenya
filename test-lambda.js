// Simple test to check if Lambda endpoint is accessible
const LAMBDA_ENDPOINT = 'https://5tdpymqo3b.execute-api.eu-north-1.amazonaws.com/prod/generate-signed-url';

async function testLambda() {
  console.log('Testing Lambda endpoint:', LAMBDA_ENDPOINT);
  
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test.txt',
        fileSize: 100,
        fileType: 'text/plain',
        folder: 'test',
      }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success response:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

testLambda();
