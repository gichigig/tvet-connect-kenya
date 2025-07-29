@echo off
echo Fixing Vite development server issues...
echo.

REM Navigate to project directory
cd /d "C:\Users\billy\shiuy\tvet-connect-kenya"

REM Stop any running dev servers
echo Stopping any running processes...
taskkill /f /im node.exe 2>nul

REM Clear Vite cache
echo Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

REM Clear npm cache
echo Clearing npm cache...
npm cache clean --force

REM Reinstall dependencies
echo Reinstalling dependencies...
npm install

REM Clear browser cache recommendation
echo.
echo ========================================
echo BROWSER CACHE CLEARING INSTRUCTIONS:
echo ========================================
echo 1. Open your browser (Chrome/Edge)
echo 2. Press Ctrl+Shift+Delete
echo 3. Select "All time" for time range
echo 4. Check "Cached images and files"
echo 5. Click "Clear data"
echo.

REM Start development server
echo Starting development server...
npm run dev

pause
