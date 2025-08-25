import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://newy-35816-default-rtdb.firebaseio.com/'
  });
}

const db = admin.firestore();

async function listAvailableCourses() {
  try {
    console.log('🔍 Checking courses created by registrars...\n');
    
    // Get courses from Firestore (where registrar-created courses are stored)
    const coursesSnapshot = await db.collection('courses').get();
    
    if (coursesSnapshot.empty) {
      console.log('❌ No courses found in Firestore');
      return [];
    }
    
    const courses = [];
    console.log('📚 Available Courses:');
    console.log('==================');
    
    coursesSnapshot.forEach((doc) => {
      const courseData = doc.data();
      courses.push({
        id: doc.id,
        ...courseData
      });
      
      console.log(`🎓 Course ID: ${doc.id}`);
      console.log(`   Name: ${courseData.name || courseData.title || 'Unnamed Course'}`);
      console.log(`   Department: ${courseData.department || 'N/A'}`);
      console.log(`   Level: ${courseData.level || 'N/A'}`);
      console.log(`   Duration: ${courseData.duration || 'N/A'}`);
      console.log(`   Created: ${courseData.createdAt || 'N/A'}`);
      console.log('   -------------------');
    });
    
    console.log(`\n📊 Total courses found: ${courses.length}`);
    
    // Look for the "read" course specifically
    const readCourse = courses.find(course => 
      (course.name && course.name.toLowerCase().includes('read')) ||
      (course.title && course.title.toLowerCase().includes('read'))
    );
    
    if (readCourse) {
      console.log('\n🎯 Found "read" course:');
      console.log(`   ID: ${readCourse.id}`);
      console.log(`   Name: ${readCourse.name || readCourse.title}`);
      console.log(`   Department: ${readCourse.department || 'N/A'}`);
    } else {
      console.log('\n⚠️  "read" course not found. Available courses listed above.');
    }
    
    return courses;
    
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    return [];
  }
}

// Run the check
listAvailableCourses().then(() => {
  process.exit(0);
});
