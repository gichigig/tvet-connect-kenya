# TVET Connect Kenya - Build & Run Fix Script (PowerShell)

Write-Host "🔧 TVET Connect Kenya - Build Fix" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean everything
Write-Host "🧹 Step 1: Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".vite") { Remove-Item -Recurse -Force ".vite" }
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
Write-Host "✅ Clean complete" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host ""
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Check TypeScript
Write-Host ""
Write-Host "🔍 Step 3: Checking TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript errors found" -ForegroundColor Red
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

# Step 4: Try build
Write-Host ""
Write-Host "🏗️ Step 4: Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Trying alternative build method..." -ForegroundColor Yellow
    npx vite build --mode development
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Development build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ All build methods failed" -ForegroundColor Red
        Write-Host "Continuing to dev server anyway..." -ForegroundColor Yellow
    }
}

# Step 5: Start dev server
Write-Host ""
Write-Host "🚀 Step 5: Starting development server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""
npm run dev
