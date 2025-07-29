# Manual AWS Lambda Deployment Guide

Since AWS CLI needs to be configured, here's a step-by-step manual deployment process:

## Step 1: Create the Deployment Package

1. **Open PowerShell** in the `aws-lambda` directory
2. **Create a ZIP file** with all the necessary files:

```powershell
# Make sure you're in the aws-lambda directory
cd C:\Users\billy\shiuy\tvet-connect-kenya\aws-lambda

# Create deployment package
Compress-Archive -Path "index.js", "package.json", "node_modules" -DestinationPath "tvet-lambda-function.zip" -Force
```

## Step 2: Create Lambda Function via AWS Console

1. **Go to AWS Console**: https://console.aws.amazon.com/lambda/
2. **Click "Create function"**
3. **Choose "Author from scratch"**
4. **Configuration**:
   - Function name: `tvet-secure-upload`
   - Runtime: `Node.js 18.x`
   - Architecture: `x86_64`
   - Click "Create function"

## Step 3: Upload Your Code

1. **In the Lambda function page**, scroll to "Code source"
2. **Click "Upload from"** → ".zip file"
3. **Upload the `tvet-lambda-function.zip`** file you created
4. **Click "Save"**

## Step 4: Configure Environment Variables

1. **Go to "Configuration" tab** → "Environment variables"
2. **Click "Edit"** and add these variables:

```
AWS_REGION = eu-north-1
S3_BUCKET_NAME = tvet-kenya-uploads-2024
FIREBASE_PROJECT_ID = newy-35816
FIREBASE_CLIENT_EMAIL = [GET FROM FIREBASE CONSOLE]
FIREBASE_PRIVATE_KEY = [GET FROM FIREBASE CONSOLE]
```

### Getting Firebase Service Account Credentials:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `newy-35816`
3. **Go to Project Settings** → "Service accounts"
4. **Click "Generate new private key"**
5. **Download the JSON file**
6. **Copy the values**:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (include the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

## Step 5: Create API Gateway

1. **Go to API Gateway Console**: https://console.aws.amazon.com/apigateway/
2. **Create API** → "REST API" → "Build"
3. **API name**: `tvet-secure-upload-api`
4. **Create Resource**:
   - Resource Name: `generate-signed-url`
   - Resource Path: `/generate-signed-url`
5. **Create Method**:
   - Select the resource
   - Actions → Create Method → `POST`
   - Integration type: `Lambda Function`
   - Lambda Function: `tvet-secure-upload`
   - Click "Save" and "OK"

## Step 6: Enable CORS

1. **Select your resource** `/generate-signed-url`
2. **Actions** → "Enable CORS"
3. **Configuration**:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: `POST,OPTIONS`
4. **Click "Enable CORS and replace existing CORS headers"**

## Step 7: Deploy API

1. **Actions** → "Deploy API"
2. **Deployment stage**: `[New Stage]`
3. **Stage name**: `prod`
4. **Click "Deploy"**
5. **Copy the Invoke URL** (it will look like: `https://your-api-id.execute-api.eu-north-1.amazonaws.com/prod`)

## Step 8: Update Your .env File

Update your `.env` file with the API Gateway endpoint:

```
VITE_LAMBDA_ENDPOINT=https://your-api-id.execute-api.eu-north-1.amazonaws.com/prod/generate-signed-url
```

## Step 9: Test the Integration

1. **Open your React app**
2. **Try uploading a file** in the lecturer dashboard
3. **Check AWS CloudWatch logs** if there are any issues

## Troubleshooting

### If uploads fail:
1. **Check Lambda logs** in CloudWatch
2. **Verify environment variables** are set correctly
3. **Check S3 bucket permissions**
4. **Verify CORS configuration**

### Common Issues:
- **Firebase credentials**: Make sure the private key includes `\n` newlines
- **S3 permissions**: Lambda needs S3 PutObject permissions
- **CORS**: API Gateway must have CORS enabled

That's it! Your secure upload system will now work with AWS Lambda instead of Firebase Functions.
