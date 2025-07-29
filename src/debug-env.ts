// Temporary debug file to check environment variables
console.log('=== Environment Variables Debug ===');
console.log('Firebase Config:');
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? 'EXISTS' : 'MISSING');
console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'EXISTS' : 'MISSING');
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'EXISTS' : 'MISSING');

console.log('AWS Config:');
console.log('VITE_AWS_REGION:', import.meta.env.VITE_AWS_REGION ? 'EXISTS' : 'MISSING');
console.log('VITE_***REMOVED***:', import.meta.env.VITE_***REMOVED*** ? 'EXISTS' : 'MISSING');
console.log('VITE_S3_BUCKET_NAME:', import.meta.env.VITE_S3_BUCKET_NAME ? 'EXISTS' : 'MISSING');

console.log('All environment variables:', import.meta.env);
console.log('=== End Debug ===');

export {};
