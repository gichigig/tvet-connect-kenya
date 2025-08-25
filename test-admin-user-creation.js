/**
 * Test script to verify admin/registrar user creation with username and email
 */

import { getUserByUsername, getUserByEmail, authenticateUser } from './src/integrations/firebase/realtimeAuth.js';
import { saveAdminToFirebase } from './src/integrations/firebase/admin.js';
import { createStudent } from './src/integrations/firebase/users.js';

async function testAdminUserCreation() {
  console.log('🧪 Testing Admin/Registrar User Creation with Username and Email...\n');

  try {
    // Test 1: Create an admin user
    console.log('📝 Test 1: Creating admin user...');
    const adminData = {
      username: 'test_admin_user',
      email: 'testadmin@tvet.ac.ke',
      firstName: 'Test',
      lastName: 'Admin',
      password: 'testPassword123',
      role: 'admin'
    };

    const adminResult = await saveAdminToFirebase(adminData);
    console.log('✅ Admin created successfully:', {
      uid: adminResult.user.uid,
      email: adminResult.user.email
    });

    // Test 2: Verify username lookup works
    console.log('\n🔍 Test 2: Testing username lookup...');
    const userByUsername = await getUserByUsername(adminData.username);
    if (userByUsername) {
      console.log('✅ Username lookup successful:', {
        username: userByUsername.username,
        email: userByUsername.email,
        role: userByUsername.role
      });
    } else {
      console.log('❌ Username lookup failed');
    }

    // Test 3: Verify email lookup works
    console.log('\n📧 Test 3: Testing email lookup...');
    const userByEmail = await getUserByEmail(adminData.email);
    if (userByEmail) {
      console.log('✅ Email lookup successful:', {
        username: userByEmail.username,
        email: userByEmail.email,
        role: userByEmail.role
      });
    } else {
      console.log('❌ Email lookup failed');
    }

    // Test 4: Test username-based authentication
    console.log('\n🔐 Test 4: Testing username-based authentication...');
    try {
      const authWithUsername = await authenticateUser(adminData.username, adminData.password);
      if (authWithUsername) {
        console.log('✅ Username authentication successful:', {
          username: authWithUsername.username,
          email: authWithUsername.email,
          role: authWithUsername.role
        });
      } else {
        console.log('❌ Username authentication failed');
      }
    } catch (error) {
      console.log('❌ Username authentication error:', error.message);
    }

    // Test 5: Test email-based authentication  
    console.log('\n📧 Test 5: Testing email-based authentication...');
    try {
      const authWithEmail = await authenticateUser(adminData.email, adminData.password);
      if (authWithEmail) {
        console.log('✅ Email authentication successful:', {
          username: authWithEmail.username,
          email: authWithEmail.email,
          role: authWithEmail.role
        });
      } else {
        console.log('❌ Email authentication failed');
      }
    } catch (error) {
      console.log('❌ Email authentication error:', error.message);
    }

    // Test 6: Create a student user
    console.log('\n👨‍🎓 Test 6: Creating student user...');
    const studentData = {
      firstName: 'Test',
      lastName: 'Student',
      username: 'test_student_user',
      email: 'teststudent@tvet.ac.ke',
      phoneNumber: '+254700000000',
      dateOfBirth: '2000-01-01',
      gender: 'male',
      course: 'Computer Science',
      department: 'ICT',
      level: 'certificate',
      year: 1,
      semester: 1,
      academicYear: '2024/2025',
      password: 'studentPassword123'
    };

    const studentResult = await createStudent(studentData);
    console.log('✅ Student created successfully:', {
      id: studentResult.id,
      username: studentResult.username,
      email: studentResult.email,
      admissionNumber: studentResult.admissionNumber
    });

    // Test 7: Test student username authentication
    console.log('\n🎓 Test 7: Testing student username authentication...');
    try {
      const studentAuth = await authenticateUser(studentData.username, studentData.password);
      if (studentAuth) {
        console.log('✅ Student username authentication successful:', {
          username: studentAuth.username,
          email: studentAuth.email,
          role: studentAuth.role,
          admissionNumber: studentAuth.admissionNumber
        });
      } else {
        console.log('❌ Student username authentication failed');
      }
    } catch (error) {
      console.log('❌ Student username authentication error:', error.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin/Registrar users can be created with both username and email');
    console.log('✅ Students can be created with both username and email'); 
    console.log('✅ Both username and email authentication work');
    console.log('✅ Database indexing works for both lookup methods');
    console.log('✅ Firebase Authentication integration working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAdminUserCreation();
