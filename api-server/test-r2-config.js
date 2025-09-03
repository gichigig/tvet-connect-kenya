/**
 * Test R2 Configuration and Connection
 * Verifies that R2 credentials are properly configured
 */

import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

console.log('Testing Cloudflare R2 Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? '✓ Set' : '✗ Missing');
console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing');
console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME ? '✓ Set' : '✗ Missing');
console.log('R2_CUSTOM_DOMAIN:', process.env.R2_CUSTOM_DOMAIN ? '✓ Set' : '✗ Not set (optional)');
console.log();

// Test R2 connection
if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  console.log('Testing R2 Connection...');
  
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
  });

  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✓ R2 Connection Successful!');
    console.log('Available buckets:', response.Buckets?.map(b => b.Name).join(', ') || 'None');
    
    // Check if our bucket exists
    const targetBucket = process.env.R2_BUCKET_NAME;
    const bucketExists = response.Buckets?.some(b => b.Name === targetBucket);
    
    if (bucketExists) {
      console.log(`✓ Target bucket "${targetBucket}" exists`);
    } else {
      console.log(`✗ Target bucket "${targetBucket}" does not exist`);
      console.log('Available buckets:', response.Buckets?.map(b => b.Name).join(', ') || 'None');
    }
    
  } catch (error) {
    console.log('✗ R2 Connection Failed:', error.message);
    console.log('Error details:', error);
  }
} else {
  console.log('✗ Cannot test R2 connection - missing required environment variables');
}

console.log('\nNext steps:');
console.log('1. Make sure all R2 environment variables are set in your .env file');
console.log('2. Ensure your R2 bucket exists in Cloudflare');
console.log('3. Verify that your API keys have the correct permissions');
