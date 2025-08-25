/**
 * CORS Upload Test - Verify Lambda endpoint accessibility
 */

import { uploadWithCORSHandling, getUploadErrorMessage, isCORSError } from '../src/services/CORSAwareUpload';

async function testCORSUpload() {
  console.log('🧪 Testing CORS-aware Lambda upload system');
  console.log('===============================================');

  try {
    // Create a test file
    const testContent = 'This is a test file for CORS upload verification';
    const testFile = new File([testContent], 'cors-test.txt', {
      type: 'text/plain'
    });

    console.log('📁 Created test file:', testFile.name, `(${testFile.size} bytes)`);

    // Test the CORS-aware upload
    console.log('🚀 Attempting CORS-aware upload to Lambda endpoint...');
    
    const testFolder = 'test-uploads/cors-verification';
    const startTime = Date.now();

    const result = await uploadWithCORSHandling(testFile, testFolder, {
      maxRetries: 2,
      retryDelay: 500,
      enableFallback: true
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ Upload successful!');
    console.log(`📊 Upload completed in ${duration}ms`);
    console.log(`🔗 File URL: ${result}`);
    console.log(`📂 Folder: ${testFolder}`);

    // Test error message formatting
    console.log('\n🔍 Testing error message formatting...');
    
    const mockCORSError = new TypeError('Failed to fetch');
    console.log(`CORS Error: "${getUploadErrorMessage(mockCORSError)}"`);
    console.log(`Is CORS Error: ${isCORSError(mockCORSError)}`);

    const mock401Error = new Error('401 Unauthorized');
    console.log(`Auth Error: "${getUploadErrorMessage(mock401Error)}"`);

    console.log('\n🎉 CORS upload test completed successfully!');
    console.log('✨ Lambda endpoint is accessible and working');

    return true;

  } catch (error) {
    console.error('❌ CORS upload test failed:', error);
    
    if (isCORSError(error)) {
      console.log('🔒 CORS issue detected - this is expected in some development environments');
      console.log('💡 The fallback mechanism should handle this gracefully');
    }
    
    console.log(`📝 Error message for user: "${getUploadErrorMessage(error)}"`);
    
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testCORSUpload = testCORSUpload;
  console.log('🔧 CORS upload test available as: window.testCORSUpload()');
}

export { testCORSUpload };
