// Use built-in fetch (Node 18+) or require https
async function testStudentWorkflow() {
  console.log('🔍 Testing Complete Student Creation and Login Workflow...\n');

  const testStudent = {
    admissionNumber: 'TEST2024001',
    email: 'teststudent2024@example.com',
    firstName: 'Test',
    lastName: 'Student',
    phoneNumber: '+254700000001',
    courseId: 'CERT001',
    nationalId: '12345678',
    cohort: '2024',
    levelOfStudy: 'Certificate'
  };

  try {
    // Step 1: Create a student via the API (simulating registrar action)
    console.log('1. Creating student via registrar workflow...');
    console.log('📧 Student email:', testStudent.email);
    
    const createResponse = await fetch('http://localhost:3001/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'tvet_1fd0f562039f427aac9bf7bdf515b804'
      },
      body: JSON.stringify(testStudent)
    });
    
    if (createResponse.ok) {
      const createdStudent = await createResponse.json();
      console.log('✅ Student created successfully!');
      console.log('📊 Created student:', createdStudent);
      
      // Extract the generated password from the response
      const generatedPassword = createdStudent.tempPassword || createdStudent.password;
      console.log('🔑 Generated password:', generatedPassword);
      
      // Step 2: Try to login with the created student
      console.log('\n2. Testing student login...');
      
      const loginResponse = await fetch('http://localhost:3001/api/auth/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testStudent.email,
          password: generatedPassword
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Student login successful!');
        console.log('📊 Login response:', loginData);
      } else {
        const errorData = await loginResponse.json();
        console.log('❌ Student login failed');
        console.log('📊 Error details:', errorData);
        console.log('🔍 Status:', loginResponse.status);
      }
      
    } else {
      const errorData = await createResponse.json();
      console.log('❌ Student creation failed');
      console.log('📊 Error details:', errorData);
      console.log('🔍 Status:', createResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testStudentWorkflow();
