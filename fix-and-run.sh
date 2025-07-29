#!/bin/bash
# TVET Connect Kenya - Build & Run Fix Script

echo "🔧 TVET Connect Kenya - Build Fix"
echo "================================="
echo ""

# Step 1: Clean everything
echo "🧹 Step 1: Cleaning build artifacts..."
rm -rf node_modules
rm -rf dist
rm -rf .vite
rm -f package-lock.json
echo "✅ Clean complete"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Step 3: Check TypeScript
echo ""
echo "🔍 Step 3: Checking TypeScript..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript errors found"
    exit 1
fi

# Step 4: Try build
echo ""
echo "🏗️ Step 4: Building application..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    echo ""
    echo "🔧 Trying alternative build method..."
    npx vite build --mode development
    if [ $? -eq 0 ]; then
        echo "✅ Development build successful"
    else
        echo "❌ All build methods failed"
        exit 1
    fi
fi

# Step 5: Start dev server
echo ""
echo "🚀 Step 5: Starting development server..."
echo "Server will be available at: http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""
npm run dev
