Write-Host "WARNING: This will delete all node_modules and build folders!" -ForegroundColor Red
Write-Host "Make sure your work is saved!" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Type YES to continue cleanup"

if ($confirmation -eq "YES") {
    Write-Host "Starting cleanup..." -ForegroundColor Green
    
    $folders = Get-ChildItem -Path "." -Recurse -Directory | Where-Object { 
        $_.Name -eq "node_modules" -or 
        $_.Name -eq ".next" -or 
        $_.Name -eq "dist" -or 
        $_.Name -eq "build" -or 
        $_.Name -eq "coverage" -or 
        $_.Name -eq ".cache"
    }
    
    $count = ($folders | Measure-Object).Count
    Write-Host "Found $count unnecessary folders"
    
    foreach ($folder in $folders) {
        Write-Host "Deleting: $($folder.FullName)" -ForegroundColor Red
        Remove-Item $folder.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host ""
    Write-Host "Cleanup Complete!" -ForegroundColor Green
    Write-Host "Windows should be much faster now!" -ForegroundColor Green
    
} else {
    Write-Host "Cleanup cancelled" -ForegroundColor Red
}
