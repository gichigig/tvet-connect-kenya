# Cloudflare R2 Storage Setup Guide

## Overview
This guide will help you set up Cloudflare R2 storage for the TVET Connect Kenya project.

## Prerequisites
1. A Cloudflare account
2. Access to Cloudflare R2 storage

## Step 1: Create R2 Bucket
1. Log in to your Cloudflare dashboard
2. Navigate to R2 Object Storage
3. Create a new bucket named `tvet-connect-kenya-r2`
4. Note down your Account ID from the dashboard

## Step 2: Generate API Tokens
1. Go to "Manage R2 API tokens" in your R2 dashboard
2. Create a new R2 API token with the following permissions:
   - Object Read
   - Object Write
   - Object Delete
3. Copy the Access Key ID and Secret Access Key

## Step 3: Set Up Custom Domain (Optional)
1. In your R2 bucket settings, go to "Settings" > "Custom Domains"
2. Add a custom domain like `cdn.tvet-connect-kenya.com`
3. Follow the DNS setup instructions
4. Wait for the domain to be active

## Step 4: Update Environment Variables
Update your `.env` file with the actual values:

```bash
# Storage Configuration
STORAGE_PROVIDER=r2

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_actual_account_id_here
R2_ACCESS_KEY_ID=your_actual_access_key_id_here
R2_SECRET_ACCESS_KEY=your_actual_secret_access_key_here
R2_BUCKET_NAME=tvet-connect-kenya-r2
R2_CUSTOM_DOMAIN=https://cdn.tvet-connect-kenya.com
```

## Step 5: Test Configuration
Run the test script to verify your configuration:

```bash
cd api-server
node test-r2-config.js
```

## Step 6: Configure CORS (Important!)
You need to configure CORS for your R2 bucket to allow browser uploads:

1. Go to your R2 bucket in the Cloudflare dashboard
2. Navigate to "Settings" > "CORS policy"
3. Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
      "https://your-production-domain.com"
    ],
    "AllowedMethods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

## Step 7: Update Client-Side Environment Variables
If you're using client-side uploads, add these to your client `.env`:

```bash
VITE_STORAGE_PROVIDER=r2
VITE_R2_ACCOUNT_ID=your_actual_account_id_here
VITE_R2_BUCKET_NAME=tvet-connect-kenya-r2
VITE_R2_CUSTOM_DOMAIN=https://cdn.tvet-connect-kenya.com
```

## Usage Examples

### Backend Upload (Recommended)
The backend API route `/api/upload/upload-course-material` is already configured for R2 uploads.

### Using the React Components
```jsx
import { R2FileUpload } from '@/components/ui/R2FileUpload';
import { R2FileManager } from '@/components/ui/R2FileManager';

function MyComponent() {
  return (
    <div>
      <R2FileUpload
        unitId="CS101"
        unitCode="Computer Science"
        category="material"
        onUploadComplete={(results) => {
          console.log('Files uploaded:', results);
        }}
      />
      
      <R2FileManager
        files={myFiles}
        allowDelete={true}
        showSearch={true}
      />
    </div>
  );
}
```

### Using the Hook
```jsx
import { useR2Storage } from '@/hooks/useR2Storage';

function MyUploadComponent() {
  const { uploadFile, isUploading, uploadProgress } = useR2Storage();

  const handleFileUpload = async (file) => {
    try {
      const result = await uploadFile({
        file,
        unitId: 'CS101',
        category: 'material'
      });
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {/* Your upload UI */}
    </div>
  );
}
```

## Security Best Practices

1. **Use Environment Variables**: Never commit actual credentials to git
2. **Restrict API Token Permissions**: Only grant necessary permissions
3. **Configure CORS Properly**: Only allow your domains
4. **Use Custom Domain**: For better security and branding
5. **Monitor Usage**: Keep track of storage usage and costs

## Troubleshooting

### Connection Issues
- Verify your Account ID is correct
- Check that API tokens have the right permissions
- Ensure your bucket name matches exactly

### Upload Failures
- Check CORS configuration
- Verify file size limits (default 50MB)
- Ensure supported file types

### Download Issues
- Check custom domain configuration
- Verify bucket public access settings

## File Organization
Files are organized in R2 with the following structure:
```
course-materials/
├── {unitId}/
│   ├── assignments/
│   ├── materials/
│   ├── submissions/
│   └── notes/
```

## Monitoring and Analytics
Use Cloudflare's analytics to monitor:
- Storage usage
- Request patterns
- Error rates
- Geographic distribution

## Cost Optimization
- Use lifecycle rules to delete old files
- Implement file compression where appropriate
- Monitor and optimize access patterns
