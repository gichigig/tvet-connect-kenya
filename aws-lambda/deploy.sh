#!/bin/bash

# AWS Lambda Deployment Script for TVET Secure Upload

set -e

echo "🚀 Starting Lambda deployment process..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if we're in the lambda directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Please run this script from the aws-lambda directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create deployment package
echo "📁 Creating deployment package..."
zip -r function.zip index.js node_modules/ package.json

# Check if function exists
FUNCTION_NAME="tvet-secure-upload"
if aws lambda get-function --function-name $FUNCTION_NAME &>/dev/null; then
    echo "🔄 Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip
else
    echo "✨ Creating new function..."
    echo "⚠️  Please create the function manually first using the AWS Console"
    echo "   Or update this script with your IAM role ARN"
    
    # Uncomment and modify this section if you have the IAM role ARN
    # aws lambda create-function \
    #     --function-name $FUNCTION_NAME \
    #     --runtime nodejs18.x \
    #     --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
    #     --handler index.handler \
    #     --zip-file fileb://function.zip \
    #     --timeout 30 \
    #     --memory-size 256
fi

# Clean up
rm function.zip

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables in AWS Lambda Console:"
echo "   - AWS_REGION: eu-north-1"
echo "   - S3_BUCKET_NAME: tvet-kenya-uploads-2024"
echo "   - FIREBASE_PROJECT_ID: newy-35816"
echo "   - FIREBASE_CLIENT_EMAIL: your-service-account@newy-35816.iam.gserviceaccount.com"
echo "   - FIREBASE_PRIVATE_KEY: your-private-key"
echo ""
echo "2. Create API Gateway and get the endpoint URL"
echo "3. Update VITE_LAMBDA_ENDPOINT in your .env file"
echo "4. Test the integration!"
