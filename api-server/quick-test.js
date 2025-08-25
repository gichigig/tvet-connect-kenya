// Simple Grade Vault TVET Login Test
import fetch from 'node-fetch';

console.log('🎓 GRADE VAULT TVET - FINAL LOGIN TEST');
console.log('=' .repeat(50));

async function quickTest() {
  try {
    // Test the main login endpoint used by Grade Vault TVET
    const response = await fetch('http://localhost:3001/api/auth/student-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'development-key-2024'
      },
      body: JSON.stringify({
        email: 'read.student@tvet.ac.ke',
        password: 'student123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Grade Vault TVET login is working!');
      console.log(`👤 Student: ${data.student.firstName} ${data.student.lastName}`);
      console.log(`📚 Course: ${data.student.course}`);
      console.log(`🆔 Admission: ${data.student.admissionNumber}`);
      console.log(`🔑 Token: ${data.token ? 'Generated successfully' : 'Missing'}`);
      console.log('\n🎉 READY FOR FRONTEND TESTING!');
      console.log('📱 Open your Grade Vault TVET frontend and login with:');
      console.log('   Email: read.student@tvet.ac.ke');
      console.log('   Password: student123');
    } else {
      console.log('❌ Login failed:', response.status);
      console.log('Error:', await response.text());
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

quickTest();
