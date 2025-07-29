# AWS Lambda Deployment Guide

## Prerequisites

1. **AWS CLI** installed and configured
2. **AWS Account** with appropriate permissions
3. **Firebase Service Account Key**

## Step 1: Install Dependencies

```bash
cd aws-lambda
npm install
```

## Step 2: Create Lambda Function

### Via AWS CLI:
```bash
# Create the function
aws lambda create-function \
  --function-name tvet-secure-upload \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256

# Set environment variables
aws lambda update-function-configuration \
  --function-name tvet-secure-upload \
  --environment Variables='{
    "AWS_REGION":"eu-north-1",
    "S3_BUCKET_NAME":"tvet-kenya-uploads-2024",
    "FIREBASE_PROJECT_ID":"newy-35816",
    "FIREBASE_CLIENT_EMAIL":"your-service-account@newy-35816.iam.gserviceaccount.com",
    "FIREBASE_PRIVATE_KEY":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
  }'
```

### Via AWS Console:
1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `tvet-secure-upload`
5. Runtime: Node.js 18.x
6. Upload the zip file
7. Set environment variables in Configuration → Environment variables

## Step 3: Create API Gateway

1. Go to API Gateway Console
2. Create new REST API
3. Create resource `/generate-signed-url`
4. Create POST method
5. Integration type: Lambda Function
6. Select your function: `tvet-secure-upload`
7. Enable CORS
8. Deploy API

## Step 4: Get API Endpoint

After deployment, you'll get an endpoint like:
```
https://your-api-id.execute-api.region.amazonaws.com/stage/generate-signed-url
```

## Step 5: Update Frontend

Update the `secureUpload.ts` file to use your Lambda endpoint instead of Firebase Functions.

## Environment Variables Required

- `AWS_REGION`: eu-north-1
- `S3_BUCKET_NAME`: tvet-kenya-uploads-2024  
- `FIREBASE_PROJECT_ID`: newy-35816
- `FIREBASE_CLIENT_EMAIL`: From Firebase service account
- `FIREBASE_PRIVATE_KEY`: From Firebase service account

## IAM Role Permissions

Your Lambda execution role needs:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::tvet-kenya-uploads-2024/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

## Testing

Test the endpoint:
```bash
curl -X POST https://your-endpoint/generate-signed-url \
  -H "Content-Type: application/json" \
  -d '{
    "token": "firebase-id-token",
    "fileName": "test.pdf",
    "fileSize": 1024,
    "fileType": "application/pdf",
    "folder": "course-materials"
  }'
```

## Deployment Script

```bash
# Package and deploy
npm run package
aws lambda update-function-code \
  --function-name tvet-secure-upload \
  --zip-file fileb://function.zip
```
