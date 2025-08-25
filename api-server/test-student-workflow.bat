@echo off
echo Testing Student Creation and Login Workflow...
echo.

echo 1. Creating a test student...
curl -X POST http://localhost:3001/api/students ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: tvet_1fd0f562039f427aac9bf7bdf515b804" ^
  -d "{\"admissionNumber\":\"TEST2024002\",\"email\":\"teststudent2024@example.com\",\"firstName\":\"Test\",\"lastName\":\"Student\",\"phoneNumber\":\"+254700000002\",\"courseId\":\"CERT001\",\"nationalId\":\"12345679\",\"cohort\":\"2024\",\"levelOfStudy\":\"Certificate\"}" ^
  -o student_response.json

echo.
echo 2. Created student response:
type student_response.json
echo.

echo 3. Testing student login with generated password...
echo Please check the student_response.json file for the generated password,
echo then run this command manually:
echo curl -X POST http://localhost:3001/api/auth/student-login -H "Content-Type: application/json" -d "{\"email\":\"teststudent2024@example.com\",\"password\":\"GENERATED_PASSWORD_HERE\"}"

pause
