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
    const coursesSnapshot = await db.collection('courses').get();
    
    if (coursesSnapshot.empty) {
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
    
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

async function createStudentWithCourse(studentData, course, password) {
  try {
    const studentsRef = realtimeDb.ref('students');
    
    // Check if student already exists
    const emailSnapshot = await studentsRef.orderByChild('email').equalTo(studentData.email).once('value');
    const admissionSnapshot = await studentsRef.orderByChild('admissionNumber').equalTo(studentData.admissionNumber).once('value');
    
    // Clean up existing student if found
    if (emailSnapshot.exists()) {
      const existingStudents = emailSnapshot.val();
      for (const [id, student] of Object.entries(existingStudents)) {
        await realtimeDb.ref(`students/${id}`).remove();
      }
    }
    
    if (admissionSnapshot.exists()) {
      const existingStudents = admissionSnapshot.val();
      for (const [id, student] of Object.entries(existingStudents)) {
        await realtimeDb.ref(`students/${id}`).remove();
      }
    }
    
    // Clean up indexes
    const emailKey = studentData.email.replace(/[.#$[\]]/g, '_');
    await realtimeDb.ref(`studentsByEmail/${emailKey}`).remove();
    await realtimeDb.ref(`studentsByAdmission/${studentData.admissionNumber}`).remove();
    await realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`).remove();
    
    // Create student
    const newStudentRef = studentsRef.push();
    const studentWithId = {
      ...studentData,
      department: course.department,
      course: course.name,
      courseId: course.id,
      courseName: course.name,
      id: newStudentRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await newStudentRef.set(studentWithId);
    
    // Create indexes
    const emailIndexRef = realtimeDb.ref(`studentsByEmail/${emailKey}`);
    await emailIndexRef.set(newStudentRef.key);
    
    const admissionRef = realtimeDb.ref(`studentsByAdmission/${studentData.admissionNumber}`);
    await admissionRef.set(newStudentRef.key);
    
    // Create credentials
    const hashedPassword = await bcrypt.hash(password, 10);
    const credentialsRef = realtimeDb.ref(`studentCredentials/${studentData.admissionNumber}`);
    await credentialsRef.set({
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    
    console.log(`✅ Created student: ${studentData.firstName} ${studentData.lastName}`);
    console.log(`   Course: ${course.name} (${course.department})`);
    console.log(`   Email: ${studentData.email}`);
    console.log(`   Admission: ${studentData.admissionNumber}`);
    console.log(`   Password: ${password}`);
    console.log('   -------------------');
    
    return {
      student: studentWithId,
      course: course,
      password: password
    };
    
  } catch (error) {
    console.error(`❌ Error creating student ${studentData.firstName} ${studentData.lastName}:`, error);
    return null;
  }
}

async function createMultipleTestStudents() {
  try {
    console.log('🧪 Creating multiple test students with registrar-created courses...\n');
    
    // Get available courses
    const availableCourses = await getAvailableCourses();
    
    if (availableCourses.length === 0) {
      console.log('❌ No courses available. Please create courses first through the registrar interface.');
      return;
    }
    
    console.log(`📚 Found ${availableCourses.length} available courses:`);
    availableCourses.forEach(course => {
      console.log(`   - ${course.name} (${course.department})`);
    });
    console.log('');
    
    // Define test students
    const testStudents = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@tvet.ac.ke',
        admissionNumber: 'TS2025001',
        academicYear: '2025',
        semester: 'semester_1',
        role: 'student',
        approved: true,
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@tvet.ac.ke',
        admissionNumber: 'TS2025002',
        academicYear: '2025',
        semester: 'semester_1',
        role: 'student',
        approved: true,
        isActive: true
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@tvet.ac.ke',
        admissionNumber: 'TS2025003',
        academicYear: '2025',
        semester: 'semester_2',
        role: 'student',
        approved: true,
        isActive: true
      }
    ];
    
    const createdStudents = [];
    
    // Create students with different courses
    for (let i = 0; i < Math.min(testStudents.length, availableCourses.length); i++) {
      const student = testStudents[i];
      const course = availableCourses[i];
      const password = `Password${i + 1}23`;
      
      console.log(`Creating student ${i + 1}/${Math.min(testStudents.length, availableCourses.length)}...`);
      
      const result = await createStudentWithCourse(student, course, password);
      if (result) {
        createdStudents.push(result);
      }
    }
    
    // If we have more courses than students, use the "read" course if available
    const readCourse = availableCourses.find(course => 
      course.name.toLowerCase().includes('read')
    );
    
    if (readCourse && createdStudents.length < availableCourses.length) {
      console.log('Creating additional student with "read" course...');
      const readStudent = {
        firstName: 'Read',
        lastName: 'Student',
        email: 'read.student@tvet.ac.ke',
        admissionNumber: 'TS2025004',
        academicYear: '2025',
        semester: 'semester_1',
        role: 'student',
        approved: true,
        isActive: true
      };
      
      const result = await createStudentWithCourse(readStudent, readCourse, 'ReadPassword123');
      if (result) {
        createdStudents.push(result);
      }
    }
    
    console.log('\n🎉 Student creation completed!');
    console.log(`📊 Created ${createdStudents.length} students\n`);
    
    console.log('📋 Login Credentials Summary:');
    console.log('============================');
    createdStudents.forEach((item, index) => {
      console.log(`${index + 1}. ${item.student.firstName} ${item.student.lastName}`);
      console.log(`   Email: ${item.student.email}`);
      console.log(`   Password: ${item.password}`);
      console.log(`   Course: ${item.course.name}`);
      console.log(`   Department: ${item.course.department}`);
      console.log('   -------------------');
    });
    
    console.log('\n🔓 You can now test login with any of these credentials in Grade Vault TVET!');
    
  } catch (error) {
    console.error('❌ Error creating test students:', error);
  } finally {
    process.exit(0);
  }
}

// Run the creation
createMultipleTestStudents();
