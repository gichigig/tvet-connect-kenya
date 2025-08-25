# Generate a random password
$chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
$password = -join ((1..8) | ForEach {$chars[(Get-Random -Maximum $chars.Length)]})

Write-Host "Generated password: $password"
Write-Host ""

Write-Host "1. Creating a test student via auth/register-student..."

$createBody = @{
    firstName = "Test"
    lastName = "Student"
    email = "teststudent2024@example.com"
    admissionNumber = "TEST2024003"
    department = "ICT"
    course = "Certificate in Computer Studies"
    password = $password
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register-student" -Method POST -ContentType "application/json" -Body $createBody
    Write-Host "✅ Student created successfully!"
    Write-Host "📊 Created student:" -ForegroundColor Green
    $createResponse | ConvertTo-Json -Depth 3 | Write-Host
    
    Write-Host ""
    Write-Host "2. Testing student login with the generated password..."
    
    $loginBody = @{
        email = "teststudent2024@example.com"
        password = $password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/student-login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "✅ Student login successful!"
    Write-Host "📊 Login response:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json -Depth 3 | Write-Host
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test completed. Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
