# AWS S3 Integration Setup Guide

This guide will help you set up Amazon S3 as your storage solution for the TVET Connect Kenya application.

## Prerequisites

1. An AWS account
2. An S3 bucket created
3. IAM user with S3 permissions

## AWS Setup Steps

### 1. Create an S3 Bucket

1. Log in to your [AWS Console](https://console.aws.amazon.com/)
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `tvet-connect-kenya-storage`)
5. Select your preferred region (e.g., `us-east-1`)
6. Configure bucket settings:
   - **Block public access**: Keep all options checked for security
   - **Versioning**: Enable if desired
   - **Server-side encryption**: Enable with Amazon S3-managed keys (SSE-S3)

### 2. Create IAM User and Access Keys

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add user"
3. Enter username (e.g., `tvet-connect-s3-user`)
4. Select "Programmatic access"
5. Create a custom policy with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name/*",
                "arn:aws:s3:::your-bucket-name"
            ]
        }
    ]
}
```

6. Save the **Access Key ID** and **Secret Access Key** (you'll need these for the .env file)

### 3. Configure CORS for Your S3 Bucket

1. Go to your S3 bucket
2. Click on "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Add the following CORS configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "http://localhost:8080", "http://localhost:8085", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

## Application Configuration

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# AWS S3 Configuration
VITE_AWS_REGION=us-east-1
VITE_***REMOVED***=your_access_key_id_here
VITE_***REMOVED***=your_secret_access_key_here
VITE_S3_BUCKET_NAME=your-bucket-name-here
```

**⚠️ Important Security Notes:**
- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use environment-specific configurations for production

### 2. Folder Structure

The application will automatically create the following folder structure in your S3 bucket:

```
your-bucket/
├── proctoring/
│   ├── violations/
│   │   ├── images/     # Violation screenshots
│   │   └── recordings/ # Screen recordings
├── students/
│   └── documents/      # Student documents
├── exams/
│   └── materials/      # Exam materials
└── users/
    └── profiles/       # Profile pictures
```

## Usage Examples

### Upload a Violation Image

```typescript
import { uploadViolationImage } from '@/integrations/aws';

const blob = new Blob([imageData], { type: 'image/jpeg' });
const imageUrl = await uploadViolationImage(blob, sessionId, 'head_turn');
```

### Upload Student Document

```typescript
import { uploadStudentDocument } from '@/integrations/aws';

const documentUrl = await uploadStudentDocument(file, studentId);
```

### Using the React Hook

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

function FileUploadComponent() {
  const { uploadFile, isUploading, progress, error, url } = useFileUpload();

  const handleUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadFile(file, 'STUDENT_DOCUMENTS');
      console.log('File uploaded:', uploadedUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {isUploading && <p>Uploading... {progress}%</p>}
      {error && <p>Error: {error}</p>}
      {url && <p>Uploaded: {url}</p>}
    </div>
  );
}
```

## Migration from Firebase Storage

If you're migrating from Firebase Storage, the following functions have been updated:

- `uploadViolationImage()` - Now uses S3
- `uploadScreenRecording()` - Now uses S3
- All upload functions now return S3 URLs instead of Firebase URLs

## Cost Optimization

- S3 pricing is based on storage used and data transfer
- Consider using S3 Intelligent-Tiering for automatic cost optimization
- Set up lifecycle policies to automatically delete old files or move them to cheaper storage classes

## Security Best Practices

1. **Never expose AWS credentials in client-side code**
2. **Use IAM roles with minimal required permissions**
3. **Enable S3 bucket versioning and MFA delete**
4. **Monitor access logs and set up CloudTrail**
5. **Use signed URLs for temporary access to private files**

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure CORS is properly configured in your S3 bucket
2. **Access Denied**: Verify IAM permissions and bucket policies
3. **Upload Failures**: Check network connectivity and file size limits
4. **Environment Variables**: Ensure all required environment variables are set correctly

### Debug Mode

To enable detailed logging, add this to your browser console:

```javascript
localStorage.setItem('aws-debug', 'true');
```

## Support

If you encounter issues with the S3 integration, check:

1. AWS Console for error messages
2. Browser developer console for JavaScript errors
3. Network tab for failed requests
4. IAM permissions for the user/role
