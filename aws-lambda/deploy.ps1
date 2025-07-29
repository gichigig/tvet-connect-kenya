# AWS Lambda Deployment Script for TVET Secure Upload (PowerShell)

Write-Host "🚀 Starting Lambda deployment process..." -ForegroundColor Green

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if we're in the lambda directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the aws-lambda directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Create deployment package
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "function.zip") {
    Remove-Item "function.zip"
}

# Use PowerShell Compress-Archive instead of zip
Compress-Archive -Path "index.js", "node_modules", "package.json" -DestinationPath "function.zip"

# Check if function exists
$FUNCTION_NAME = "tvet-secure-upload"
try {
    aws lambda get-function --function-name $FUNCTION_NAME 2>$null | Out-Null
    Write-Host "🔄 Updating existing function..." -ForegroundColor Yellow
    aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://function.zip
} catch {
    Write-Host "✨ Function doesn't exist. Creating new function..." -ForegroundColor Yellow
    Write-Host "⚠️  Please create the function manually first using the AWS Console" -ForegroundColor Red
    Write-Host "   Or update this script with your IAM role ARN" -ForegroundColor Red
    
    # Uncomment and modify this section if you have the IAM role ARN
    # aws lambda create-function `
    #     --function-name $FUNCTION_NAME `
    #     --runtime nodejs18.x `
    #     --role "arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role" `
    #     --handler index.handler `
    #     --zip-file fileb://function.zip `
    #     --timeout 30 `
    #     --memory-size 256
}

# Clean up
Remove-Item "function.zip"

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variables in AWS Lambda Console:"
Write-Host "   - AWS_REGION: eu-north-1"
Write-Host "   - S3_BUCKET_NAME: tvet-kenya-uploads-2024"
Write-Host "   - FIREBASE_PROJECT_ID: newy-35816"
Write-Host "   - FIREBASE_CLIENT_EMAIL: your-service-account@newy-35816.iam.gserviceaccount.com"
Write-Host "   - FIREBASE_PRIVATE_KEY: your-private-key"
Write-Host ""
Write-Host "2. Create API Gateway and get the endpoint URL"
Write-Host "3. Update VITE_LAMBDA_ENDPOINT in your .env file"
Write-Host "4. Test the integration!"
