@echo off
echo Killing any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Starting TVET Connect Kenya API Server on port 3000...
echo.
set PORT=3000
node server.js
pause
