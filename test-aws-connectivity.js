// Test AWS S3 connectivity using environment variables
const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'eu-north-1',
  bucket: process.env.AWS_BUCKET || 'tvet-kenya-uploads-2024',
  accessKeyId: process.env.***REMOVED***,
  secretAccessKey: process.env.***REMOVED***
};

async function testS3Access() {
  console.log('Testing S3 bucket access...');
  
  try {
    // Test with a simple HEAD request to see if bucket exists
    const bucketUrl = `https://${AWS_CONFIG.bucket}.s3.${AWS_CONFIG.region}.amazonaws.com/`;
    
    const response = await fetch(bucketUrl, {
      method: 'HEAD',
    });
    
    console.log('S3 Bucket HEAD request:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
  } catch (error) {
    console.error('S3 connectivity test failed:', error);
  }
}

async function testLambdaEndpoint() {
  console.log('Testing Lambda endpoint...');
  
  const endpoint = 'https://5tdpymqo3b.execute-api.eu-north-1.amazonaws.com/prod/generate-signed-url';
  
  try {
    const response = await fetch(endpoint, {
      method: 'OPTIONS', // Test CORS preflight
    });
    
    console.log('Lambda OPTIONS request:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
  } catch (error) {
    console.error('Lambda connectivity test failed:', error);
  }
}

// Run tests
testS3Access();
testLambdaEndpoint();
