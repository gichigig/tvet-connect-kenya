@echo off
echo Checking system performance for VS Code...
echo.

echo === Memory Usage ===
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value
echo.

echo === CPU Usage ===
wmic cpu get loadpercentage /value
echo.

echo === VS Code Processes ===
tasklist /fi "imagename eq Code.exe" /fo table
echo.

echo === Node.js Processes ===
tasklist /fi "imagename eq node.exe" /fo table
echo.

echo === Disk Space ===
wmic logicaldisk get size,freespace,caption /value
echo.

pause
