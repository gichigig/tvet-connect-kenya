@echo off
echo VS Code Performance Cleanup Script
echo ===================================
echo.

echo 1. Cleaning VS Code cache...
if exist "%APPDATA%\Code\CachedExtensions" (
    rmdir /s /q "%APPDATA%\Code\CachedExtensions"
    echo - Cleared cached extensions
)

if exist "%APPDATA%\Code\logs" (
    rmdir /s /q "%APPDATA%\Code\logs"
    echo - Cleared logs
)

echo.
echo 2. Cleaning temporary files...
del /q /f "%TEMP%\*.*" 2>nul
echo - Cleared temp files

echo.
echo 3. Freeing up memory...
echo off | clip
echo - Cleared clipboard

echo.
echo 4. Suggested next steps:
echo    - Restart VS Code
echo    - Disable heavy extensions temporarily
echo    - Keep only 2-3 files open
echo    - Run TypeScript: Restart TS Server command
echo.

pause
