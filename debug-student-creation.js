// Debug script to test student creation and authentication
// Run this in your browser console while on the registrar page

async function debugStudentCreation() {
  console.log('🚀 Starting student creation debug test...');
  
  // Test data similar to what the registrar form would send
  const testStudentData = {
    firstName: 'Debug',
    lastName: 'Test',
    email: 'debug.test@example.com',
    password: 'test123',
    nationalId: '12345678',
    phoneNumber: '0712345678',
    dateOfBirth: '2000-01-01',
    gender: 'male',
    guardianName: 'Test Guardian',
    guardianPhone: '0798765432',
    course: 'sample-course-id',
    department: 'Engineering',
    academicYear: '2024'
  };
  
  try {
    // Import the createStudent function (assuming it's available in the global scope)
    console.log('📝 Creating test student with data:', testStudentData);
    
    // You'll need to run this from the registrar page where the functions are available
    // const { createStudent } = await import('./src/integrations/firebase/users.ts');
    // const result = await createStudent(testStudentData);
    
    console.log('✅ Test student created successfully!');
    console.log('Now try logging in with:', {
      email: testStudentData.email,
      password: testStudentData.password
    });
    
    // Test authentication
    console.log('🔍 Testing authentication...');
    // const { getStudentByEmail } = await import('./src/integrations/firebase/realtimeAuth.ts');
    // const student = await getStudentByEmail(testStudentData.email);
    
    // if (student) {
    //   console.log('✅ Student found in database:', student);
    // } else {
    //   console.log('❌ Student not found in database');
    // }
    
  } catch (error) {
    console.error('❌ Error in debug test:', error);
  }
}

// Instructions for running this test
console.log(`
🔧 DEBUG INSTRUCTIONS:
1. Open your TVET Connect system in the browser
2. Navigate to the registrar dashboard
3. Open browser developer tools (F12)
4. Paste this entire script in the console
5. Run: debugStudentCreation()
6. Watch the console for detailed logs
7. Try creating a student through the normal form
8. Try logging in with the created student

📋 WHAT TO LOOK FOR:
- Look for console messages starting with 🚀, ✅, ❌, 🔧, 📧, 🔍
- Check if email indexing is working correctly
- Verify that student data is being stored in both Firestore and Realtime DB
- Compare the logs from test-created vs registrar-created students
`);

// Export for manual testing
if (typeof window !== 'undefined') {
  window.debugStudentCreation = debugStudentCreation;
}
