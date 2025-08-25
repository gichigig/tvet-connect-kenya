@echo off
echo Starting TVET Connect Kenya API Server...
echo.
cd /d "C:\Users\billy\shiuy\tvet-connect-kenya\api-server"
set NODE_ENV=development
node server.js
pause
