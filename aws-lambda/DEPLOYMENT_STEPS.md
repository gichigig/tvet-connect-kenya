# 🚀 Quick AWS Lambda Deployment Guide

## ✅ Your deployment package is ready!

**File**: `tvet-lambda-function.zip` (18.4 MB)
**Location**: `C:\Users\billy\shiuy\tvet-connect-kenya\aws-lambda\`

## 📋 Step-by-Step Deployment

### Step 1: Create Lambda Function
1. **Go to AWS Console**: https://console.aws.amazon.com/lambda/
2. **Click "Create function"**
3. **Settings**:
   - ✅ Author from scratch
   - ✅ Function name: `tvet-secure-upload`
   - ✅ Runtime: `Node.js 18.x`
   - ✅ Architecture: `x86_64`
4. **Click "Create function"**

### Step 2: Upload Your Code
1. **In the function page**, find "Code source" section
2. **Click "Upload from"** → ".zip file"
3. **Select**: `tvet-lambda-function.zip`
4. **Click "Save"**

### Step 3: Set Environment Variables
**Go to Configuration → Environment variables → Edit**

Add these 5 variables:
```
AWS_REGION = eu-north-1
S3_BUCKET_NAME = tvet-kenya-uploads-2024
FIREBASE_PROJECT_ID = newy-35816
FIREBASE_CLIENT_EMAIL = [GET FROM FIREBASE - see below]
FIREBASE_PRIVATE_KEY = [GET FROM FIREBASE - see below]
```

#### 🔑 Getting Firebase Credentials:
1. **Firebase Console**: https://console.firebase.google.com/
2. **Select project**: `newy-35816`
3. **Project Settings** → "Service accounts"
4. **Click "Generate new private key"**
5. **Download JSON file**
6. **Copy values**:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

### Step 4: Create API Gateway
1. **API Gateway Console**: https://console.aws.amazon.com/apigateway/
2. **Create API** → "REST API" → "Build"
3. **Settings**:
   - ✅ API name: `tvet-secure-upload-api`
   - ✅ Endpoint Type: Regional

### Step 5: Create Resource & Method
1. **Actions** → "Create Resource"
   - ✅ Resource Name: `generate-signed-url`
   - ✅ Resource Path: `/generate-signed-url`
2. **Select resource** → Actions → "Create Method" → `POST`
3. **Integration settings**:
   - ✅ Integration type: Lambda Function
   - ✅ Lambda Function: `tvet-secure-upload`
   - ✅ Click "Save" → "OK"

### Step 6: Enable CORS
1. **Select `/generate-signed-url` resource**
2. **Actions** → "Enable CORS"
3. **Settings**:
   - ✅ Access-Control-Allow-Origin: `*`
   - ✅ Access-Control-Allow-Headers: `Content-Type,Authorization`
   - ✅ Access-Control-Allow-Methods: `POST,OPTIONS`
4. **Click "Enable CORS"**

### Step 7: Deploy API
1. **Actions** → "Deploy API"
2. **Settings**:
   - ✅ Deployment stage: `[New Stage]`
   - ✅ Stage name: `prod`
3. **Click "Deploy"**
4. **📋 COPY THE INVOKE URL** (looks like: `https://abc123.execute-api.eu-north-1.amazonaws.com/prod`)

### Step 8: Update Your .env File
**In your project root `.env` file**, update:
```
VITE_LAMBDA_ENDPOINT=https://YOUR-API-ID.execute-api.eu-north-1.amazonaws.com/prod/generate-signed-url
```

Replace `YOUR-API-ID` with the actual API ID from step 7.

## 🧪 Test Your Setup

1. **Start your React app**: `npm run dev`
2. **Go to lecturer dashboard**
3. **Try uploading a file** in Unit Detail Manager
4. **Check if file appears** in your S3 bucket

## 🛠️ Troubleshooting

### If upload fails:
1. **Check Lambda logs**: CloudWatch → Log groups → `/aws/lambda/tvet-secure-upload`
2. **Verify environment variables** are set correctly
3. **Check CORS configuration** in API Gateway

### Common issues:
- ❌ **CORS errors**: Make sure API Gateway CORS is enabled
- ❌ **401 Unauthorized**: Check Firebase credentials
- ❌ **S3 errors**: Verify bucket name and permissions

## 🎉 Success!

Once deployed, your secure upload system will:
- ✅ Work with Firebase Spark plan (no upgrade needed)
- ✅ Use Firebase Auth for security
- ✅ Generate S3 signed URLs via Lambda
- ✅ Upload files directly to S3
- ✅ Cost ~$0.10/month instead of $25+/month

Your deployment package is ready to upload! 🚀
