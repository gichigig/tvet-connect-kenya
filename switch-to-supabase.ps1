# Switch to Supabase-Only System
Write-Host "🔄 Switching to Supabase-only system..." -ForegroundColor Green

# Step 1: Deploy Supabase schema and create sample users
Write-Host "📋 Step 1: Deploying Supabase schema..." -ForegroundColor Yellow
node deploy-supabase-schema.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Schema deployment failed. Please check your Supabase configuration." -ForegroundColor Red
    exit 1
}

# Step 2: Backup current main.tsx
Write-Host "💾 Step 2: Backing up current main.tsx..." -ForegroundColor Yellow
Copy-Item "src\main.tsx" "src\main.tsx.firebase.backup" -Force
Write-Host "✅ Backup created: src\main.tsx.firebase.backup" -ForegroundColor Green

# Step 3: Switch to Supabase main
Write-Host "🔄 Step 3: Switching to Supabase main..." -ForegroundColor Yellow
Copy-Item "src\supabase-main.tsx" "src\main.tsx" -Force
Write-Host "✅ Switched to Supabase-only system" -ForegroundColor Green

# Step 4: Start development server
Write-Host "🚀 Step 4: Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Migration complete! Your app now uses Supabase exclusively." -ForegroundColor Green
Write-Host ""
Write-Host "Test the new system:" -ForegroundColor Cyan
Write-Host "- Login: http://localhost:5173/supabase-login" -ForegroundColor Cyan
Write-Host "- Signup: http://localhost:5173/supabase-signup" -ForegroundColor Cyan
Write-Host "- Migration Test Suite: http://localhost:5173/migration-test-suite" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo accounts created:" -ForegroundColor Cyan
Write-Host "- Admin: admin@tvetkenya.com / admin123" -ForegroundColor Cyan
Write-Host "- Registrar: registrar@tvetkenya.com / registrar123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow

bun run dev
