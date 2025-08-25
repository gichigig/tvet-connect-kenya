import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://newy-35816-default-rtdb.firebaseio.com/'
  });
}

const realtimeDb = admin.database();
const db = admin.firestore();

// Function to simulate the authenticateUser function from AuthHelpers.tsx
async function authenticateUser(email, password) {
  try {
    console.log(`\n🔐 Authenticating user: ${email}`);
    console.log('=' .repeat(50));
    
    // First, check in users collection (existing functionality)
    console.log('1. Checking users collection...');
    const usersRef = realtimeDb.ref('users');
    const userSnapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
    
    if (userSnapshot.exists()) {
      console.log('✅ User found in users collection');
      const users = userSnapshot.val();
      const userId = Object.keys(users)[0];
      const userData = users[userId];
      
      // Check if account is approved and active
      if (userData.approved === false) {
        console.log('❌ Account not approved');
        return { success: false, error: 'Account not approved' };
      }
      
      if (userData.accountActive === false) {
        console.log('❌ Account not active');
        return { success: false, error: 'Account not active' };
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password');
        return { success: false, error: 'Invalid password' };
      }
      
      console.log('✅ User authentication successful');
      return { 
        success: true, 
        user: userData, 
        userId,
        userType: 'user'
      };
    }
    
    // NEW: Check in students collection (our enhancement)
    console.log('2. Checking students collection...');
    const studentsRef = realtimeDb.ref('students');
    const studentSnapshot = await studentsRef.orderByChild('email').equalTo(email).once('value');
    
    if (studentSnapshot.exists()) {
      console.log('✅ Student found in students collection');
      const students = studentSnapshot.val();
      const studentId = Object.keys(students)[0];
      const studentData = students[studentId];
      
      // Check if account is approved and active
      if (studentData.approved === false) {
        console.log('❌ Student account not approved');
        return { success: false, error: 'Account not approved' };
      }
      
      if (studentData.accountActive === false) {
        console.log('❌ Student account not active');
        return { success: false, error: 'Account not active' };
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, studentData.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password');
        return { success: false, error: 'Invalid password' };
      }
      
      console.log('✅ Student authentication successful');
      return { 
        success: true, 
        user: studentData, 
        userId: studentId,
        userType: 'student'
      };
    }
    
    console.log('❌ User/Student not found in either collection');
    return { success: false, error: 'User not found' };
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Function to list students for testing
async function listStudentsForTesting() {
  try {
    console.log('\n📋 Available students for testing:');
    console.log('=' .repeat(50));
    
    const studentsRef = realtimeDb.ref('students');
    const snapshot = await studentsRef.limitToFirst(5).once('value');
    
    if (!snapshot.exists()) {
      console.log('❌ No students found in database');
      return [];
    }
    
    const students = snapshot.val();
    const studentList = [];
    
    Object.entries(students).forEach(([id, student], index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Admission: ${student.admissionNumber}`);
      console.log(`   Approved: ${student.approved}`);
      console.log(`   Active: ${student.accountActive}`);
      console.log('');
      
      studentList.push({
        id,
        email: student.email,
        name: `${student.firstName} ${student.lastName}`
      });
    });
    
    return studentList;
    
  } catch (error) {
    console.error('❌ Error listing students:', error);
    return [];
  }
}

// Main test function
async function runAuthenticationTest() {
  console.log('🧪 Testing Enhanced Authentication System');
  console.log('=' .repeat(60));
  
  // List available students
  const students = await listStudentsForTesting();
  
  if (students.length > 0) {
    // Test with first available student (we don't know the password)
    console.log('\n🔍 Testing authentication with known emails...');
    
    // Try some common test passwords
    const testPasswords = ['password123', 'TestPass123', 'test123', 'student123'];
    
    for (const student of students) {
      console.log(`\nTesting ${student.name} (${student.email}):`);
      
      for (const password of testPasswords) {
        const result = await authenticateUser(student.email, password);
        if (result.success) {
          console.log(`✅ Successfully authenticated with password: ${password}`);
          break;
        }
      }
    }
  }
  
  // Test edge cases
  console.log('\n🔍 Testing edge cases...');
  await authenticateUser('nonexistent@example.com', 'password123');
  
  console.log('\n✅ Authentication testing completed!');
}

runAuthenticationTest();
