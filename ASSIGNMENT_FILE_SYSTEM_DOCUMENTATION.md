# Assignment File Upload & Download System Implementation

## Overview

This implementation enables lecturers to upload assignment files directly to AWS S3 when creating assignments, and allows students to download these files from their semester plan view.

## System Architecture

```
Lecturer Creates Assignment → Upload Files to S3 → Store in Semester Plan → Student Views & Downloads
```

### Components Modified

1. **AssignmentForm.tsx** - Enhanced lecturer assignment creation
2. **StudentSemesterPlanView.tsx** - Enhanced student download functionality
3. **FileStorageService.ts** - S3 upload integration
4. **FallbackUploadService.ts** - Fallback storage for reliability

## Implementation Details

### 1. Lecturer File Upload (AssignmentForm.tsx)

**Enhanced Features:**
- Direct S3 upload during assignment creation
- Multiple file support
- Upload progress indication
- Fallback storage for infrastructure issues
- Error handling with user feedback

**Key Changes:**
```typescript
// Upload files to S3 during assignment creation
const uploadedDocuments = [];
if (formData.attachments && formData.attachments.length > 0) {
  for (const file of formData.attachments) {
    const uploadedDoc = await fileStorageService.uploadDocument(file, {
      title: `${formData.title} - ${file.name}`,
      category: 'assignment',
      entityId: assignmentId,
      entityType: 'semester-plan-assignment'
    });
    uploadedDocuments.push({
      id: uploadedDoc.id,
      name: uploadedDoc.fileName,
      url: uploadedDoc.downloadUrl,
      size: uploadedDoc.fileSize,
      type: uploadedDoc.fileType,
      uploadedAt: uploadedDoc.uploadedAt
    });
  }
}
```

**UI Improvements:**
- Loading spinner during upload
- Disabled form during upload process
- Success/error toast notifications
- Upload progress feedback

### 2. Student Download Functionality (StudentSemesterPlanView.tsx)

**Enhanced Features:**
- Dual property support (`url` and `fileUrl`)
- Better file information display
- Enhanced error handling
- Toast notifications for download status

**Key Changes:**
```typescript
// Enhanced download handler
onClick={async () => {
  const downloadUrl = doc.url || doc.fileUrl;
  const fileName = doc.name || doc.fileName;
  
  if (downloadUrl) {
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Downloading ${fileName}...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download ${fileName}.`,
        variant: "destructive",
      });
    }
  }
}}
```

**UI Enhancements:**
- File size and upload date display
- Better visual hierarchy
- Consistent download button styling
- Error state handling

### 3. Data Structure

**Assignment Document Structure:**
```typescript
interface AssignmentDocument {
  id: string;           // Unique document ID
  name: string;         // File name
  url: string;          // S3 download URL
  size: number;         // File size in bytes
  type: string;         // MIME type
  uploadedAt: Date;     // Upload timestamp
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'document';
  assignDate: Date;
  dueDate: Date;
  maxMarks: number;
  instructions: string;
  isUploaded: boolean;   // True if has uploaded files
  requiresAICheck: boolean;
  documents: AssignmentDocument[];  // S3 uploaded files
}
```

## Usage Flow

### For Lecturers

1. **Create Assignment**
   - Fill in assignment details
   - Select files to upload
   - Click "Create Assignment"

2. **File Upload Process**
   - Files automatically uploaded to S3
   - Upload progress shown to user
   - Assignment created with file references
   - Success confirmation displayed

3. **Error Handling**
   - If S3 fails → Fallback to localStorage
   - Network issues → Retry mechanism
   - User gets clear error messages

### For Students

1. **View Semester Plan**
   - Navigate to enrolled unit
   - View weekly assignments
   - See assignment documents listed

2. **Download Files**
   - Click "Download" button
   - File opens in new tab or downloads
   - Download confirmation shown
   - Error feedback if download fails

## File Storage Details

### S3 Storage Structure
```
tvet-kenya-uploads-2024/
├── documents/
│   ├── assignment/
│   │   ├── semester-plan-assignment/
│   │   │   ├── {assignmentId}/
│   │   │   │   ├── file1.pdf
│   │   │   │   └── file2.docx
```

### Fallback Storage
- **Location:** Browser localStorage
- **Format:** Base64 encoded files
- **Limits:** 5MB per file, 50MB total
- **Purpose:** Maintain functionality during outages

## Security Considerations

1. **Access Control**
   - S3 bucket policies restrict access
   - Presigned URLs for secure downloads
   - CORS configuration for browser access

2. **File Validation**
   - File type restrictions
   - Size limits enforced
   - Malware scanning (recommended)

3. **Data Privacy**
   - Encrypted S3 storage
   - Secure transmission (HTTPS)
   - User authentication required

## Performance Optimizations

1. **Upload Performance**
   - Direct S3 upload (no server proxy)
   - Chunked uploads for large files
   - Parallel processing for multiple files

2. **Download Performance**
   - CDN distribution via S3
   - Presigned URLs reduce server load
   - Efficient caching headers

3. **Fallback Performance**
   - localStorage for immediate access
   - Minimal UI blocking
   - Progressive enhancement

## Error Handling

### Upload Errors
- **AWS Access Denied** → Fallback storage + user notification
- **Network Issues** → Retry mechanism + progress indication
- **File Too Large** → Clear size limit message
- **Quota Exceeded** → Fallback storage + admin notification

### Download Errors
- **Broken Links** → Error toast + fallback options
- **Network Issues** → Retry button + offline indicator
- **File Not Found** → Clear error message + support contact

## Testing

### Test Scenarios
1. **Normal Upload/Download Flow**
2. **S3 Service Interruption**
3. **Large File Handling**
4. **Multiple File Upload**
5. **Concurrent User Actions**

### Test Commands
```javascript
// Browser console testing
window.testAssignmentSystem()

// Specific tests
testLecturerFileUpload()
testStudentDownload()
testFallbackSystem()
```

## Monitoring & Analytics

### Key Metrics
- Upload success rate
- Download completion rate
- Fallback usage frequency
- Average file sizes
- Error rates by type

### Logging Points
- File upload initiation
- Upload completion/failure
- Download requests
- Fallback activations
- Error occurrences

## Future Enhancements

1. **Automatic Sync**
   - Upload fallback files when S3 recovers
   - Background sync monitoring

2. **Advanced Features**
   - File versioning
   - Collaborative editing
   - Preview functionality
   - Bulk operations

3. **Admin Tools**
   - Storage usage dashboard
   - File management interface
   - System health monitoring

## Deployment Checklist

- [ ] S3 bucket configured with proper permissions
- [ ] Lambda endpoint tested and accessible
- [ ] CORS policies updated
- [ ] Environment variables set
- [ ] Fallback storage limits configured
- [ ] Error monitoring enabled
- [ ] User documentation updated

## Support & Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check AWS credentials
   - Verify S3 bucket permissions
   - Confirm CORS settings

2. **Download Fails**
   - Check S3 URL accessibility
   - Verify presigned URL expiration
   - Test fallback mechanisms

3. **Performance Issues**
   - Monitor S3 transfer speeds
   - Check network connectivity
   - Review file sizes

### Contact Information
- **Technical Support:** [support@tvet-kenya.edu]
- **AWS Issues:** [aws-admin@tvet-kenya.edu]
- **User Training:** [training@tvet-kenya.edu]

---

*This system provides a robust, scalable solution for assignment file management with built-in resilience and excellent user experience.*
