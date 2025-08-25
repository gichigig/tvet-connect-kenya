import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://newy-35816-default-rtdb.firebaseio.com/'
  });
}

const realtimeDb = admin.database();

async function listCreatedStudents() {
  try {
    console.log('📋 Listing all created students with their courses...\n');
    
    const studentsRef = realtimeDb.ref('students');
    const studentsSnapshot = await studentsRef.once('value');
    
    if (!studentsSnapshot.exists()) {
      console.log('❌ No students found in the database');
      return;
    }
    
    const students = studentsSnapshot.val();
    const studentList = Object.entries(students).map(([id, student]) => ({
      id,
      ...student
    }));
    
    console.log(`✅ Found ${studentList.length} students in database:\n`);
    
    studentList.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
      console.log(`   📧 Email: ${student.email}`);
      console.log(`   🆔 Admission: ${student.admissionNumber}`);
      console.log(`   🎓 Course: ${student.course || student.courseName || 'N/A'}`);
      console.log(`   🏢 Department: ${student.department || 'N/A'}`);
      console.log(`   📅 Academic Year: ${student.academicYear || 'N/A'}`);
      console.log(`   📚 Semester: ${student.semester || 'N/A'}`);
      console.log(`   ✅ Approved: ${student.approved ? 'Yes' : 'No'}`);
      console.log(`   🔗 Course ID: ${student.courseId || 'N/A'}`);
      console.log(`   🕒 Created: ${student.createdAt || 'N/A'}`);
      console.log('   ' + '='.repeat(50));
    });
    
    // Check specifically for students with "read" course
    const readStudents = studentList.filter(student => 
      (student.course && student.course.toLowerCase().includes('read')) ||
      (student.courseName && student.courseName.toLowerCase().includes('read'))
    );
    
    if (readStudents.length > 0) {
      console.log('\n🎯 Students with "read" course:');
      readStudents.forEach(student => {
        console.log(`   - ${student.firstName} ${student.lastName} (${student.email})`);
        console.log(`     Course: ${student.course || student.courseName}`);
      });
    } else {
      console.log('\n⚠️  No students found with "read" course');
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Total students: ${studentList.length}`);
    console.log(`   Students with "read" course: ${readStudents.length}`);
    
    // Group by courses
    const courseGroups = {};
    studentList.forEach(student => {
      const courseName = student.course || student.courseName || 'Unknown';
      if (!courseGroups[courseName]) {
        courseGroups[courseName] = [];
      }
      courseGroups[courseName].push(student);
    });
    
    console.log('\n📚 Students by course:');
    Object.entries(courseGroups).forEach(([courseName, students]) => {
      console.log(`   ${courseName}: ${students.length} student(s)`);
      students.forEach(student => {
        console.log(`     - ${student.firstName} ${student.lastName} (${student.email})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error listing students:', error);
  } finally {
    process.exit(0);
  }
}

// Run the listing
listCreatedStudents();
