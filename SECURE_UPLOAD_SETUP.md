# Secure File Upload Integration - Setup Guide

## Overview
This integration implements the secure file upload flow you described:

```
[User Signs In] → Firebase Auth
        ↓
[Client gets Firebase ID Token]
        ↓
[Client sends token + file info to Backend]
        ↓
[Backend verifies Firebase token]
        ↓
[Backend generates signed URL for S3]
        ↓
[Client uses signed URL to upload file to S3]
```

## Prerequisites

### 1. Firebase Configuration
Ensure your Firebase project has the necessary configuration:

```bash
# Set AWS credentials in Firebase Functions
firebase functions:config:set aws.region="your-aws-region"
firebase functions:config:set aws.access_key_id="YOUR_***REMOVED***"
firebase functions:config:set aws.secret_access_key="YOUR_***REMOVED***"
firebase functions:config:set aws.bucket_name="your-s3-bucket-name"
```

### 2. AWS S3 Bucket Configuration
Your S3 bucket should have CORS configured to allow uploads from your domain:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT"],
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Implementation Components

### 1. Firebase Function (`functions/index.js`)
- **Function**: `generateSignedUrl`
- **Purpose**: Verifies Firebase Auth token and generates S3 signed URLs
- **Security**: Only authenticated users can call this function

### 2. Frontend Utilities

#### a) Secure Upload (`src/integrations/aws/secureUpload.ts`)
- **Main function**: `uploadFileSecurely()`
- **Specialized functions**: 
  - `uploadProfilePictureSecurely()`
  - `uploadStudentDocumentSecurely()`
  - `uploadCourseMaterialSecurely()`

#### b) React Hook (`src/hooks/useSecureUpload.ts`)
- **Purpose**: Easy-to-use hook with loading states and error handling
- **Features**: Upload progress, error states, multiple upload types

### 3. Updated Components
- **UnitDetailManager**: Now uses secure upload for course materials
- **Profile Updates**: Updated to use secure upload pattern

## Usage Examples

### Basic File Upload
```tsx
import { useSecureUpload } from '@/hooks/useSecureUpload';

function MyComponent() {
  const { uploadFile, isUploading, error } = useSecureUpload();
  
  const handleUpload = async (file: File) => {
    try {
      const url = await uploadFile(file, 'my-folder');
      console.log('File uploaded:', url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }} />
      {isUploading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Profile Picture Upload
```tsx
import { uploadProfilePictureSecurely } from '@/integrations/aws/secureUpload';

const handleProfileUpload = async (file: File, userId: string) => {
  try {
    const url = await uploadProfilePictureSecurely(file, userId);
    // Update UI with new profile picture URL
  } catch (error) {
    console.error('Profile upload failed:', error);
  }
};
```

## Security Features

### 1. Authentication Required
- All uploads require valid Firebase Auth token
- Backend verifies token before generating signed URLs

### 2. File Validation
- Type restrictions (images for profile pictures, documents for student files)
- Size limits (5MB for profile pictures, 10MB for documents, 50MB for course materials)
- Malicious file detection

### 3. Temporary Access
- Signed URLs expire in 10 minutes
- No permanent public access to upload endpoints

### 4. Organized Storage
- Files organized by type and user/course ID
- Automatic cleanup of old profile pictures

## Deployment Steps

### 1. Deploy Firebase Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### 2. Update Frontend Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Ensure your `.env` file has Firebase configuration for functions.

### 4. Test the Integration
1. Try uploading a profile picture
2. Upload course materials in UnitDetailManager
3. Check AWS S3 bucket for uploaded files

## Monitoring and Debugging

### 1. Firebase Functions Logs
```bash
firebase functions:log --only generateSignedUrl
```

### 2. Frontend Console
- Upload progress is logged in browser console
- Error messages are displayed to users via toast notifications

### 3. S3 Access Logs
- Enable S3 access logging to monitor upload success/failure

## Benefits of This Implementation

✅ **Security**: Firebase Auth protects against unauthorized uploads
✅ **Performance**: Files upload directly to S3 (no backend bottleneck)
✅ **Scalability**: Backend only handles auth, not file transfer
✅ **User Experience**: Real-time upload progress and error handling
✅ **Cost Effective**: Minimal server resources used
✅ **Reliability**: AWS S3's 99.999999999% durability

## Next Steps

1. **Deploy the Firebase Function** with your AWS credentials
2. **Test profile picture uploads** to verify the integration works
3. **Update other components** to use the secure upload pattern
4. **Set up monitoring** to track upload success rates
5. **Add file deletion functionality** using the same secure pattern

The integration is now ready to use! Your file uploads will follow the exact secure pattern you described.
