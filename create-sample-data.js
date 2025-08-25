// Create sample unit and semester plan for testing
import admin from 'firebase-admin';
import serviceAccount from './api-server/serviceAccountKey.js';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://newy-35816-default-rtdb.firebaseio.com/'
  });
}

const db = admin.firestore();

async function createSampleData() {
  console.log('🚀 Creating sample unit and semester plan...\n');

  try {
    // 1. Create a sample unit
    console.log('1. Creating sample unit...');
    const unitData = {
      code: 'CS101',
      name: 'Introduction to Computer Science',
      credits: 3,
      semester: 'Semester 1',
      department: 'Computer Science',
      level: 'Level 1',
      description: 'Basic concepts of computer science and programming',
      status: 'active',
      lecturerId: 'sample-lecturer-id',
      lecturer: 'Dr. Sample Lecturer',
      nextClass: 'Mon 9:00 AM',
      progress: 0,
      createdAt: new Date(),
      createdBy: 'system'
    };

    const unitRef = await db.collection('units').add(unitData);
    console.log('✅ Sample unit created with ID:', unitRef.id);

    // 2. Create a semester plan for this unit
    console.log('\\n2. Creating semester plan...');
    const semesterPlan = {
      unitId: unitRef.id,
      semesterStart: new Date('2025-02-01'),
      semesterWeeks: 15,
      weekPlans: [
        {
          weekNumber: 1,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-07'),
          weekMessage: 'Welcome to Computer Science! This week we cover basics.',
          materials: [
            {
              id: 'material-1',
              title: 'Course Introduction Slides',
              description: 'Overview of the course structure and objectives',
              isVisible: true, // This makes it visible to students
              type: 'slides'
            },
            {
              id: 'material-2', 
              title: 'Programming Basics Handout',
              description: 'Basic programming concepts and terminology',
              isVisible: true,
              type: 'handout'
            }
          ],
          assignments: [
            {
              id: 'assignment-1',
              title: 'Hello World Program',
              description: 'Write your first program that prints Hello World',
              assignDate: new Date('2025-02-01'),
              dueDate: new Date('2025-02-08'),
              type: 'programming'
            }
          ],
          exams: []
        },
        {
          weekNumber: 2,
          startDate: new Date('2025-02-08'),
          endDate: new Date('2025-02-14'),
          weekMessage: 'This week we dive into variables and data types.',
          materials: [
            {
              id: 'material-3',
              title: 'Variables and Data Types',
              description: 'Understanding different data types in programming',
              isVisible: true,
              type: 'notes'
            }
          ],
          assignments: [],
          exams: []
        }
      ],
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    };

    const planRef = await db.collection('semester_plans').add(semesterPlan);
    console.log('✅ Semester plan created with ID:', planRef.id);

    console.log('\\n🎉 Sample data created successfully!');
    console.log('📋 Summary:');
    console.log('- Unit ID:', unitRef.id);
    console.log('- Unit Code:', unitData.code);
    console.log('- Plan ID:', planRef.id);
    console.log('- Week Plans:', semesterPlan.weekPlans.length);
    console.log('- Visible Materials:', semesterPlan.weekPlans.reduce((total, week) => 
      total + week.materials.filter(m => m.isVisible).length, 0));

    console.log('\\n🔍 Test the student view:');
    console.log('1. Login as a student');
    console.log('2. Navigate to "My Units"');
    console.log('3. The unit should now appear');
    console.log('4. Click on the unit to see the semester plan');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }

  process.exit(0);
}

createSampleData();
