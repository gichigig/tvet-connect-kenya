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

async function getAvailableCourses() {
  try {
    console.log('📚 Fetching courses from database...');
    
    // Get courses from Firestore (where registrar-created courses are stored)
    const coursesSnapshot = await db.collection('courses').get();
    
    if (coursesSnapshot.empty) {
      console.log('❌ No courses found in Firestore');
      return [];
    }
    
    const courses = [];
    coursesSnapshot.forEach((doc) => {
      const courseData = doc.data();
      courses.push({
        id: doc.id,
        name: courseData.name || courseData.title || 'Unnamed Course',
        department: courseData.department || 'General',
        level: courseData.level || 'Certificate',
        duration: courseData.duration || 'Not specified',
        ...courseData
      });
    });
    
    console.log(`✅ Found ${courses.length} courses in database`);
    courses.forEach(course => {
      console.log(`   - ${course.name} (ID: ${course.id}) - ${course.department} Department`);
    });
    
    return courses;
    
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    return [];
  }
}

async function createTestStudent() {
  try {
    console.log('🧪 Creating test student with registrar-created course...\n');
    
    // First, get available courses from the database
    const availableCourses = await getAvailableCourses();
    
    if (availableCourses.length === 0) {
      console.log('❌ No courses available. Please create courses first through the registrar interface.');
      return;
    }
    
    // Look for the "read" course first, or use the first available course
    let selectedCourse = availableCourses.find(course => 
      course.name.toLowerCase().includes('read')
    );
    
    if (!selectedCourse) {
      console.log('⚠️  "read" course not found, using first available course');
      selectedCourse = availableCourses[0];
    }
    
    console.log(`\n🎯 Selected Course: ${selectedCourse.name}`);
    console.log(`   ID: ${selectedCourse.id}`);
    console.log(`   Department: ${selectedCourse.department}`);
    console.log(`   Level: ${selectedCourse.level}\n`);
    
    const testStudent = {
      firstName: 'Test',
      lastName: 'Student', 
      email: 'test.student@tvet.ac.ke',
      admissionNumber: 'TS2025001',
      department: selectedCourse.department,
      course: selectedCourse.name, // Using actual course from database
      courseId: selectedCourse.id, // Course ID from database
      courseName: selectedCourse.name, // Ensure courseName is also set
      role: 'student',
      academicYear: '2025',
      semester: 'semester_1',
      approved: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    const password = 'TestPassword123';
    
    // 1. Check if student already exists
    console.log('1. Checking if student already exists...');
    const studentsRef = realtimeDb.ref('students');
    const emailSnapshot = await studentsRef.orderByChild('email').equalTo(testStudent.email).once('value');
    const admissionSnapshot = await studentsRef.orderByChild('admissionNumber').equalTo(testStudent.admissionNumber).once('value');
    
    if (emailSnapshot.exists()) {
      console.log('⚠️  Student with this email already exists. Cleaning up first...');
      const existingStudents = emailSnapshot.val();
      for (const [id, student] of Object.entries(existingStudents)) {
        await realtimeDb.ref(`students/${id}`).remove();
        console.log(`   Removed existing student: ${id}`);
      }
    }
    
    if (admissionSnapshot.exists()) {
      console.log('⚠️  Student with this admission number already exists. Cleaning up first...');
      const existingStudents = admissionSnapshot.val();
      for (const [id, student] of Object.entries(existingStudents)) {
        await realtimeDb.ref(`students/${id}`).remove();
        console.log(`   Removed existing student: ${id}`);
      }
    }
    
    // Clean up indexes
    const emailKey = testStudent.email.replace(/[.#$[\]]/g, '_');
    await realtimeDb.ref(`studentsByEmail/${emailKey}`).remove();
    await realtimeDb.ref(`studentsByAdmission/${testStudent.admissionNumber}`).remove();
    await realtimeDb.ref(`studentCredentials/${testStudent.admissionNumber}`).remove();
    
    // 2. Create student record in students collection
    console.log('2. Creating student in students collection...');
    const newStudentRef = studentsRef.push();
    const studentWithId = {
      ...testStudent,
      id: newStudentRef.key
    };
    
    await newStudentRef.set(studentWithId);
    console.log(`✅ Student created with ID: ${newStudentRef.key}`);
    
    // 3. Create email index
    console.log('3. Creating email index in studentsByEmail...');
    const emailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    await emailIndexRef.set(newStudentRef.key);
    console.log(`✅ Email index created: ${emailKey} -> ${newStudentRef.key}`);
    
    // 4. Create admission number index
    console.log('4. Creating admission number index...');
    const admissionRef = realtimeDb.ref(`studentsByAdmission/${testStudent.admissionNumber}`);
    await admissionRef.set(newStudentRef.key);
    console.log(`✅ Admission index created: ${testStudent.admissionNumber} -> ${newStudentRef.key}`);
    
    // 5. Create credentials
    console.log('5. Creating student credentials...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const credentialsRef = realtimeDb.ref(`studentCredentials/${testStudent.admissionNumber}`);
    await credentialsRef.set({
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Student credentials created');
    
    // 6. Test retrieval
    console.log('6. Testing student retrieval...');
    
    // Test by email
    const retrievedEmailRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    const retrievedEmailSnapshot = await retrievedEmailRef.once('value');
    
    if (retrievedEmailSnapshot.exists()) {
      const studentId = retrievedEmailSnapshot.val();
      const studentRef = realtimeDb.ref(`students/${studentId}`);
      const studentSnapshot = await studentRef.once('value');
      
      if (studentSnapshot.exists()) {
        const retrievedStudent = studentSnapshot.val();
        console.log(`✅ Successfully retrieved by email: ${retrievedStudent.firstName} ${retrievedStudent.lastName}`);
        console.log(`   Course: ${retrievedStudent.course} (ID: ${retrievedStudent.courseId})`);
        console.log(`   Department: ${retrievedStudent.department}`);
      }
    }
    
    // Test by admission number
    const retrievedAdmissionRef = realtimeDb.ref(`studentsByAdmission/${testStudent.admissionNumber}`);
    const retrievedAdmissionSnapshot = await retrievedAdmissionRef.once('value');
    
    if (retrievedAdmissionSnapshot.exists()) {
      const studentId = retrievedAdmissionSnapshot.val();
      console.log(`✅ Successfully retrieved by admission number: ${studentId}`);
    }
    
    // Test credentials
    const credSnapshot = await credentialsRef.once('value');
    if (credSnapshot.exists()) {
      const credentials = credSnapshot.val();
      const isValidPassword = await bcrypt.compare(password, credentials.password);
      console.log(`✅ Password verification: ${isValidPassword ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log('\n🎉 Test student created successfully!');
    console.log('\n📋 Test Student Details:');
    console.log(`   Name: ${testStudent.firstName} ${testStudent.lastName}`);
    console.log(`   Email: ${testStudent.email}`);
    console.log(`   Admission Number: ${testStudent.admissionNumber}`);
    console.log(`   Course: ${testStudent.course} (ID: ${testStudent.courseId})`);
    console.log(`   Department: ${testStudent.department}`);
    console.log(`   Password: ${password}`);
    console.log('\n🔓 You can now test login with these credentials in Grade Vault TVET!');
    console.log('\n💡 To create additional students with different courses:');
    availableCourses.forEach((course, index) => {
      if (course.id !== selectedCourse.id) {
        console.log(`   - Use course: ${course.name} (ID: ${course.id})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating test student:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
createTestStudent();
