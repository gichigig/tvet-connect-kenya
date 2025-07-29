# AWS Lambda Solution for Secure File Uploads

## 🎯 Problem Solved

✅ **Firebase Spark Plan Compatible**: No need to upgrade to Blaze plan
✅ **Secure Upload Pattern**: Firebase Auth → AWS Lambda → S3 Signed URLs
✅ **Cost Effective**: Only pay for Lambda usage (very minimal)
✅ **Scalable**: AWS Lambda auto-scales

## 📁 Files Created

### 1. Lambda Function (`aws-lambda/`)
- **`index.js`**: Main Lambda function with Firebase Auth verification
- **`package.json`**: Dependencies for AWS SDK and Firebase Admin
- **`deploy.ps1`**: PowerShell deployment script for Windows
- **`deploy.sh`**: Bash deployment script for Linux/Mac
- **`README.md`**: Complete deployment guide

### 2. Frontend Integration
- **`secureUploadLambda.ts`**: New upload utility using Lambda endpoint
- **Updated `.env`**: Added `VITE_LAMBDA_ENDPOINT` configuration
- **Updated `UnitDetailManager.tsx`**: Now imports from new Lambda version

## 🚀 Deployment Steps

### Step 1: Deploy Lambda Function

```powershell
# Windows (PowerShell)
cd aws-lambda
.\deploy.ps1
```

```bash
# Linux/Mac
cd aws-lambda
chmod +x deploy.sh
./deploy.sh
```

### Step 2: Create API Gateway

1. **AWS Console** → **API Gateway**
2. **Create REST API**
3. **Create Resource**: `/generate-signed-url`
4. **Create Method**: `POST`
5. **Integration**: Lambda Function → `tvet-secure-upload`
6. **Enable CORS**
7. **Deploy API** → Get endpoint URL

### Step 3: Configure Environment Variables

**In AWS Lambda Console:**
```
AWS_REGION = eu-north-1
S3_BUCKET_NAME = tvet-kenya-uploads-2024
FIREBASE_PROJECT_ID = newy-35816
FIREBASE_CLIENT_EMAIL = your-service-account@newy-35816.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----
```

**In your `.env` file:**
```
VITE_LAMBDA_ENDPOINT = https://your-api-id.execute-api.eu-north-1.amazonaws.com/prod/generate-signed-url
```

## 🔒 Security Features

### Authentication Flow
```
[Student/Lecturer] → [Firebase Auth Login] → [Get ID Token]
                                                    ↓
[Upload File] → [Send Token + File Info] → [AWS Lambda]
                                                    ↓
[Verify Token] → [Generate S3 Signed URL] → [Return to Client]
                                                    ↓
[Client] → [Upload Directly to S3] → [File Stored Securely]
```

### Validation & Security
- ✅ **Firebase Auth Token Verification**
- ✅ **File Type Validation** (PDF, Word, PowerPoint, Images)
- ✅ **File Size Limits** (5MB profiles, 10MB documents, 50MB materials)
- ✅ **Temporary URLs** (10-minute expiry)
- ✅ **User-specific Folders** (organized by user ID and content type)

## 💰 Cost Comparison

| Solution | Cost | Limitations |
|----------|------|-------------|
| **Firebase Blaze** | $25/month minimum + usage | Requires paid plan |
| **AWS Lambda** | ~$0.10/month for 1000 uploads | Pay per use only |

**AWS Lambda Pricing:**
- First 1M requests/month: FREE
- $0.20 per 1M requests after that
- $0.0000166667 per GB-second of compute

For typical usage: **~$1-5/month vs $25+/month**

## 🎨 UI Improvements Made

### Scrollable Upload Forms
- **Fixed Height**: Dialogs now have `max-h-[90vh]`
- **Scrollable Content**: Content area scrolls when needed
- **Fixed Header/Footer**: Navigation always visible

### Enhanced File Upload
- **Drag & Drop Interface**: Beautiful upload area
- **File Validation**: Real-time size and type checking
- **Visual Feedback**: Progress and status indicators
- **Professional Design**: Modern UI components

## 🧪 Testing Checklist

### Frontend Testing
- [ ] Dialog scrolls properly on small screens
- [ ] File drag-and-drop works
- [ ] File validation shows errors correctly
- [ ] Upload progress is displayed

### Backend Testing
- [ ] Lambda function responds to API calls
- [ ] Firebase token verification works
- [ ] S3 signed URLs are generated
- [ ] Files upload successfully to S3

### Integration Testing
- [ ] End-to-end upload flow works
- [ ] Error handling works properly
- [ ] Files are organized correctly in S3
- [ ] User permissions are enforced

## 📋 Next Actions Required

1. **Deploy Lambda Function**
   ```powershell
   cd aws-lambda
   npm install
   .\deploy.ps1
   ```

2. **Create API Gateway** (see Step 2 above)

3. **Get Firebase Service Account Key**
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Add to Lambda environment variables

4. **Update Environment Variables** in AWS Lambda Console

5. **Test Integration** with a small file upload

6. **Update Frontend** with your actual API Gateway endpoint

## 🎉 Benefits Achieved

✅ **Works with Firebase Spark Plan**: No upgrade required
✅ **Secure Architecture**: Industry-standard security pattern
✅ **Cost Effective**: Pay only for actual usage
✅ **Scalable**: Handles any number of uploads
✅ **User-Friendly**: Modern, responsive UI
✅ **Maintainable**: Clean, well-documented code

Your secure file upload system is now ready for deployment with AWS Lambda instead of Firebase Functions!
