@echo off
echo Testing Student Registration and Login Workflow...
echo.

REM Generate a random password
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
set "password="
for /L %%i in (1,1,8) do call :char
goto :continue

:char
set /a rand=%random%%%62
call set "password=%%password%%%%chars:~%rand%,1%%"
goto :eof

:continue
echo Generated password: %password%
echo.

echo 1. Creating a test student via auth/register-student...
curl -X POST http://localhost:3001/api/auth/register-student ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Test\",\"lastName\":\"Student\",\"email\":\"teststudent2024@example.com\",\"admissionNumber\":\"TEST2024003\",\"department\":\"ICT\",\"course\":\"Certificate in Computer Studies\",\"password\":\"%password%\"}" ^
  -o student_create_response.json

echo.
echo 2. Student creation response:
type student_create_response.json
echo.

echo 3. Testing student login with the generated password...
curl -X POST http://localhost:3001/api/auth/student-login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teststudent2024@example.com\",\"password\":\"%password%\"}" ^
  -o login_response.json

echo.
echo 4. Login response:
type login_response.json

pause
