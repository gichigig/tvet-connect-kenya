# 🧹 Clean Up Unnecessary Files - Fixes Windows Performance Issues
# This script removes all the folders that are causing Windows to become unresponsive

Write-Host "🚨 WARNING: This will delete all node_modules and build folders!" -ForegroundColor Red
Write-Host "💾 Make sure your work is saved!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Found 94+ unnecessary folders that are slowing down Windows..." -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Type 'YES' to continue with cleanup (or anything else to cancel)"

if ($confirmation -eq "YES") {
    Write-Host "🧹 Starting cleanup..." -ForegroundColor Green
    
    # Count files before cleanup
    $beforeCount = (Get-ChildItem -Path "C:\Users\billy\shiuy\tvet-connect-kenya" -Recurse -Directory | Where-Object { $_.Name -match "node_modules|\.next|dist|build|coverage|\.cache|\.turbo|\.parcel-cache|\.nuxt|\.output" } | Measure-Object).Count
    Write-Host "📊 Found $beforeCount unnecessary folders" -ForegroundColor Cyan
    
    # Remove all unnecessary folders
    Get-ChildItem -Path "C:\Users\billy\shiuy\tvet-connect-kenya" -Recurse -Directory | Where-Object { 
        $_.Name -match "node_modules|\.next|dist|build|coverage|\.cache|\.turbo|\.parcel-cache|\.nuxt|\.output" 
    } | ForEach-Object {
        Write-Host "🗑️  Deleting: $($_.Name)" -ForegroundColor Red
        Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Count after cleanup
    $afterCount = (Get-ChildItem -Path "C:\Users\billy\shiuy\tvet-connect-kenya" -Recurse -Directory | Where-Object { $_.Name -match "node_modules|\.next|dist|build|coverage|\.cache|\.turbo|\.parcel-cache|\.nuxt|\.output" } | Measure-Object).Count
    
    Write-Host ""
    Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
    Write-Host "📊 Removed $($beforeCount - $afterCount) unnecessary folders" -ForegroundColor Cyan
    Write-Host "💾 Freed up several GB of disk space" -ForegroundColor Green
    Write-Host "⚡ Windows should be much more responsive now!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 To restore dependencies when needed, run:" -ForegroundColor Yellow
    Write-Host "   npm install" -ForegroundColor White
    
} else {
    Write-Host "❌ Cleanup cancelled" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
Read-Host "Press Enter to continue"
