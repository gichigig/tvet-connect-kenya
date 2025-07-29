# AWS Setup Guide for S3 Secure Uploads

## Step 1: Create AWS Account
If you don't have an AWS account, sign up at https://aws.amazon.com/

## Step 2: Create S3 Bucket
1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., "tvet-kenya-uploads-2024")
4. Select a region close to your users (e.g., eu-west-1 for Europe, us-east-1 for US East)
5. Keep default settings for now
6. Click "Create bucket"

## Step 3: Configure CORS for your S3 Bucket
1. Go to your bucket in S3 Console
2. Click on "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT"],
    "AllowedOrigins": [
      "https://your-domain.com",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 4: Create IAM User for Programmatic Access
1. Go to AWS IAM Console
2. Click "Users" → "Create user"
3. Enter username (e.g., "tvet-upload-service")
4. Select "Programmatic access" 
5. Click "Next: Permissions"

## Step 5: Create IAM Policy
1. Click "Attach policies directly"
2. Click "Create policy"
3. Choose "JSON" tab and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

4. Replace "YOUR_BUCKET_NAME" with your actual bucket name
5. Click "Next: Tags" → "Next: Review"
6. Name the policy (e.g., "TVET-S3-Upload-Policy")
7. Click "Create policy"

## Step 6: Attach Policy to User
1. Go back to user creation
2. Search for your newly created policy
3. Select it and click "Next: Tags" → "Next: Review"
4. Click "Create user"

## Step 7: Save Credentials
⚠️ **IMPORTANT**: Save these credentials immediately - you won't see them again!
- Access Key ID: ***REMOVED***...
- Secret Access Key: (long string)

## Step 8: Configure Firebase Functions
Use the commands from aws-config-commands.txt with your actual values.

## Step 9: Test the Setup
After configuration, test with a small file upload to ensure everything works.

## Security Best Practices
- Never commit AWS credentials to version control
- Use least privilege principle (only necessary permissions)
- Regularly rotate access keys
- Monitor AWS CloudTrail for unusual activity
- Set up S3 bucket notifications for monitoring uploads
